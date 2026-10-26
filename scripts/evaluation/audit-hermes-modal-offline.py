"""Offline API/source audit only. Never authenticates or creates a cloud resource.

Use --sdk in a disposable venv with modal==1.6.2. Optionally pass
--hermes-root for a previously reviewed official Hermes checkout. Source probes
extract two functions and supply synthetic dependencies; they are NOT isolation
tests, code verification, or permission to enable tools.
"""
import argparse
import ast
import importlib.metadata
import inspect
import json
import pathlib
import sys
import types


def sdk_audit():
    import modal

    required = {
        "block_network", "timeout", "cpu", "memory", "env", "secrets",
        "volumes", "network_file_systems", "include_oidc_identity_token",
    }
    assert required <= set(inspect.signature(modal.Sandbox.create).parameters)
    assert hasattr(modal.Sandbox.create, "aio")
    assert hasattr(modal.App.lookup, "aio")
    assert hasattr(modal.Sandbox, "terminate")
    return {"version": importlib.metadata.version("modal"),
            "required_options_present": True, "remote_method_calls": 0}


def extract(root, relative, name):
    path = root / relative
    tree = ast.parse(path.read_text())
    fn = next(n for n in tree.body
              if isinstance(n, ast.FunctionDef) and n.name == name)
    return compile(ast.Module(body=[fn], type_ignores=[]), str(path), "exec")


def source_audit(root):
    seen = {}

    def fake_backend(**kwargs):
        seen.update(kwargs)
        return kwargs

    scope = {
        "_resources": lambda cc: {"cpu": 1, "memory": 1024, "disk": 0,
                                  "persistent_filesystem": False},
        "_get_modal_backend_state": lambda mode: {"selected_backend": "direct"},
        "_ModalEnvironment": fake_backend,
        "_ManagedModalEnvironment": fake_backend,
    }
    exec(extract(root, "tools/terminal_tool_backends.py", "_build_modal_env"), scope)
    scope["_build_modal_env"](
        image="synthetic-image", cwd="/workspace", timeout=30,
        cc={"block_network": True, "sandbox_timeout": 600, "modal_mode": "direct"},
        task_id="synthetic-audit")
    options = seen["modal_sandbox_kwargs"]

    module_name = "tools.credential_files"
    old_module = sys.modules.get(module_name)
    synthetic = types.ModuleType(module_name)
    synthetic.get_credential_file_mounts = lambda: [{
        "host_path": "/synthetic/CANARY_ONLY",
        "container_path": "/root/.hermes/CANARY_ONLY"}]
    synthetic.iter_skills_files = lambda **kw: []
    synthetic.iter_cache_files = lambda **kw: []
    try:
        sys.modules[module_name] = synthetic
        sync_scope = {}
        exec(extract(root, "tools/environments/file_sync.py", "iter_sync_files"),
             sync_scope)
        files = sync_scope["iter_sync_files"]()
    finally:
        if old_module is None:
            sys.modules.pop(module_name, None)
        else:
            sys.modules[module_name] = old_module
    return {
        "source_extracted_probes": 2,
        "network_block_forwarded": options.get("block_network") is True,
        "sandbox_deadline_forwarded": options.get("timeout") == 600,
        "synthetic_registered_credential_synced": (
            "/synthetic/CANARY_ONLY", "/root/.hermes/CANARY_ONLY") in files,
        "real_credential_files_read": 0,
        "cloud_backend_instantiations": 0,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sdk", action="store_true")
    parser.add_argument("--hermes-root", type=pathlib.Path)
    args = parser.parse_args()
    if not args.sdk and args.hermes_root is None:
        parser.error("select --sdk and/or --hermes-root")
    result = {"kind": "OFFLINE_COMPATIBILITY_ONLY", "isolation_accepted": False}
    if args.sdk:
        result["sdk"] = sdk_audit()
    if args.hermes_root is not None:
        result["source"] = source_audit(args.hermes_root)
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
