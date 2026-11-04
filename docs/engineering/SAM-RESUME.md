# SAM — نقطة استئناف هندسية

> آخر تحديث: 2026-11-04T04:30Z · تُقرأ هذه الوثيقة أولاً في أي محادثة جديدة قبل أي عمل على SAM.
> كل بند موسوم: **[مثبت]** قرأته/نفّذته بنفسي، **[تقرير مالك]** ورد من المالك ولم أُعد فحصه، **[لم يُفحص]** لم أتحقق منه.

---

## 1) المستودع وحالة العمل

| البند | القيمة |
|---|---|
| مسار المشروع | `C:/Users/Zulik/sam-audit` |
| المستودع | `borvat/sam-greenfield` |
| الفرع | `feat/command-center-2-20261103` |
| HEAD الكامل | `e8b23dc5b88c3f6e150e4332ac654e8385f779f6` **[مثبت]** |
| شجرة العمل | نظيفة — 0 ملف معدّل أو غير متتبع **[مثبت]** |
| آخر ثلاثة التزامات | `e8b23dc` (ops) → `26b386a` (verify evidence) → `d7e6aff` (contract types) |

سلالة العمل الكاملة لهذه المهمة:
`4896d6f` قياس الطلب باسم المهمة الحقيقي → `ea14197` المُدقِّق يُعيد حكماً دائماً → `00a7a0b` تسجيل غياب المُدقِّق → `6945250` تشخيص المرحلة وSQLSTATE → `d7e6aff` أنواع حقول العقد → `26b386a` الرموز والنجاح في الأدلة → `e8b23dc` سكربتات `ops/`.

---

## 2) الخدمات المنشورة

| الخدمة | معرّف الخدمة | الإصدار المخدوم | الحالة |
|---|---|---|---|
| `sam-runtime` | `srv-db37vbvlk1mc739o0b70` | `26b386a96f53f0e6e947adf51769275c0d8c9ae9` | `/livez` 200 · `/readyz` 200 **[مثبت 04:28Z]** |
| `sam-mcp` | `srv-db37vbvlk1mc739o0b7g` | `5311db5111e238e9a3553e2aba6d352e9e475a8a` | `/livez` 200 · 123 أداة · 401 بلا توكن **[مثبت]** |
| `sam-command-center` | `srv-db37vbvlk1mc739o0b6g` | `a7508caa674b469aa46294d64a621b06336706e4` | 200 · **مقصود بقاؤه متأخراً عن الرأس** **[مثبت]** |

عناوين: `https://sam-runtime.onrender.com` · `https://sam-mcp-cn7q.onrender.com` · `https://sam-command-center.onrender.com`

> الأمر `Deploy Latest` على Runtime أو MCP يعيد فرعاً قديماً (`delivery/sam-reliability-reviewed-20261028` @ `1e4e21a`). **لا تستخدمه.** النشر دائماً بالـSHA الكامل عبر `render-deploy-svc.js`.

---

## 3) مهمة الموجز التنفيذي — مكتملة ومقبولة

| البند | القيمة | الوسم |
|---|---|---|
| الهدف | `dd6c6244-d40e-4c28-b6c4-3758ee63034d` · شركة `73aa81c6-3a23-4369-9408-8bea0956d399` | **[مثبت]** |
| حالة الهدف | `COMPLETED` (آخر تحديث `2026-11-04T04:21:35.713Z`) | **[مثبت]** قراءة MCP مباشرة |
| التنفيذ | `3e5a40f3-3a66-43a7-81b2-0a0c800ef08a` · `capability_id=executive_brief` · `status=EXECUTED` | **[مثبت]** |
| التحقق المستقل | `e8d8d827-4941-4ca3-a19c-9fcf3438230a` · **VERIFIED** · `verifier=executive-brief-attribution` · `checked_at 2026-11-04T04:21:35.713Z` | **[مثبت]** |
| callId | `3a307153-86eb-4d7f-a75c-769f1139d927` | **[مثبت]** |
| النموذج | `deepseek / deepseek-flash` · التكلفة المحسوبة `$0.001657` | **[مثبت]** |
| الموجز المحفوظ | `generatedAt 2026-11-04T03:25:20.996Z` · يُقرأ بـ`fromStore: true` | **[مثبت]** |
| القراءة عبر MCP | أداة `sam_executive_brief` على الخدمة المنشورة | **[مثبت]** |

### تفسير اختلاف الرموز (2124+850=2974 مقابل 1492) — **[مثبت]**
استعلام `model_calls` أعاد **صفين** لنفس callId، وكلاهما `success=true` ومنسوب للشركة الصحيحة:

