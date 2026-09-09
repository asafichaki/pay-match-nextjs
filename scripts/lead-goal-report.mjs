#!/usr/bin/env node
// Read-only progress toward ten unique merchant requests per calendar month.
// Newsletter-only contacts and marked tests/spam never count toward the goal.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const envFile=process.env.MPA_ENV_FILE || path.join(root,'.env.local');
if(fs.existsSync(envFile)) for(const line of fs.readFileSync(envFile,'utf8').split('\n')) {
  const match=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);if(match&&!process.env[match[1]]) process.env[match[1]]=match[2].replace(/^['"]|['"]$/g,'');
}
const url=process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key) throw new Error('Configure the project Supabase URL and service role key.');
const headers={apikey:key,Authorization:`Bearer ${key}`};
const all=[];
for(let offset=0;;offset+=1000){
 const query=new URLSearchParams({select:'created_at,email,full_name,business_type,status,tags,utm_source,referrer,landing_page_url',order:'created_at.asc',limit:'1000',offset:String(offset)});
 const response=await fetch(`${url}/rest/v1/quiz_leads?${query}`,{headers,signal:AbortSignal.timeout(20000)});
 if(!response.ok) throw new Error(`Lead read failed: HTTP ${response.status}`);
 const rows=await response.json();all.push(...rows);if(rows.length<1000)break;
}
const now=new Date();
const startMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
const start30=new Date(now.getTime()-30*86400000);
const seen=new Set();let excluded=0;
const valid=all.filter(row=>{
 const email=(row.email||'').trim().toLowerCase();const name=(row.full_name||'').trim();
 const marked=[row.status,...(Array.isArray(row.tags)?row.tags:[])].some(v=>['test','spam','invalid'].includes(String(v).toLowerCase()));
 const test=/^(test|qa)(\b|[-_])/i.test(name)||/\+mpa-test[-@]/i.test(email)||/@(?:example\.(?:com|org|net|invalid)|resend\.dev)$/i.test(email);
 if(marked||test||!name||!row.business_type||!/^\S+@\S+\.\S+$/.test(email)||seen.has(email)){excluded++;return false;}
 seen.add(email);return true;
});
function source(row){
 let utm=row.utm_source;
 if(!utm&&row.landing_page_url){try{utm=new URL(row.landing_page_url,'https://www.mypayadvisor.com').searchParams.get('utm_source');}catch{}}
 if(utm)return utm.toLowerCase();
 try{return new URL(row.referrer).hostname;}catch{return 'unattributed';}
}
function windowSummary(start){const rows=valid.filter(r=>new Date(r.created_at)>=start&&new Date(r.created_at)<=now);const sources={};for(const row of rows){const s=source(row);sources[s]=(sources[s]||0)+1;}return {start:start.toISOString(),requests:rows.length,target:10,remaining:Math.max(0,10-rows.length),sources};}
const report={generated_at:now.toISOString(),definition:'Unique new merchant quiz requests with name, valid email and business type. Excludes marked test/spam/invalid and duplicate contacts; newsletter signups do not count. Contact quality still requires human review.',timezone:'UTC',calendar_month:windowSummary(startMonth),trailing_30_days:windowSummary(start30),last_eligible_request:valid.at(-1)?.created_at||null,excluded_records:excluded};
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
