# تسليم تقارير SAM إلى المالك: حالة المسار والموانع

> لقطة: `2026-11-04T05:04:27Z` · الفرع `feat/command-center-2-20261103` · الالتزام `6b0368b`
> العنوان المعتمد: `ceo@suroohholdings.com`

## الحكم: BLOCKED

لا يمكن اليوم إثبات وصول تقرير إلى صندوق المالك، لأن نطاق إرسال Gmail غير ممنوح لهوية Runtime. كل ما دونه جاهز ومُختبَر، وما تبقّى يتطلب موافقة المالك أو تفويضاً صريحاً. لم يُرسَل أي بريد، ولم تتغير أي أسرار أو صلاحيات أو موارد.

## ما أُثبت (بأدلة قابلة لإعادة التشغيل)

| البند | الدليل |
|---|---|
| المسار موجود ومربوط في الإصدار المخدوم | `26b386a9…` يشمل `composition.ts:95` و`defaultBundleModule.ts:41` |
| منع تكرار الإرسال | مفتاح `owner-report-email:<notificationId>` + حالة `ACCEPTED` + اختبار تزامن: إرسال واحد فقط |
| اختبارات المسار | `owner_report_delivery` 21/21 نجحت · `owner_notification_delivery_access` 5/5 نجحت |
| العنوان صحيح وموحّد | 16 موضعاً بالنص القانوني `ceo@suroohholdings.com` في الكود والاختبارات والوثائق، وصفر نسخ مخالفة |
| النطاقات الممنوحة فعلياً | `gmail.readonly` و`drive.metadata.readonly` فقط، و`gmail.send=false` |
| رفض بناء القدرة عند غياب العلم | الاختبار الأول يثبت `DISABLED` قبل أي اتصال بقاعدة البيانات |

## الموانع بالترتيب

### 1) موافقة الإرسال من Google: BLOCKED

تبادل رمز التحديث أعاد `HTTP 200` بنطاقين فقط. أداة `sam_google_connection_status` تعيد `sendCapability: NOT_AUTHORIZED`. أي محاولة إرسال سترفضها Google بصلاحية ناقصة. النطاق `gmail.readonly` الممنوح حالياً يكفي لإثبات الوصول بعد الإرسال، فلا حاجة لصلاحية إضافية للقراءة.

### 2) ربط التفعيل: BLOCKED

`sam-runtime` يحمل 23 متغيراً، ولا واحد منها باسم `SAM_OWNER_REPORT_EMAIL_*`. صف التفعيل `OWNER_REPORT_EMAIL_ENABLED` غير موجود في آخر 200 صف تدقيق تغطي `2026-10-22T13:03:22.902Z` حتى `2026-11-04T03:25:20.998Z`. المصنع يُرجع الحزمة كما هي عند غياب العلم، فلا تُبنى قدرة ولا ناقل.

### 3) صلاحيات قاعدة البيانات: لم تُعَد للفحص اليوم

تقرير 2026-11-01 يقول إن الدور `sam_runtime_app` بلا `UPDATE` على قناة التسليم وبلا `INSERT` على المحاولات، وإن `attempts_rls=false`. تعذّر إعادة الفحص: الاتصال الخارجي بـPostgres من هذا المضيف ينهي مصافحة TLS ثم يُغلق قبل أي رد، والنتيجة نفسها على قاعدة الإنتاج الثانية، فالمشكلة في مخرج الشبكة لا في القاعدة. ولا وصول إلى Render Shell دون دخول المالك. `attempts_rls=false` في ذلك التقرير يرجّح أن `00107` غير مطبَّق في الإنتاج، والمُهيّئ `provisionOwnerNotificationDeliveryAccess` يفترضه مطبَّقاً.

### 4) لا تقرير مؤهّل في وقت التفعيل: BLOCKED

