// Same ordinary startup/submission/worker fixture, zero source/readback allowance.
process.env.FIXTURE_ZERO_TOOLS='1';
void import('./ordinaryPath');
