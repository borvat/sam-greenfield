/** Extends the existing UI and authenticated API; no normal-mode fixtures. */
export const companyOfficeHtml=`
<section id="company-office" class="card detail company-office" lang="ar" dir="rtl" aria-labelledby="company-office-title" hidden>
 <div class="section-title"><h2 id="company-office-title">مكتب الشركة — SAM والموظفون الخمسة عشر</h2><button class="btn secondary" type="button" onclick="refreshCompanyOffice()">تحديث المكتب</button></div>
 <label for="office-company">الشركة المصادق عليها</label><select id="office-company" disabled aria-describedby="office-scope"><option>بانتظار الاتصال</option></select>
 <p id="office-scope" class="muted">يعرض هذا الاتصال الشركة المحددة في هوية الخادم فقط. تغيير الشركة يتطلب اتصالاً مصادقاً عليها.</p>
 <p id="office-status" role="status" aria-live="polite">بانتظار بيانات التشغيل المحفوظة.</p>
 <p class="muted">«يعمل» تتطلب lease صالحاً. العدادات تعكس تحققاً مستقلاً، والتكلفة مجموع جزئي مرتبط بالسجل أو UNKNOWN. التسجيل الوظيفي لا يثبت جاهزية التكامل.</p>
 <div id="office-supervisor"></div><div id="office-profiles" class="office-grid"></div>
 <details><summary>التقارير التنفيذية اليومية والأسبوعية</summary><p id="office-report-status" role="status"></p><div id="office-reports"></div></details>
 <details><summary>الحوادث والتعافي المحدود</summary><pre id="office-incidents"></pre></details>
</section>`;
export const companyOfficeScript=`
let officeSnapshot=null,officeReceivedAt=null;
const officeStateLabels={WORKING:'يعمل',AVAILABLE:'متاح — دليل سابق',WAITING_OWNER:'ينتظر اعتماداً',WAITING_EXTERNAL:'ينتظر جهة خارجية',BLOCKED:'متعطل / غير متحقق',FAILED:'فشل',STALE:'بيانات العامل قديمة',UNCONFIGURED:'غير مجهز',UNKNOWN:'غير معروف'};
function officeNode(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function officeCostLabel(cost){return cost&&cost.amount!==null&&cost.amount!==undefined?String(cost.amount)+' '+cost.currency+' — مجموع جزئي مرصود ('+cost.status+')':'UNKNOWN — لا قياس تكلفة منسوب';}
function markOfficeStale(force=false){
 if(!officeSnapshot)return;
 const stale=force||!officeReceivedAt||Date.now()-officeReceivedAt>(officeSnapshot.staleAfterMs||45000);
 if(!stale)return;
 document.getElementById('office-status').textContent='بيانات المكتب قديمة أو تعذر تحديثها؛ الحالة الحالية غير معروفة. آخر لقطة: '+officeSnapshot.generatedAt;
 document.querySelectorAll('#office-profiles [data-office-state]').forEach(node=>{node.textContent='غير معروف — لقطة قديمة';});
}
function renderCompanyOffice(data){
 officeSnapshot=data;officeReceivedAt=Date.parse(data.generatedAt);
 document.getElementById('company-office').hidden=false;
 const select=document.getElementById('office-company');select.textContent='';select.appendChild(officeNode('option',data.companyId));
 document.getElementById('office-status').textContent='آخر تحديث: '+data.generatedAt+' · '+data.availability+' · '+(data.coverage||'التكامل غير مجهز');
 const supervisor=document.getElementById('office-supervisor');supervisor.textContent='SAM — إشراف تنفيذي بالصلاحيات الحالية؛ لا توسع تلقائي للصلاحيات.';
 const target=document.getElementById('office-profiles');target.textContent='';
 for(const profile of data.profiles||[]){
  const card=officeNode('article');card.className='office-person';
  card.appendChild(officeNode('h3',profile.title));
  const state=officeNode('p',officeStateLabels[profile.state]||officeStateLabels.UNKNOWN);state.dataset.officeState=profile.state;state.className='state';card.appendChild(state);
  card.appendChild(officeNode('p',profile.purpose||''));
  card.appendChild(officeNode('p','آخر دليل: '+(profile.lastUpdated||'UNKNOWN')));
  card.appendChild(officeNode('p','التكلفة: '+officeCostLabel(profile.cost)));
  card.appendChild(officeNode('p','الأداء: '+(profile.performance?.label||'لم يُقيّم')+' · المتحقق: '+(profile.performance?.verified??'UNKNOWN')+' · الفشل: '+(profile.performance?.failed??'UNKNOWN')));
  const skills=officeNode('details');skills.appendChild(officeNode('summary','المهارات المقترحة والمراجعة'));
  skills.appendChild(officeNode('p','اعتماد المهارة لا يثبت تثبيتها أو تشغيلها؛ لا تتغير الصلاحيات بالمرتبة.'));
  for(const skill of profile.skills||[])skills.appendChild(officeNode('pre',JSON.stringify({id:skill.id,state:skill.state,source:skill.source_url,commit:skill.source_commit,hash:skill.source_hash,reviewCurrent:skill.reviewCurrent,reviewedBy:skill.reviewed_by,adoptedBy:skill.adopted_by,rollback:skill.rollback_ref,execution:skill.execution},null,2)));
  if(!(profile.skills||[]).length)skills.appendChild(officeNode('p','لا توجد مهارات منسوبة ضمن أحدث 100 مقترح للشركة.'));card.appendChild(skills);
  const contract=officeNode('details');contract.appendChild(officeNode('summary','الوصف الوظيفي وقائمة القبول والتسليم'));
  const responsibilities=officeNode('ul');for(const text of profile.responsibilities||[])responsibilities.appendChild(officeNode('li',text));contract.appendChild(responsibilities);
  contract.appendChild(officeNode('h4','قائمة قبول العمل'));const acceptance=officeNode('ul');for(const text of profile.acceptance||[])acceptance.appendChild(officeNode('li',text));contract.appendChild(acceptance);
  contract.appendChild(officeNode('p',profile.escalation));const protocol=officeNode('pre',JSON.stringify({handoff:profile.handoff,authority:profile.authority,budget:profile.budget,performance:profile.performance},null,2));contract.appendChild(protocol);card.appendChild(contract);
  if(!(profile.work||[]).length)card.appendChild(officeNode('p','لا توجد مهمة منسوبة محفوظة؛ لا يُفترض وجود تكامل عامل.'));
  for(const work of (profile.work||[]).slice(0,20)){
   const detail=officeNode('details'),summary=officeNode('summary'),taskState=officeNode('span',officeStateLabels[work.state]||work.state);taskState.dataset.officeState=work.state;summary.appendChild(taskState);summary.appendChild(officeNode('span',' · '+work.capability_id+' · '+work.queue_id));detail.appendChild(summary);
   const button=officeNode('button','فتح المهمة والتقرير في سجل الأحداث');button.type='button';button.className='btn secondary';button.onclick=()=>timeline(work.goal_id);detail.appendChild(button);
   detail.appendChild(officeNode('p','خطوات متحققة: '+work.progress.verified+'/'+work.progress.total+' · '+officeCostLabel(work.cost)));
   const evidence=officeNode('pre',JSON.stringify({goalId:work.goal_id,planId:work.plan_id,taskId:work.queue_id,executionId:work.execution_id,verificationId:work.verification_id,verification:work.verification_result,independentlyVerified:work.verified_independently,result:work.result,evidence:work.evidence,blocker:work.wake_reason,attempt:work.attempt,leaseOwner:work.lease_owner,leaseExpiry:work.lease_expiry,fencingToken:work.fencing_token,version:work.worker_version,claimedAt:work.claimed_at,finishedAt:work.finished_at,checkedAt:work.checked_at,cost:work.cost},null,2));detail.appendChild(evidence);card.appendChild(detail);
  }
  if((profile.work||[]).length>20)card.appendChild(officeNode('p','تظهر أحدث 20 مهمة في البطاقة؛ اللقطة والأداء يغطيان النطاق المعلن.'));
  target.appendChild(card);
 }
 document.getElementById('office-incidents').textContent=JSON.stringify(data.incidents||[],null,2);
 markOfficeStale();
}
function renderExecutiveReports(data){
 const target=document.getElementById('office-reports');target.textContent='';
 const settings=data.settings||{};
 document.getElementById('office-report-status').textContent='الحالة: '+data.availability+' · الجدولة: '+(settings.enabled?'مفعّلة في الإعدادات فقط':'غير مفعّلة')+' · '+(settings.timezone||'Asia/Damascus')+' · يومياً '+(settings.daily_time||'08:00')+' · اليوم الأسبوعي '+(settings.weekly_day??0)+' '+(settings.weekly_time||'08:00')+'. لا يثبت إنشاء التقرير وصوله؛ غياب قناة معتمدة يبقى محجوباً.';
 for(const report of data.records||[]){const detail=officeNode('details');detail.appendChild(officeNode('summary',report.report_type+' · '+report.period_key+' · '+report.status));detail.appendChild(officeNode('pre',JSON.stringify({id:report.id,artifactHash:report.artifact_hash,plannedAt:report.planned_at,generatedAt:report.generated_at,sentAt:report.sent_at,receipt:report.receipt_id,channel:report.channel,attempt:report.attempt,error:report.last_error_code,report:report.artifact},null,2)));target.appendChild(detail);}
}
async function refreshCompanyOffice(){
 if(document.body.dataset.companyEnabled!=='true')return;
 document.getElementById('company-office').hidden=false;
 if(!token){document.getElementById('office-status').textContent='يتطلب المكتب مصادقة الشركة.';markOfficeStale(true);return;}
 try{const response=await api('/api/company/office');renderCompanyOffice(response.data);
  try{const reports=await api('/api/company/reports');renderExecutiveReports(reports.data);}catch(error){document.getElementById('office-report-status').textContent='التقارير غير متاحة: '+error.message;document.getElementById('office-reports').textContent='';}
 }
 catch(error){document.getElementById('office-status').textContent='تعذر استرجاع المكتب: '+error.message;markOfficeStale(true);}
}
setInterval(()=>markOfficeStale(),5000);
`;
