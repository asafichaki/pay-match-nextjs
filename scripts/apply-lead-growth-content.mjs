#!/usr/bin/env node
// Apply the reviewed September 9 correction with a concurrent-edit guard.
// Default is read-only. Keep the generated before snapshot for rollback.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const file of [path.join(root,'.env.local'),process.env.MPA_SEO_ENV_FILE || path.join(os.homedir(),'.credentials/mypayadvisor-seo.env')]) {
 if(!fs.existsSync(file))continue;
 for(const line of fs.readFileSync(file,'utf8').split('\n')){const m=line.match(/^([A-Z_0-9]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}
}
const slug='best-payment-processors-with-same-day-deposit-2026';
const base=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('Missing project credentials');
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
async function api(route,options={}){const r=await fetch(`${base}/rest/v1/${route}`,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw Error(`Database HTTP ${r.status}: ${(await r.text()).slice(0,180)}`);const t=await r.text();return t?JSON.parse(t):null;}
const [article]=await api(`blog_articles?slug=eq.${slug}&kind=eq.comparisons&select=*`);
if(!article)throw Error('Target missing');
const [override]=await api(`seo_overrides?slug=eq.${slug}&kind=eq.comparisons&select=*`);
const payload=JSON.parse(fs.readFileSync(path.join(root,'reports/lead-growth-20260909/same-day-content.json'),'utf8'));
const answer='For same-day access, compare eligible instant transfers from Square, Stripe, PayPal Business and Clover. If next-business-day funding is enough, compare standard transfers and Helcim Faster Deposits. Payout fees apply to the amount expedited, separately from processing fees. Account eligibility, bank support and reserves matter as much as advertised speed.';
console.log(JSON.stringify({slug,old_title:article.meta_title,new_title:payload.meta_title,prior_updated_at:article.updated_at,citation_lock:override?.citation_lock,mode:process.argv.includes('--apply')?'apply':'read-only'}));
if(!process.argv.includes('--apply'))process.exit(0);
if(!process.env.AUTOPILOT_SECRET)throw Error('Revalidation credential required before writing');
if(override?.citation_lock)throw Error('Target is citation locked; inspect before applying');
const backup=process.argv.find(x=>x.startsWith('--backup='))?.slice(9);
if(!backup)throw Error('--backup=/absolute/path.json is required');
fs.writeFileSync(backup,JSON.stringify({article,override},null,2)+'\n',{flag:'wx',mode:0o600});
payload.updated_at=new Date().toISOString();
const changed=await api(`blog_articles?id=eq.${article.id}&updated_at=eq.${encodeURIComponent(article.updated_at)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
if(changed?.length!==1)throw Error('Concurrent edit detected; article not changed');
await api('rpc/seo_apply_change',{method:'POST',body:JSON.stringify({p_idempotency_key:'manual:20260909:payout-facts:aeo',p_kind:'comparisons',p_slug:slug,p_field:'aeo_answer',p_new:answer,p_reason:'Correct payout fee interpretation and business versus consumer terms after primary-source review, September 9 2026.',p_source:'human'})});
const rv=await fetch('https://www.mypayadvisor.com/api/autopilot/revalidate',{method:'POST',headers:{Authorization:`Bearer ${process.env.AUTOPILOT_SECRET}`,'Content-Type':'application/json'},body:JSON.stringify({kind:'comparisons',slug})});
console.log(JSON.stringify({article_updated:true,revalidation_status:rv.status,backup}));
if(!rv.ok)process.exitCode=1;
