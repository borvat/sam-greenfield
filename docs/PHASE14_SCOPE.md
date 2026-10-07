# Phase 14 — e-Boekhouden Read Adapter + Finance Verification

## Objective
Add real read-only e-Boekhouden production capabilities for QNAN accounting visibility without allowing automatic finance writes.

## Public provider contract
e-Boekhouden SOAP endpoint:
- https://soap.e-boekhouden.nl/soap.asmx
- Session flow: OpenSession -> read calls -> CloseSession
- Read functions used here: GetFacturen, GetMutaties, GetOpenPosten

## Initial capabilities
- eboekhouden_get_invoices — GREEN, read-only
- eboekhouden_get_mutations — GREEN, read-only
- eboekhouden_get_open_items — GREEN, read-only

## Invariants
- No AddFactuur, AddMutatie, Update*, delete, payment, tax, or bank write capability is added.
- Credentials come only from environment variables.
- Username/SecurityCode1/SecurityCode2 are never persisted in audit/model/tool results.
- SOAP sessions are always closed in finally blocks after a successful OpenSession.
- Read tools use bounded filters only.
- Mutations are capped by provider behavior and SAM request constraints.
- Independent verification repeats the provider read, rather than trusting execution payload.
- Finance remains read/analyze unless a later explicitly approved write phase is built.
