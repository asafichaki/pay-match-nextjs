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
const funnelImport={'./funnel':{recordFunnelEvent:()=>{}}};
const {track} = load('src/lib/analytics/track.ts',{window},funnelImport);
track('sh_open',{variant:'page'});
track('sh_step_view',{step:1});
assert.deepEqual(Array.from(window.dataLayer,args=>Array.from(args).slice(0,2)),[['event','sh_open'],['event','sh_step_view']]);
assert.equal(window.dataLayer[1][2].step,1);
const earlyQueue=window.dataLayer;
window.gtag=function(){window.dataLayer.push(arguments);};
track('sh_step_view',{step:2});
assert.equal(earlyQueue,window.dataLayer);
assert.equal(window.dataLayer.length,3);
assert.doesNotThrow(()=>load('src/lib/analytics/track.ts',{},funnelImport).track('server'));
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

const requests=[];
const analyticsEnv={env:{NEXT_PUBLIC_SUPABASE_URL:'https://analytics.example.invalid',NEXT_PUBLIC_SUPABASE_ANON_KEY:'public-test-key'}};
const funnel=load('src/lib/analytics/funnel.ts',{window:{location:{pathname:'/quiz'}},process:analyticsEnv,crypto:{randomUUID:()=> 'test-session'},sessionStorage:{getItem:()=>{throw Error('blocked');}},fetch:async(url,options)=>{requests.push({url,...options});return {ok:true};}});
funnel.recordFunnelEvent('sh_step_view',{step:1,email:'private@example.invalid',message:'private error',variant:'page'});
funnel.recordFunnelEvent('sh_submit_success',{track:'A'});
funnel.recordFunnelEvent('unrelated',{email:'private@example.invalid'});
assert.equal(requests.length,2);
const first=JSON.parse(requests[0].body);
assert.deepEqual(first.metadata,{step:1,variant:'page'});
assert.equal(first.session_id,JSON.parse(requests[1].body).session_id);
assert.equal(requests[0].keepalive,true);
assert.doesNotThrow(()=>load('src/lib/analytics/funnel.ts').recordFunnelEvent('sh_open',{}));
console.log('PASS: first-party funnel excludes contact details and tolerates unavailable browser storage.');

// Exercise the scheduled route without any network calls or real recipients.
const tickEnv={env:{FUNNEL_CRON_SECRET:'test-cron-secret',RESEND_API_KEY:'test-placeholder'}};
let tickSends=[],tickWrites=[],tickDbError=null,tickAdvanced=[{id:'test-lead'}];
let tickDelivery={data:{id:'email-test'},error:null};
let tickLeads=[{id:'test-lead',email:'test@example.invalid',full_name:'Fixture',track:'A',funnel_state:'day1',created_at:'2020-01-01T00:00:00Z',email_state:{day1:{delivered:true}},tags:[]}];
const tick=load('src/app/api/funnel/tick/route.ts',{Headers,process:tickEnv,console:{...console,error:()=>{}}},{
  'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}},
  'resend':{Resend:class{emails={send:async(payload,options)=>{tickSends.push({payload,options});return tickDelivery;}};}},
  '@/lib/funnel/admin-supabase':{getAdminSupabase:()=>({from:()=>({
    select:()=>{const query={not:()=>query,limit:async()=>({data:tickLeads,error:null})};return query;},
    update:value=>{tickWrites.push(value);const query={eq:()=>query,select:async()=>({data:tickAdvanced,error:tickDbError})};return query;}
  })})},
  '@/lib/funnel/email-dispatch':{expectedStateForAge:()=> 'complete',chooseEmail:()=>({emailKey:'fixture',nextState:'day4',props:{}})},
  '@/lib/funnel/email-registry':{getEmail:()=>({subject:()=> 'Fixture',default:()=> null})},
  '@/lib/funnel/resend-client':{FUNNEL_FROM:'test@example.invalid',FUNNEL_REPLY_TO:'test@example.invalid'}
});
const tickRequest={headers:new Headers({authorization:'Bearer test-cron-secret'})};
assert.equal((await tick.GET({headers:new Headers({'x-vercel-cron':'1'})})).status,401);
assert.equal(tickSends.length,0,'a caller-supplied cron header must not authorize sending');
tickDelivery={data:null,error:{message:'provider rejected'}};
assert.equal((await tick.GET(tickRequest)).status,500);
assert.equal(tickWrites.length,0,'provider rejection must leave the lead retryable');
tickDelivery={data:null,error:null};
assert.equal((await tick.GET(tickRequest)).status,500);
assert.equal(tickWrites.length,0,'missing acceptance ID must not advance the lead');
tickDelivery={data:{id:'email-test'},error:null};
assert.equal((await tick.GET(tickRequest)).status,200);
assert.deepEqual(JSON.parse(JSON.stringify(tickWrites)),[{funnel_state:'day4'}],'tick must not overwrite webhook engagement');
assert.equal(tickSends.at(-1).options.idempotencyKey,tickSends[0].options.idempotencyKey);
assert.equal(tickSends.at(-1).payload.tags[0].value,'test-lead');
tickDbError={message:'database unavailable'};
assert.equal((await tick.GET(tickRequest)).body.results[0].action,'state_update_failed');
tickDbError=null;tickAdvanced=[];
assert.equal((await tick.GET(tickRequest)).status,500,'concurrent state changes must not be reported as advancement');
tickLeads=[{...tickLeads[0],tags:['TEST']}];
const sendsBeforeExcluded=tickSends.length;
assert.equal((await tick.GET(tickRequest)).body.results[0].action,'excluded');
assert.equal(tickSends.length,sendsBeforeExcluded);
console.log('PASS: scheduled emails require authentication, exclude test contacts, preserve state on failure, and retain webhook engagement.');

let modalStore;
const modal=load('src/components/sorting-hat/useSortingHatModal.ts',{}, {'react':{useSyncExternalStore:(subscribe,getSnapshot,getServerSnapshot)=>{modalStore={subscribe,getSnapshot,getServerSnapshot};return getSnapshot();}}});
modal.useSortingHatModal();
const initialServerSnapshot=modalStore.getServerSnapshot();
assert.equal(initialServerSnapshot,modalStore.getServerSnapshot(),'server snapshots must keep their identity during hydration');
let modalNotifications=0;const unsubscribe=modalStore.subscribe(()=>modalNotifications++);
modal.openSortingHat({initialBusinessType:'physical_goods'});
assert.equal(modalStore.getSnapshot().open,true);
assert.equal(modalStore.getSnapshot().initialBusinessType,'physical_goods');
assert.equal(modalStore.getServerSnapshot(),initialServerSnapshot);
assert.equal(modalStore.getServerSnapshot().open,false,'server state must not leak an open client modal');
modal.closeSortingHat();assert.equal(modalStore.getSnapshot().open,false);
assert.equal(modalNotifications,2);unsubscribe();modal.openSortingHat();assert.equal(modalNotifications,2);modal.closeSortingHat();
console.log('PASS: quiz modal has a stable server snapshot and notifies subscribers on open/close.');
