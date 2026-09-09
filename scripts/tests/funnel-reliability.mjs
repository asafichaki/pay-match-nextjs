import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { Resend } from 'resend';
import { Webhook } from 'svix';

function load(path, globals = {}, imports = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const js = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(js, {exports, require:(name)=>{if (!(name in imports)) throw new Error(`Unexpected import ${name}`); return imports[name];},console,process,...globals});
  return exports;
}
const window = {};
const {track} = load('src/lib/analytics/track.ts',{window});
track('sh_open',{variant:'page'});
track('sh_step_view',{step:1});
assert.deepEqual(Array.from(window.dataLayer,args=>Array.from(args).slice(0,2)),[['event','sh_open'],['event','sh_step_view']]);
assert.equal(window.dataLayer[1][2].step,1);
const earlyQueue=window.dataLayer;
window.gtag=function(){window.dataLayer.push(arguments);};
track('sh_step_view',{step:2});
assert.equal(earlyQueue,window.dataLayer);
assert.equal(window.dataLayer.length,3);
assert.doesNotThrow(()=>load('src/lib/analytics/track.ts').track('server'));
window.gtag=()=>{throw new Error('blocked analytics');};
assert.doesNotThrow(()=>track('sh_open'));

const callbacks=[];let sends=0;
const originalKey=process.env.RESEND_API_KEY;
process.env.RESEND_API_KEY='test-placeholder';
const notify=load('src/lib/leads/notify-new-lead.ts',{}, {
  'server-only':{},'next/server':{after:fn=>callbacks.push(fn)},
  '@/lib/funnel/resend-client':{getResend:()=>({emails:{send:async()=>{sends++;return {data:{id:'test'}};}}})}
});
await notify.notifyNewLead({source:'sorting_hat',lead:{email:'test@example.invalid'}});
assert.equal(sends,0,'notification should be scheduled after the response');
assert.equal(callbacks.length,1);
await callbacks[0]();assert.equal(sends,1);
if(originalKey===undefined) delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=originalKey;

const secret='whsec_'+Buffer.from('funnel-webhook-test-secret-only').toString('base64');
const signer=new Webhook(secret);
const payload=JSON.stringify({type:'email.delivered',data:{email_id:'test',tags:{lead_id:'6c204fd0-2d48-4574-a28c-7fd0fe89a337',funnel_state:'day0'}}});
const now=new Date();const id='msg_test';
const signature=signer.sign(id,now,payload);
const sdk=new Resend('test-placeholder');
const opts={payload,webhookSecret:secret,headers:{id,timestamp:String(Math.floor(now.getTime()/1000)),signature}};
assert.equal(sdk.webhooks.verify(opts).type,'email.delivered');
assert.throws(()=>sdk.webhooks.verify({...opts,payload:payload+' '}));
const saved=[];
const secretBefore=process.env.RESEND_WEBHOOK_SECRET;
process.env.RESEND_WEBHOOK_SECRET=secret;
const route=load('src/app/api/funnel/resend-webhook/route.ts',{Headers}, {
  'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}},
  '@/lib/funnel/resend-client':{getResend:()=>sdk},
  '@/lib/funnel/admin-supabase':{getAdminSupabase:()=>({from:()=>({
    select:()=>({eq:()=>({single:async()=>({data:{email_state:{}},error:null})})}),
    update:value=>({eq:async(_key,lead)=>{saved.push({lead,value});return {error:null};}})
  })})}
});
const signedHeaders=new Headers({'svix-id':id,'svix-timestamp':opts.headers.timestamp,'svix-signature':signature});
const result=await route.POST({text:async()=>payload,headers:signedHeaders});
assert.equal(result.status,200);assert.equal(saved.length,1);
assert.equal(saved[0].value.email_state.day0.delivered,true);
assert.equal((await route.POST({text:async()=>payload+' ',headers:signedHeaders})).status,401);
assert.equal(saved.length,1,'tampered webhook must not write');
delete process.env.RESEND_WEBHOOK_SECRET;
assert.equal((await route.POST({text:async()=>payload,headers:signedHeaders})).status,503);
if(secretBefore!==undefined) process.env.RESEND_WEBHOOK_SECRET=secretBefore;
console.log('PASS: early GA4 events survive deferred load; notifications wait for after(); webhook signatures reject tampering.');
