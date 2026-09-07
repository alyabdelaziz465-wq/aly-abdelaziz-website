const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':'https://alyabdelaziz.com','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'};
function json(status, body){return new Response(JSON.stringify(body),{status,headers});}
function clean(v,max=5000){return String(v??'').trim().slice(0,max)}
export default async function handler(req){
  if(req.method==='OPTIONS') return new Response('',{status:204,headers});
  if(req.method!=='POST') return json(405,{error:'Method not allowed'});
  try{
    const b=await req.json();
    if(!clean(b.name,120)||!clean(b.email,180)||!clean(b.role,160)||!clean(b.problem,8000)||!clean(b.outcome,5000)||!clean(b.topic,180)) return json(400,{error:'Missing required fields'});
    if(!/^\S+@\S+\.\S+$/.test(clean(b.email,180))) return json(400,{error:'Invalid email'});
    const caseId='ALY-'+new Date().getUTCFullYear()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
    const record={case_id:caseId,status:'new',name:clean(b.name,120),email:clean(b.email,180),role:clean(b.role,160),country:clean(b.country,120),company:clean(b.company,180),company_size:clean(b.size,80),industry:clean(b.industry,140),topic:clean(b.topic,180),problem:clean(b.problem,8000),impact:Array.isArray(b.impact)?b.impact.slice(0,10):[],outcome:clean(b.outcome,5000),urgency:clean(b.urgency,80),evidence:clean(b.evidence,5000)};
    const sbHeaders={'apikey':process.env.SUPABASE_SERVICE_ROLE_KEY,'Authorization':'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json','Prefer':'return=representation'};
    const ins=await fetch(process.env.SUPABASE_URL+'/rest/v1/advisory_cases',{method:'POST',headers:sbHeaders,body:JSON.stringify(record)});
    if(!ins.ok){const t=await ins.text(); console.error(t); return json(500,{error:'Could not save case'});}
    let brief={summary:'',category:record.topic,root_causes:[],missing_evidence:[],questions:[],recommended_diagnostic:'Review the submitted evidence before recommending an intervention.'};
    if(process.env.OPENAI_API_KEY){
      const prompt=`You are the internal triage assistant for Aly Abdelaziz, an HR consultant. Do not give the client a final recommendation. Structure the case for Aly. Use only the supplied information; distinguish hypotheses from facts. Return concise JSON with summary, category, root_causes (hypotheses), missing_evidence, questions, recommended_diagnostic. Case: ${JSON.stringify(record)}`;
      const ai=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.OPENAI_API_KEY},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5',input:prompt,text:{format:{type:'json_schema',name:'advisory_triage',strict:true,schema:{type:'object',properties:{summary:{type:'string'},category:{type:'string'},root_causes:{type:'array',items:{type:'string'}},missing_evidence:{type:'array',items:{type:'string'}},questions:{type:'array',items:{type:'string'}},recommended_diagnostic:{type:'string'}},required:['summary','category','root_causes','missing_evidence','questions','recommended_diagnostic'],additionalProperties:false}}},store:false})});
      if(ai.ok){const a=await ai.json(); try{brief=JSON.parse(a.output_text||'{}')}catch(e){console.error('AI parse error',e)}}
    }
    await fetch(process.env.SUPABASE_URL+'/rest/v1/advisory_cases?case_id=eq.'+encodeURIComponent(caseId),{method:'PATCH',headers:{...sbHeaders,'Prefer':'return=minimal'},body:JSON.stringify({ai_summary:brief.summary,ai_category:brief.category,ai_root_causes:brief.root_causes,ai_missing_evidence:brief.missing_evidence,ai_questions:brief.questions,ai_diagnostic:brief.recommended_diagnostic,status:'ai_structured'})});
    if(process.env.RESEND_API_KEY && process.env.ALY_NOTIFICATION_EMAIL){
      const email=`<h2>New Aly Advisory Case</h2><p><strong>${caseId}</strong></p><p><strong>Topic:</strong> ${record.topic}</p><p><strong>Client:</strong> ${record.name} — ${record.role}</p><p><strong>Company:</strong> ${record.company||'—'} (${record.company_size||'—'})</p><p><strong>Urgency:</strong> ${record.urgency}</p><p><strong>Problem:</strong> ${record.problem}</p><p><strong>AI triage:</strong> ${brief.summary}</p><p><a href="https://alyabdelaziz.com/advisory-dashboard.html?case=${encodeURIComponent(caseId)}">Open advisory dashboard</a></p>`;
      await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Aly Advisory <onboarding@resend.dev>',to:[process.env.ALY_NOTIFICATION_EMAIL],subject:`New Advisory Case — ${caseId} — ${record.topic}`,html:email})});
      const clientHtml=`<p>Thank you for reaching out to Aly Abdelaziz.</p><p>Your advisory request has been received and assigned:</p><p><strong>${caseId}</strong></p><p>Aly will personally review your case. The expected response window is within 48 hours.</p><p>This first perspective is free and is intended as a structured professional review, not a substitute for a full consulting engagement.</p>`;
      await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Aly Advisory <onboarding@resend.dev>',to:[record.email],subject:`Your Aly Advisory Request — ${caseId}`,html:clientHtml})});
    }
    return json(200,{ok:true,case_id:caseId});
  }catch(e){console.error(e);return json(500,{error:'Unexpected server error'});}
}