| المحاولة | معرّف الصف | `tokens` | الزمن |
|---|---|---|---|
| 1 | `8bc60256-659c-42fe-97fc-f30d157c4c56` | 1482 | 03:25:18.399Z |
| 2 | `993d18a9-d74f-4f7a-9070-9db664f7ffa1` | 1492 | 03:25:20.991Z |

`1482 + 1492 = 2974` بالضبط = مجموع دليل التنفيذ. المحرك يسمح بمحاولتين ويجمع استهلاكهما في البطاقة، بينما مُدقّق التحقق يربط **آخر صف** (`order by created_at desc limit 1`) فيسجّل 1492. `cost = 0` في الصفّين لأن صف المزوّد بلا أسعار مسجّلة؛ التكلفة تُحسب من الرموز.

---

## 4) عقد التحقق في الإنتاج

الصف `executive_brief` بعد التصحيح **[مثبت]** بقراءة MCP (`sam_list_verification_contracts`):

| الحقل | القيمة |
|---|---|
| `id` | `c6c50d54-1065-4689-be06-8021d17ff06d` |
| `verification_method` | `db_query` |
| `must_not_trust_execution_result` | `true` |
| `required_evidence_fields` | `{callId:string, factsHash:string, provider:string, model:string, tokens:number, success:boolean}` |
| `independent_query_template` | ربط على `model_calls.task like 'executive_briefing:'||$1||':%'` |

**الشرط الحرج:** نواة التحقق (`apps/kernel/src/verificationEvidence.ts`) تقبل الأنواع `string|number|boolean|object|array` فقط وتقارنها حرفياً. أي وصف بـ`uuid` أو `integer` يُفشل كل تحقق بـ`VERIFICATION_EVIDENCE_TYPE`. هذه كانت علّة التعطل.

الشروط المستقلة تبقى في المُدقّق نفسه: وجود الاستدعاء بالنص المحدد، `success=true`، `tokens>0`، مطابقة `legal_entity_id` لشركة الجلسة، ومطابقة `factsHash` لموجز محفوظ.

**RLS:** الصف كُتب ضمن معاملة واحدة أنشأت سياسة مؤقتة ضيقة ثم حذفتها. **[تقرير مالك]** `committed=true` وكل الفحوص صحيحة. **[مثبت]** حالة الجدول الآن: `RLS=true`، `FORCE=true`، السياسة الوحيدة `contracts_read:SELECT` — لا سياسات مؤقتة متبقية.

---

## 5) التفعيل والميزانية

| الإعداد | القيمة | الموضع |
|---|---|---|
| `SAM_EXECUTIVE_BRIEF_ENABLED` | `1` | Runtime فقط **[مثبت]** |
| `SAM_BRIEFING_BUDGET_USD` | `0.006` | Runtime وMCP وCommand Center **[مثبت]** |
| نافذة الاحتساب | 24 ساعة متحركة، سجل `model_calls` واحد لكل شركة عبر الخدمات | الكود |
| سقوف إضافية | 6 استدعاءات/ساعة · محاولتان كأقصى · منع توازٍ · كاش 10 دقائق · أرضية 60 ثانية | الكود |
| السجل | لم يُصفَّر في أي مرحلة **[مثبت]** من قراءات المصروف المتتابعة | |

> ‏`0.006` لا تكفي موجزاً كاملاً بعد استهلاك جزء من النافذة؛ عند النقص يُخدَم الموجز المحفوظ بدل الفشل، و`fresh:true` يُرفض بسبب واضح (`BUDGET_TOO_SMALL_FOR_FACTS`). أي رفع يحتاج قرار المالك.

---

## 6) الملفات المهمة

| الملف | الدور |
|---|---|
| `packages/executive-brief/src/briefing.ts` | المحرك: الحقائق، الميزانية، الحجز، الاستدعاء، التحقق، التشخيص، حفظ الموجز |
| `packages/executive-brief/src/{factsBudget,promptBound,jsonOutput,briefStore}.ts` | ضغط الحقائق، حد الطلب بالبايتات، تحليل JSON، قراءة/كتابة الموجز في `audit_log` |
| `apps/production/src/executiveBriefCapability.ts` | تسجيل القدرة + المُدقّق + عقد التحقق + تهيئة العقد |
| `apps/production/src/composition.ts` | ترتيب النبضة + تشخيص المرحلة المنقّح (stage/code/reason) |
| `apps/production/src/verifier.ts` | اختيار التنفيذ للتحقق + حراسة أخطاء المُدقّق + تسجيل غياب المُدقّق |
| `apps/production/src/defaultBundleModule.ts` | تركيب الحزمة (تفعيل القدرة شرطياً بـ`SAM_EXECUTIVE_BRIEF_ENABLED`) |
| `apps/chatgpt-tools/src/briefingTools.ts` | أداة MCP `sam_executive_brief` |
| `apps/runtime/src/productionCompositionModule.ts` | تهيئة العقد عند الإقلاع |
| `ops/executive-brief-*.cjs` | سكربتات التهيئة/التصحيح الإدارية (تُشغَّل من Render Shell) |
| `tests/isolated/{executive_brief_capability,executive_brief_verification,mcp_briefing_tool,facts_budget,prompt_bound,json_output,briefing_rejection}.ts` | الاختبارات المعنية |

