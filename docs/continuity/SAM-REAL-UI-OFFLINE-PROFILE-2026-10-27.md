# Real UI offline boundary preparation — 2026-10-27

New unregistered modules prepare the exact two guest files without repository
synchronization, dependency installation or cloud imports. Original UI source and
immutable verifier are unchanged. The profile fixes network blocking, absence
of credentials/mounts/tunnels, 0.5 CPU hard limit, 1024 MiB hard memory limit and
90-second maximum guest lifetime. No image has been built or admitted live.

A separate private SQLite journal records durable intent before guest creation.
An uncertain intent requires reconciliation and never automatic rerun. Completed
receipt readback does not create work. Both stages require distinct guest ids
and terminal cleanup before local acceptance can be recorded. One real-task
ceiling is separate from the closed accepted clamp journal, which was untouched.

Nine local tests passed, including actual abrupt exit of a synthetic controller
process and subsequent SQLite readback. No remote guest existed in that test;
it does not prove live controller-death cleanup, provider lookup, isolation or
receipt authenticity. Structural image-receipt checks accept trusted operator
input only and do not authenticate model-supplied claims.

The actual SDK controller, live image acceptance, provider reconciliation,
authenticated independent-verifier receipt and registered bounded publisher
remain unfinished. Dispatch and publisher activation remain disabled. No paid
compute, model call, image build, database mutation or deployment was initiated
by these offline modules. They are preparation, not execution admission.
