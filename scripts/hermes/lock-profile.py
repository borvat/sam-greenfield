"""Operator-only reduction of the existing isolated Hermes profile. No secrets printed.

Uses a deliberately small YAML block editor; refuses unexpected structure. The
native API readback after gateway replacement remains the acceptance test.
"""
import hashlib
import os
from pathlib import Path
import re


def replace_section(text, key, replacement):
    pattern = re.compile(r"(?ms)^" + re.escape(key) + r":[^\n]*\n.*?(?=^[A-Za-z_][A-Za-z0-9_]*:|\Z)")
    matches = list(pattern.finditer(text))
    if len(matches) > 1:
        raise ValueError("DUPLICATE_POLICY_SECTION")
    return pattern.sub(lambda _: replacement + "\n", text, count=1) if matches else text.rstrip() + "\n" + replacement + "\n"


def constrain(text):
    if not re.search(r'^  default: ["\']?poolside/laguna-s-2[.]1:free["\']?\s*$', text, re.M):
        raise ValueError("FREE_MODEL_REQUIRED")
    if not re.search(r'^  provider: ["\']?nous["\']?\s*$', text, re.M):
        raise ValueError("NOUS_PROVIDER_REQUIRED")
    # Only the API surface is in use in this isolated service. No alternate
    # platforms are enabled; leaving their defaults reachable is not useful.
    text = replace_section(text, "platform_toolsets", "platform_toolsets:\n  api_server: []")
    text = replace_section(text, "mcp_servers", "mcp_servers: {}")
    text = replace_section(text, "fallback_model", "fallback_model: null")
    text = replace_section(text, "fallback_providers", "fallback_providers: []")
    text, count = re.subn(r'(?m)^(    max_concurrent_runs:)\s*\d+\s*$', r'\g<1> 1', text)
    if count != 1:
        raise ValueError("SINGLE_API_CONCURRENCY_SETTING_REQUIRED")
    if re.search(r'^\s+model_routes:\s*[^\n]+', text, re.M):
        raise ValueError("MODEL_ROUTES_REVIEW_REQUIRED")
    return text


def main():
    home = Path(os.environ.get("HERMES_HOME", ""))
    if home != Path("/opt/data"):
        raise ValueError("ISOLATED_HOME_REQUIRED")
    path = home / "config.yaml"
    original = path.read_text()
    locked = constrain(original)
    backup = home / "sam-hermes-pre-lock-config.yaml"
    if not backup.exists():
        fd = os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as stream:
            stream.write(original)
    temp = home / "config.sam-lock.new"
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as stream:
        stream.write(locked)
        stream.flush()
        os.fsync(stream.fileno())
    temp.replace(path)
    print('{"policyWritten":true,"effectiveToolsAcceptance":"PENDING_NATIVE_API_READBACK","maxConcurrency":1,"configSha256":"' + hashlib.sha256(locked.encode()).hexdigest() + '"}')


if __name__ == "__main__":
    main()
