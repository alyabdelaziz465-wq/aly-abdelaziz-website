const C={'Content-Type':'application/json','Access-Control-Allow-Origin':'https://alyabdelaziz.com','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'POST,OPTIONS'};
const j=(s,b)=>new Response(JSON.stringify(b),{status:s,headers:C});
export default async function handler(req){
 if(req.method==='OPTIONS') return new Response('',{status:204,headers:C});
 if(req.method!=='POST') return j(405,{error:'Method not allowed'});
 try{
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''); if(!token) return j(401,{error:'Authentication required'});
  const user=await fetch(process.env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+token}});
  if(!user.ok) return j(401,{error:'Invalid session'});
  const u=await user.json(); if(u.user_metadata?.role!=='advisory_admin') return j(403,{error:'Forbidden'});
  const b=await req.json(); if(!b.case_id||!b.response) return j(400,{error:'Case and response required'});
  const h={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json','Prefer':'return=representation'};
  const q=await fetch(process.env.SUPABASE_URL+'/rest/v1/advisory_cases?case_id=eq.'+encodeURIComponent(b.case_id)+'&select=*',{headers:h});
  const rows=await q.json(); if(!rows?.[0]) return j(404,{error:'Case not found'}); const c=rows[0];
  const up=await fetch(process.env.SUPABASE_URL+'/rest/v1/advisory_cases?case_id=eq.'+encodeURIComponent(b.case_id),{method:'PATCH',headers:h,body:JSON.stringify({client_response:b.response,status:'responded',response_sent_at:new Date().toISOString()})});
  if(!up.ok) return j(500,{error:'Could not update case'});
  if(process.env.RESEND_API_KEY){
   await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Aly Advisory <onboarding@resend.dev>',to:[c.email],subject:`Aly's Advisory Response — ${c.case_id}`,html:`<p>Hello ${c.name},</p><p>Thank you for your patience.</p><div style="white-space:pre-wrap">${String(b.response).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</div><p>Best regards,<br>Aly Abdelaziz</p>`})});
  }
  return j(200,{ok:true});
 }catch(e){console.error(e);return j(500,{error:'Unexpected server error'});}
}
