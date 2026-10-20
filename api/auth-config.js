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
 return /^(sb_publishable_[a-zA-Z0-9_-]{10,}|eyJ[a-zA-Z0-9_.=-]{50,})$/.test(key)?key:null
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
