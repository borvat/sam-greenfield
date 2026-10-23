// Deliberate isolated cancellation immediately before the provider returns.
process.env.FIXTURE_CANCEL_ON_RETURN='1';
void import('./ordinaryPath');
