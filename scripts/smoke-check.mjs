import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const fail=(m)=>{console.error('FAIL:',m);process.exitCode=1};
const ok=(m)=>console.log('OK:',m);
const index=fs.readFileSync('index.html','utf8');
const requiredIds=['authModal','authForm','profileForm','profileGrid','openMessages','chatDrawer','conversationList','activeChat','messageForm','messageStream','logoutButton'];
for(const id of requiredIds) index.includes(`id="${id}"`)?ok(`#${id}`):fail(`missing #${id}`);
if(!index.includes('assets/js/core.js')) fail('core.js is not loaded'); else ok('local core.js loaded');
if(index.includes('assets/js/app.js')) fail('legacy app.js still loaded from index'); else ok('legacy app.js not loaded');

const files=fs.readdirSync('assets/js').filter(f=>f.endsWith('.js'));
for(const file of files){
  try{execFileSync(process.execPath,['--check',`assets/js/${file}`],{stdio:'pipe'});ok(`syntax ${file}`)}
  catch(e){fail(`syntax ${file}: ${e.stderr?.toString()||e.message}`)}
}
const runtimeFiles=['assets/js/core.js','assets/js/product.js','assets/js/direct-fix.js','assets/js/community.js','assets/js/profile-flow.js','assets/js/admin-panel.js','assets/js/navigation.js'];
for(const path of runtimeFiles){
  const src=fs.readFileSync(path,'utf8');
  if(/raw\.githubusercontent\.com|cdn\.jsdelivr\.net|unpkg\.com/.test(src)) fail(`${path} contains external JS runtime dependency`); else ok(`${path} local-runtime only`);
}
const direct=fs.readFileSync('assets/js/direct-fix.js','utf8');
for(const needle of ['start_conversation','conversation-item','messageForm','messages','mark_conversation_read']) direct.includes(needle)?ok(`Direct ${needle}`):fail(`Direct missing ${needle}`);
const core=fs.readFileSync('assets/js/core.js','utf8');
for(const needle of ['persistSession:true','autoRefreshToken:true','https://znakomy.online/','loadProfiles','showAccount']) core.includes(needle)?ok(`Core ${needle}`):fail(`Core missing ${needle}`);
if(process.exitCode) process.exit(1);
console.log('\nProduction smoke audit passed.');
