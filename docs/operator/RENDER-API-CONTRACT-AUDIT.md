# Render transport endpoint audit and correction

2026-10-23. This is a source/schema audit, not hosted acceptance. No Render credential or service was used.

## Confirmed defect

At aaf0e537246ba1af059e9e62df4c6817572fab53, groups() required `{envGroup,cursor}` for every GET /env-groups item. The endpoint OpenAPI instead specifies bare `envGroupMeta[]`, requiring id, name, ownerId, createdAt, updatedAt and serviceLinks. Replacing the simulator response with that official shape independently reproduced RENDER_GROUP_SHAPE_INVALID before launch. The original 16 passing tests therefore did not establish compatibility with this valid API response. Their evidence remains immutable, but that readiness conclusion is superseded.

The corrected parser validates bare endpoint objects and the alternate envelope described by Render's generic pagination documentation. Each page must have one homogeneous shape; all required group/link fields, workspace binding and unique IDs are checked. Only a documented envelope cursor is followed. A full bare page (100 objects) supplies no proven continuation token, so the transport refuses it with RENDER_GROUP_COMPLETENESS_UNPROVEN before mutation. It never substitutes a group ID for a cursor. Mixed shapes, missing envelope cursors, duplicate IDs, repeated cursors and the existing page bound fail closed.

## Independent sources

- [Published OpenAPI](https://api-docs.render.com/openapi/render-public-api-1.json): `/env-groups` GET 200 refers to an array of `#/components/schemas/envGroupMeta`.
- [Generic pagination documentation](https://api-docs.render.com/reference/pagination) describes resource/cursor envelopes. It does not define a continuation token for bare group objects. This documentation inconsistency is preserved as an explicit completeness boundary.
- Independently cloned the public official [render-oss/cli at 7129791ee688c7fb0622bef2f571298c1b682e9c](https://github.com/render-oss/cli/tree/7129791ee688c7fb0622bef2f571298c1b682e9c), without credentials. Its generated ListEnvGroupsResponse.GetJSON200 returns `*[]EnvGroupMeta`, confirming the endpoint schema rather than the old mock.
- `pkg/client/types_gen.go` SHA-256: dfa45c5b0456c9dca2dee11583387ddaa4123d738fb88a42658bc5c8d00106d6.
- `pkg/client/client_gen.go` SHA-256: b0032c8e8e9473145d6390d83fe603f3c6e733d85d117b0960b059415317a0db.

These hashes bind the official generated files inspected, not a claimed full download of the current OpenAPI. No generated provider client was installed as an application dependency.

## Every HTTP operation used

| Operation | Audited request/success shape | Outcome |
| --- | --- | --- |
| GET /services/{id} | Service object; identity, owner, autodeploy and suspension fields | Match; fixture now includes required top-level metadata |
| GET /env-groups | ownerId/limit/cursor query; bare envGroupMeta[] | Parser corrected; generic cursor envelope also validated; bare full page refuses incomplete snapshot |
| GET /services/{id}/env-vars | envVar/cursor envelopes | Match |
| GET /services/{id}/secret-files | secretFile/cursor envelopes | Match |
| GET /services/{id}/env-vars/{key} | Direct `{key,value}`; 404 absent | Match; inherited values are not materialized on restoration |
| PUT /services/{id}/env-vars/{key} | `{value}`; 200 envVar | Runtime matched; old simulator incorrectly used 201, now corrected |
| DELETE /services/{id}/env-vars/{key} | 204, no JSON body | Match |
| GET /services/{id}/secret-files/{name} | Direct `{name,content}`; 404 absent | Match |
| PUT /services/{id}/secret-files/{name} | `{content}`; 201 secretFile | Match |
| DELETE /services/{id}/secret-files/{name} | 204, no JSON body | Match |
| GET /services/{id}/instances | Bare serviceInstance[] | Match |
| GET /services/{id}/deploys | deploy/cursor envelopes; official deploy status enum | Match; runtime additionally requires meaningful status/commit/cursor evidence for safe operation |
| POST /services/{id}/deploys | `{buildId}` alone; 201 deploy or 202 queued | Match; added 202/no-body/queued-to-live regression |
| POST /services/{id}/suspend | 202, no body | Match |
| POST /services/{id}/resume | 202, no body | Match |
| POST /services/{id}/rollback | `{deployId}`; 201 deploy | Match |

`tests/fixtures/renderWireContracts.ts` independently transcribes the transport-used wire fields, required top-level metadata, enums and selected request forms from these sources. The simulated server validates those before returning success. This is deliberately **not** advertised as a complete OpenAPI validator: for example serviceDetails is an opaque record and optional deployment fields are subject to stronger runtime admission requirements. Fault-response tests explicitly inject malformed/alternate shapes instead of disguising them as endpoint fixtures.

The 22 focused tests include every prior scenario, the official bare shape, malformed required metadata, bare full-page refusal, opaque-cursor continuation, mixed/cursorless/duplicate responses, repeated cursor refusal and queued deployment. Hosted suspend/build/rollback/resume semantics, actual effective restoration and latency remain unchanged acceptance gates. No authorization, deployment interlock, deadline or budget changed.