قاعدة الاختيار تقبل فقط الإشعارات التي أُنشئت بعد `activatedAt` مع تقرير مراجعة كامل مطابق. الإشعارات الحالية: 7 `UNROUTED` و2 `SUPPRESSED`. أربعة تقارير حقيقية محفوظة لها تجزئات كاملة، أحدثها `939ea95c-6d02-478d-9a41-d5d3a04e139b` عند `2026-11-01T22:58:44.735Z`، وكلها أقدم من أي وقت تفعيل صادق. إشعار الموجز التنفيذي `42585a8d` أُنشئ `2026-11-04T04:21:36.204Z` لكن `report=null`، لأن الموجز ليس تقرير مراجعة قراءة.

النتيجة: حتى لو فُتحت البوابات الثلاث، فالاختيار عند التفعيل الآن يعيد صفر صفوف.

## المطلوب من المالك بالضبط

1. **موافقة OAuth للإرسال**: إعادة الموافقة للحساب `ceo@suroohholdings.com` على نفس عميل OAuth المستخدم (`GOOGLE_OAUTH_CLIENT_ID` في مجموعة `sam-prod-google-client`) بإضافة `https://www.googleapis.com/auth/gmail.send` إلى النطاقين الحاليين، ثم تحديث `GOOGLE_OAUTH_REFRESH_TOKEN` على `sam-runtime`. لا يُطلب مني ولا ينفَّذ من جهتي أي مساس بالأسرار.
2. **تفويض منح صلاحيات التسليم**: تطبيق `00107` إن لم يكن مطبَّقاً، ثم تشغيل `provisionOwnerNotificationDeliveryAccess` عبر اتصال المالك. هذا تغيير صلاحيات ويحتاج تفويضاً صريحاً.
3. **تفويض التفعيل**: كتابة صف `OWNER_REPORT_EMAIL_ENABLED` (YELLOW، المالك، الشركة `73aa81c6-3a23-4369-9408-8bea0956d399`، المستلم الثابت، تصنيف `INTERNAL`) وضبط متغيرات التفعيل الأربعة على Runtime بوقت تفعيل حقيقي لا بأثر رجعي.
4. **قرار في التقرير المطلوب إرساله**: القاعدة الحالية تقطع ما قبل التفعيل. أمامك مسارَان:
   - انتظار أول تقرير مراجعة مكتمل بعد التفعيل، وهذا لا يحقق الإثبات الآن.
   - تفويض استثناء إرسال لمرة واحدة لتقرير محفوظ محدد مثل `939ea95c`. يتطلب تعديلاً صغيراً في دلالة القطع وموافقة صريحة، ولم أنفّذه لأنه خارج التفويض الحالي.

## ما لم يُنفَّذ

لا إرسال، لا بريد خارجي، لا تغيير متغير أو سر أو صلاحية، لا نشر، لا دمج، لا تحليل جديد، لا مساس بالميزانية `0.006` أو بالسجل، ولم تُفتح مهمة الموجز التنفيذي.

## إعادة التحقق

```bash
cd C:/Users/Zulik/sam-audit
DATABASE_URL='postgres://unused:unused@127.0.0.1:5432/unused' \
  node --import tsx --test tests/isolated/owner_report_delivery.ts
DATABASE_URL='postgres://unused:unused@127.0.0.1:5432/unused' \
  node --import tsx --test tests/isolated/owner_notification_delivery_access.ts
curl -s https://sam-runtime.onrender.com/livez
```

فحص السياسات الحية إن توفر Render Shell (قراءة فقط، وهو الفحص الذي يثبت أو ينفي عبارة «السياسة الوحيدة»):

```sql
SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity, p.polname, p.polcmd, p.polpermissive,
       pg_get_expr(p.polqual,p.polrelid) AS using_expr
FROM pg_class c JOIN pg_policy p ON p.polrelid=c.oid
WHERE c.relname IN ('verification_contracts','owner_notifications','notification_delivery_attempts')
ORDER BY 1,4;
```

البيانات الخام في `READINESS.json` بجانب هذا الملف.

## ملاحظة تصحيحية

الإصدار الأول من هذا الملف (الالتزام `a2a5b48`) كتب العنوان بحرف `h` واحد. صُحّح بمقارنة بايتية مع النص في `apps/notifications/src/delivery.ts`، والتحقق الآن: 16 موضعاً بالنص القانوني وصفر نسخ مخالفة.
