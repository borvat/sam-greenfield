#!/usr/bin/env python3
"""Explicit owner invocation only. Never accepts a credential argument or environment override."""
import getpass, json, os, pathlib, resource, subprocess, sys, warnings

def main():
    if len(sys.argv) != 1 or not sys.stdin.isatty() or not sys.stdout.isatty():
        raise RuntimeError('INTERACTIVE_OWNER_TERMINAL_REQUIRED')
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    runner = pathlib.Path(__file__).with_name('owner-setup.ts').resolve()
    command = ['node', '--import', 'tsx', str(runner)]
    # No prompt until restricted-runtime identity and target pass read-only checks.
    subprocess.run(command + ['preflight'], check=True)
    if input('Both services paused, exclusive window secured, rollback recorded? Type APPLY: ') != 'APPLY':
        raise RuntimeError('SETUP_CANCELLED')
    with warnings.catch_warnings():
        warnings.simplefilter('error', getpass.GetPassWarning)
        connection = getpass.getpass('Existing database administrator URL (hidden; never paste in chat): ')
    if not connection:
        raise RuntimeError('ADMIN_CONNECTION_REQUIRED')
    # Anonymous pipe only. Not argv, environment, file, shell history, or logs.
    child = subprocess.run(command + ['apply'], input=json.dumps({'connection': connection}),
                           text=True, check=False)
    connection = None
    return child.returncode

if __name__ == '__main__':
    try:
        sys.exit(main())
    except BaseException as error:
        if isinstance(error, SystemExit):
            raise
        print('SETUP_STOPPED: no automatic retry; inspect sanitized phase receipt.', file=sys.stderr)
        sys.exit(1)
