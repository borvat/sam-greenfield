# PR #86 — فحص الإصدار المشروط: توقف قبل الترحيل والنشر

1 نوفمبر2026 — **BLOCKED_PREDEPLOY**. الموافقة المشروطة محفوظة؛ شروط النسخ الاحتياطي والرجوع لم تتحقق. لم نغيّر الإنتاج.

## الحكم

خطة الرجوع السابقة إلى Runtime62ccbdb وCC/MCP1e4e21a مع إبقاء00106 ليست متوافقة مع كل المسارات. اكتشفت المراجعة المستقلة تعارضاً حقيقياً وأكدناه بتشغيل SQL الأصلي في PostgreSQL مضمّن معزول. لا يجوز اعتبار الرجوع آمناً بمجرد حفظ أسماء deploys قديمة.

## الدليل الجديد

- الإصداران المنشوران يستخدمان `ON CONFLICT(goal_id,plan_id)` في `apps/production/src/hermesSourceFollowup.ts:96`.
- الترحيل00106 يحذف القيد الفريد على هذين العمودين ويستبدله بقيد ثلاثي يشمل revision.
- الإصدار المعتمد8a08e61 غيّر INSERT إلى القيد الثلاثي.
- شُغّل اختبار جديد مركز على SQL المستخرج من Git objects الأصلية، لا إعادة للأجنحة القديمة. بعد00106 يفشل SQL القديم للإصدارين بـ`42P10`، بينما SQL الإصلاح يُقبل.
- حافظ الاختبار على التقرير الأصلي وhash ثم revision2. محاولة إعادة القيد الثنائي تُرفض بـ`23505` عند وجود المراجعتين؛ لا حذف بيانات أو إعادة schema عشوائية لإجبار الرجوع.
- هذا إثبات توافق SQL معزول فقط؛ ليس اختبار production/native locking ولا إثبات backup/restore.

## النسخة الاحتياطية

قاعدة sam-trial-postgres متاحة وفق metadata، لكن get_postgres لا يعرض نسخة export مكتملة أو نافذة PITR فعلية أو تاريخ نسخة حالية يمكن استعادتها. الموصل المتاح لا يوفر قراءة/إنشاء exports أو recovery، ولا يوجد CLI محلي مصادق عليه أو pg_dump/pg_restore. SQL الخارجي محجوب. لم نفتح الشبكة أو نستخرج أسراراً.

اختبارات backup القديمة تخص بيانات synthetic وتصرح productionData:false؛ لا تستوفي شرط نسخة من قاعدة الإنتاج الحالية. وجود خطة مدفوعة وحده لا يثبت جاهزية backup لهذه القاعدة. وثائق Render الحالية تشرح أن PITR ينشئ instance جديدة، لذلك لا نشغله كاختبار تلقائي مخالف لقيد عدم إنشاء خدمات أو تكاليف جديدة.

## حالة الخدمات المستقلة المرصودة

| الخدمة | SHA حي | Deploy |
|---|---|---|
| Runtime |62ccbdbb94e080f22425f64396c894270ee551aa |dep-dbgld96gekts7388md80 |
| Command Center |1e4e21a773c88e2366915edd3bb2e307fddaa157 |dep-dbgm8n5g1s2s73bp9k30 |
| MCP |1e4e21a773c88e2366915edd3bb2e307fddaa157 |dep-dbgm96k9v7es73arrs2g |

الطابور المرئي فارغ ومؤشرات stale/expired صفر؛ هذا لا يثبت غياب كل معاملات DB. هدف bolbc17c4ae ما زال WAITING_EXTERNAL، ونفس التقرير/hash بلا recovery جديدة.

## ما لم يُنفذ

لا ترحيل00106، لا deploy، لا إنشاء خدمات/DB، لا تكلفة نماذج أو هدف جديد، لا قراءة أسرار، لا تعديل صلاحيات/شبكة، لا دمجmain. مسودات الموظفين غير مفعلة ومنفصلة عن exact release8a08e61.

## ما يلزم لاستئناف الموافقة الموجودة

1. تصميم رجوع متوافق مع schema00106 واختباره مستقلاً على المسار الذي ثبت فشله، دون حذف التاريخ. أي بديل يغيّر commit الإصدار المسموح أو النطاق يحتاج قراراً محدداً قبل استخدامه، لا موافقة عامة جديدة.
2. دليل مصادق على backup حالية مكتملة وقابلة للوصول بأمان، وخطوات استعادة بصلاحيات قائمة، والتحقق في عزل مسموح دون خدمات/تكاليف جديدة. export-list أو paid-plan وحدهما غير كافيين.
3. إثبات أن artifacts اللازمة للرجوع ما زالت متاحة، أو طريقة إعادة بناء pinned بديلة يمكن تنفيذها فعلاً؛ availability غير مثبتة من metadata الحالية.
4. التحقق الحي من schema/ledger/ACL/RLS ومن أن00106 لم يطبق سابقاً جزئياً، ثم تنفيذ الإصدار المشروط فقط بعد اكتمال كل البوابات.

لا أطلب إعادة الموافقة على ما وافقت عليه؛ التوقف هنا تنفيذ لشرطك الإلزامي قبل النشر. تطوير المراحل اللاحقة يبقى مؤجلاً حتى إثبات الأساس التشغيلي، حسب ترتيبك.

## روابط الأدلة

- [PR86](https://github.com/borvat/sam-greenfield/pull/86)
- [Commit المعتمد](https://github.com/borvat/sam-greenfield/commit/8a08e6163516f30f37c65313134170744330c4f4)
- [INSERT القديم](https://github.com/borvat/sam-greenfield/blob/62ccbdbb94e080f22425f64396c894270ee551aa/apps/production/src/hermesSourceFollowup.ts#L96)
- [الترحيل00106](https://github.com/borvat/sam-greenfield/blob/8a08e6163516f30f37c65313134170744330c4f4/packages/db/integration-migrations/00106_read_review_revisions.sql)
- [قاعدة Render](https://dashboard.render.com/d/dpg-db37k3rbc2fs73csjung-a)
- [Runtime](https://dashboard.render.com/web/srv-db37vbvlk1mc739o0b70)
- [Command Center](https://dashboard.render.com/web/srv-db37vbvlk1mc739o0b6g)
- [MCP](https://dashboard.render.com/web/srv-db37vbvlk1mc739o0b7g)
- [وثائق النسخ والاستعادة](https://render.com/docs/postgresql-backups)
- [وثائق رجوع الخدمات](https://render.com/docs/rollbacks)

الأدلة التنفيذية المحلية: `conditional-release-preflight.json` و`tests/isolated/rollback_00106_preflight.cjs`. ستبقى نتيجة الاختبار PASS_DETECTED_BLOCKER، بينما قبول الإصدار BLOCKED؛ لا خلط بين اكتشاف العيب ونجاح الإصدار.
