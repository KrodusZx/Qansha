'use strict';
/**
 * Publishes only Supabase public browser configuration.
 * Never expose SUPABASE_SERVICE_ROLE_KEY, sb_secret_* or administrator credentials.
 * Missing configuration returns configured:false so the UI never pretends signup works.
 */
const publicUrl=x=>{
 try{const u=new URL(String(x||''));return u.protocol==='https:'&&/^[a-z0-9-]+\.supabase\.co$/.test(u.hostname)&&u.pathname==='/'?u.origin:null}
 catch{return null}
};
const publicKey=x=>{
 const key=String(x||'');
 if(/^sb_publishable_[a-zA-Z0-9_-]{10,}$/.test(key))return key;
 // Legacy anon JWT is public only if the signed payload identifies the anon role.
 // In particular, never expose service_role JWTs accidentally supplied as env vars.
 if(!/^eyJ[a-zA-Z0-9_.-]{50,}$/.test(key))return null;
 try{
  const parts=key.split('.');
  if(parts.length!==3)return null;
  const payload=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
  return payload.role==='anon'?key:null;
 }catch{return null}
};
module.exports=(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store, max-age=0');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const supabaseUrl=publicUrl(process.env.SUPABASE_URL);
 const supabaseAnonKey=publicKey(process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY);
 if(!supabaseUrl||!supabaseAnonKey)return res.status(200).json({configured:false});
 return res.status(200).json({configured:true,supabaseUrl,supabaseAnonKey});
};
