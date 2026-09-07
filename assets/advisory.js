(() => {
  const form = document.getElementById('advisoryForm');
  if (!form) return;
  const steps = [...document.querySelectorAll('.form-step')];
  const pills = [...document.querySelectorAll('.stepper span')];
  let current = 0;
  const rtl = document.documentElement.dir === 'rtl';
  const show = (i) => {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((s,n)=>s.classList.toggle('active',n===current));
    pills.forEach((p,n)=>p.classList.toggle('active',n===current));
    if(current===5) buildReview();
    window.scrollTo({top: document.querySelector('.advisory-panel').offsetTop-20, behavior:'smooth'});
  };
  const validate = () => {
    const required=[...steps[current].querySelectorAll('[required]')];
    for(const el of required){ if(!el.checkValidity()){ el.reportValidity(); return false; } }
    return true;
  };
  document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>{ if(validate()) show(current+1); }));
  document.querySelectorAll('.prev').forEach(b=>b.addEventListener('click',()=>show(current-1)));
  function data(){
    const fd=new FormData(form), o={};
    for(const [k,v] of fd.entries()){ if(k==='impact'){(o.impact??=[]).push(v)} else if(k!=='consent') o[k]=v; }
    return o;
  }
  function buildReview(){
    const d=data(); const box=document.getElementById('reviewBox');
    const labels=rtl?{topic:'مجال المشكلة',problem:'المشكلة',outcome:'الهدف',urgency:'الأولوية',size:'حجم الشركة',industry:'القطاع'}:{topic:'Problem area',problem:'Problem',outcome:'Desired outcome',urgency:'Priority',size:'Company size',industry:'Industry'};
    box.innerHTML=[labels.topic,labels.problem,labels.outcome,labels.urgency,labels.size,labels.industry].map((k,i)=>{
      const key=['topic','problem','outcome','urgency','size','industry'][i]; return `<strong>${k}</strong><div>${escapeHtml(d[key]||'—')}</div>`;
    }).join('<hr>');
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(!validate()) return;
    const btn=document.getElementById('submitBtn'); btn.disabled=true; btn.textContent=rtl?'جارٍ إرسال الطلب…':'Submitting…';
    try{
      const r=await fetch('/api/advisory-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data())});
      const out=await r.json(); if(!r.ok) throw new Error(out.error||'Submission failed');
      form.style.display='none'; document.getElementById('success').classList.add('show'); document.getElementById('caseId').textContent=out.case_id;
    }catch(err){alert(rtl?'تعذر إرسال الطلب. حاول مرة أخرى أو استخدم صفحة التواصل.':'We could not submit the request. Please try again or use the contact page.'); btn.disabled=false; btn.textContent=rtl?'إرسال الطلب':'Submit advisory request';}
  });
})();