---

## 7) أوامر التشغيل والتحقق

```bash
# الحالة الحية (بلا أسرار)
curl -s https://sam-runtime.onrender.com/livez        # يتوقع 26b386a…
curl -s https://sam-mcp-cn7q.onrender.com/livez       # يتوقع 5311db5…
curl -s https://sam-command-center.onrender.com/livez # يتوقع a7508ca…

# نشر بالـSHA (لا Deploy Latest)
node <scratch>/render-deploy-svc.js srv-db37vbvlk1mc739o0b70 <full-sha> clear force

# قراءة عبر MCP (توكن الموصل أو توكن قصير من مخزن التوقيع)
#   sam_executive_brief            → الموجز المحفوظ بوقته ودليله
#   sam_executive_brief {fresh:true} → توليد جديد ضمن السقف
#   sam_list_verifications · sam_list_model_calls · sam_list_verification_contracts · sam_get_goal {id}

# الاختبارات المعنية فقط (لا البوابة)
node --import tsx --test tests/isolated/executive_brief_capability.ts
DATABASE_URL='postgres://…?options=-c%20app.current_legal_entity_id%3D<entity>' \
  node --import tsx --test tests/isolated/executive_brief_verification.ts
```

---

## 8) الموانع والقيود الحقيقية

1. **`cost = 0` في `model_calls`** — صف المزوّد بلا أسعار؛ المحاسبة تُقدَّر من الرموز. تعبئة `cost_per_1k_input/output` تصحّح السجل ولا تخفّض السعر. **[لم يُفحص]** أثر الفوترة الفعلية عند المزوّد على 503.
2. **دور Runtime لا يملك كتابة على `verification_contracts`** (SELECT فقط)، وأي تهيئة تحتاج اتصال المالك داخل Render Shell عبر المعاملة المؤقتة الموثقة في `ops/`.
3. **`sam-command-center` متأخر عن الرأس** — مقصود. بوابته تقارن إصدار اللوحة بالرأس، فلا تُستخدم لإغلاق عمل يخص Runtime/MCP.
4. **قدرة Runtime لا تملك نقطة HTTP للطلب** — الاستدعاء يمر عبر هدف أو عبر أداة MCP.
5. **[لم يُفحص]** ضمان أن مفتاح المزوّد داخل Runtime يأتي من مجموعة `sam-prod-models`؛ الدليل غير المباشر أن الاستدعاء نجح فعلاً.

---

## 9) المهمة التالية (تبدأ من هنا في الجلسة الجديدة)

**استكمال التسليم التلقائي لتقارير SAM إلى المالك، وإثبات وصول تقرير حقيقي إلى `ceo@surooholdings.com`، بالاعتماد على مسار التسليم والصلاحيات القائمة.**

- ابدأ **بفحص ما أُنجز فعلاً** في مسار التسليم قبل أي بناء: `apps/notifications/src/delivery.ts`، `apps/notifications/src/center.ts`، `apps/production/src/ownerReportEmailBundle.ts`، `apps/tools/src/gmailSendAdapter.ts`، ومتغيرات `SAM_OWNER_REPORT_EMAIL_*` و`SAM_GOOGLE_*` على الخدمات (أسماء فقط، بلا قيم).
- تحقق مما إذا كان المسار مفعّلاً على Runtime، وما الذي ينقص لوصول رسالة حقيقية، دون إعادة بناء ما هو قائم.
- معيار الإنجاز: تقرير حقيقي يصل إلى صندوق المالك مع أثر يمكن إثباته، لا مجرد نجاح استدعاء.
- الروتينات اليومية والأسبوعية **بعد** إغلاق التسليم، وليست ضمنه.

---

## 10) قيود ملزمة في الجلسة الجديدة

- لا إعادة فتح مهمة الموجز المكتملة، ولا إعادة استدعاء النموذج لاختبارها.
- لا إعادة تشغيل بوابة Command Center لعمل يخص Runtime/MCP.
- لا تغيير ميزانية، ولا صلاحيات، ولا أسرار، ولا موارد مدفوعة، ولا دمج خارج التفويض القائم.
- لا أسرار أو كلمات مرور أو توكنات أو روابط اتصال في هذا الملف.
- عند التسليم: ميّز بدقة بين **المثبت**، وما ورد **بتقرير** فقط، وما **لم يُفحص**.
