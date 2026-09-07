function askAly(){
  const q=(document.getElementById('alyQuestion').value||'').toLowerCase();
  const ar=document.body.classList.contains('rtl');
  const a=document.getElementById('alyAnswer');
  let out=ar
    ? 'ابدأ بمنظور القرار في المنصة: وضّح نتيجة الأعمال، حدّد الأدلة، شخّص الفجوة، قارن البدائل، ثم اختر التنفيذ وKPI الذي سيقيس نجاح القرار.'
    : 'I would approach this through the platform’s decision architecture: clarify the business outcome, define the evidence, diagnose the gap, compare options, then choose an action and KPI.';
  const map=ar
    ? [
      ['kpi','ابدأ بـ KPI Architecture: الهدف ← النتيجة ← المؤشر ← المعادلة ← المالك ← المستهدف ← قاعدة القرار. واسأل هل يمكن للمؤشر أن يكافئ سلوكاً يضر بالنتيجة الأكبر؟'],
      ['performance','استخدم Performance Gap Model. اختبر أسباب المعرفة والمهارة والسلوك والنظام قبل افتراض أن التدريب هو الحل.'],
      ['cv','استخدم CV / Job Fit Intelligence وافصل بين توافق الكلمات المفتاحية وملاءمة الدور والأدلة والخبرة والتموضع والإنجازات والمخاطر.'],
      ['ai','استخدم AI–Human Decision Matrix وقيّم القيمة والمخاطر وجاهزية البيانات وقابلية التكرار والقياس والحكم البشري.'],
      ['talent','ابدأ بالأدلة المطلوبة للنجاح في الدور، ثم صمّم الاستقطاب والاختيار حول هذه الأدلة.'],
      ['strategy','ابدأ باستراتيجية الأعمال والقدرات التي تتطلبها القوى العاملة، ثم صمّم نظام HR حول التشخيص.']
    ]
    : [
      ['kpi','Start with the KPI Architecture: objective → result → measure → formula → owner → target → decision rule. Ask whether the metric could reward behavior that harms the broader outcome.'],
      ['performance','Use the Performance Gap Model. Test knowledge, skill, behavior and system/process causes before deciding that training is needed.'],
      ['cv','Use CV / Job Fit Intelligence. Separate keyword alignment from role fit, evidence fit, seniority, positioning, achievement quality and risk.'],
      ['ai','Use the AI–Human Decision Matrix. Score business value, risk, data readiness, repeatability, measurement ease and the need for human judgment.'],
      ['talent','Start with the evidence required for success in the role, then design sourcing and selection around that evidence.'],
      ['strategy','Start with the business strategy and the workforce capabilities it requires; then design the HR system around the diagnosis.']
    ];
  for(const [k,v] of map){
    const hit=q.includes(k) || (ar && (
      (k==='kpi'&&q.includes('مؤشر')) ||
      (k==='performance'&&q.includes('أداء')) ||
      (k==='cv'&&q.includes('سيرة')) ||
      (k==='ai'&&q.includes('ذكاء')) ||
      (k==='talent'&&q.includes('موهبة')) ||
      (k==='strategy'&&q.includes('استراتيجية'))
    ));
    if(hit){out=v;break;}
  }
  a.innerHTML=`<b>${ar?'منظور Aly للقرار:':'Aly’s decision lens:'}</b><br>${out}<br><br>`+
    `<span class="pill">${ar?'معرفة':'Knowledge'}</span><span class="pill">${ar?'تشخيص':'Diagnosis'}</span><span class="pill">${ar?'قرار':'Decision'}</span><span class="pill">${ar?'تنفيذ':'Action'}</span><span class="pill">${ar?'أثر':'Impact'}</span>`;
  a.style.display='block';
}
