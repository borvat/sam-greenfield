# Total review input budget

Base: deployed `d08b1041c982c88bc43353a6ea4658c77d7a38df`.
The prior fix correctly aborts requests and resumes the remaining attempt, but
22,000 characters per source and numbered pretty-JSON lines can produce large
aggregate inputs. This patch does not claim a token-level timeout cause or a
provider defect. Combined audit token usage is not an input-token measurement.

The deterministic source projector now shares 16,000 characters equally across
all verified sources (maximum 20). Existing essential metadata, totals, period,
coverage, limitations and explicit omission counts remain protected. An essential
source that cannot fit its share blocks honestly; unused shares are not borrowed.
No quantities or prices are calculated from sampled detail. Evidence is not
silently sliced to fit a request.

Reviewer observations use string arrays, with zero-based array positions as
quoteLine, rather than an index/text object for every pretty-JSON line. Indentation
is removed for display; runtime quotation mapping retains the original source
lines, so exact-quote and knowledge provenance checks are unchanged. All capability
schemas and authorization checks remain available for authorized follow-up reads.

Before either proposal or critique, the complete UTF-8 serialized provider task
prompt (using the existing taskPrompt wrapper) must fit 48,000 bytes. This includes
objective, source provenance/lines, limitations, schemas, history, validation
feedback and proposed report. It is a byte ceiling, not a token estimate; HTTP
request-envelope encoding is not model context. Oversized requests never invoke
the model or consume a call reservation, do not schedule a futile same-input
retry, and persist REVIEW_INPUT_BUDGET_EXCEEDED in an incomplete report. Successful
call phase events record only promptBytes alongside existing safe timing codes.

Per-call deadline remains 40 seconds; two attempts/four calls and model choice are
unchanged. No legacy goal is replayed, no budget reset is introduced, and no
permissions or acceptance contracts change.

## Separate monetary source gap

The parent's completed live diagnosis found quantity/stock analysis, order-list
objects without prices, and no invoice results. These sources do not establish
EUR revenue or VAT. Input compaction cannot supply absent evidence. The runtime
still rejects monetary completion without matching-period explicit amount, EUR,
recognized VAT basis and complete coverage. The limitation now identifies the
needed authorized order-level monetary evidence and coverage; a valid follow-up
read remains possible, while unsupported completion remains blocked.

Repository inspection: `bol_get_order` is GREEN/read-only, accepts `order_id`, and
passes through GET `/orders/{id}` with independent readback. Its standard contract
only documents “Read details of one retailer order”; the client returns
`Promise<any>`, with no declared output price/currency/VAT fields. Thus this local
contract cannot guarantee monetary evidence. This is not proof that the upstream
API lacks money fields. No new financial calculation, API capability, live read
or external financial assumption was introduced. Even returned order prices would
need explicit VAT/currency semantics and complete requested-period coverage.

Regression coverage includes four realistic large source shapes, twenty sources,
proposal and critique byte ceilings including Unicode/escaping, zero calls for
oversized input, no critique call for oversized reports, preserved provenance and
essential metadata/omissions, missing-money honesty, existing authorized read
continuation and exact source citation behavior. Full acceptance must be recorded
against the final clean application commit; synthetic success is not live success.
