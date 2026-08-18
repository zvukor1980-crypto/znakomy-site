import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const fail=(m)=>{console.error('FAIL:',m);process.exitCode=1},ok=(m)=>console.log('OK:',m);
const index=fs.readFileSync('index.html','utf8');
const requiredIds=['authModal','authForm','profileForm','profileGrid','openMessages','chatDrawer','conversationList','activeChat','messageForm','messageStream','logoutButton'];
for(const id of requiredIds) index.includes(`id="${id}"`)?ok(`#${id}`):fail(`missing #${id}`);
if(!index.includes('assets/js/core.js'))fail('core.js is not loaded');else ok('local core.js loaded');
if(index.includes('assets/js/app.js'))fail('legacy app.js still loaded from index');else ok('legacy app.js not loaded');
const files=fs.readdirSync('assets/js').filter(f=>f.endsWith('.js'));
for(const file of files){try{execFileSync(process.execPath,['--check',`assets/js/${file}`],{stdio:'pipe'});ok(`syntax ${file}`)}catch(e){fail(`syntax ${file}: ${e.stderr?.toString()||e.message}`)}}
const runtimeFiles=['assets/js/core.js','assets/js/product.js','assets/js/direct-fix.js','assets/js/community.js','assets/js/profile-flow.js','assets/js/admin-panel.js','assets/js/navigation.js','assets/js/app.js','assets/js/app-stable.js','assets/js/auth-redirect.js','assets/js/account-flow.js'];
for(const path of runtimeFiles){if(!fs.existsSync(path))continue;const src=fs.readFileSync(path,'utf8');if(/raw\.githubusercontent\.com|cdn\.jsdelivr\.net|unpkg\.com/.test(src))fail(`${path} contains external JS runtime dependency`);else ok(`${path} local-runtime only`)}
const direct=fs.readFileSync('assets/js/direct-fix.js','utf8');
for(const needle of ['start_conversation','conversation-item','messageForm','messages','mark_conversation_read'])direct.includes(needle)?ok(`Direct ${needle}`):fail(`Direct missing ${needle}`);
const core=fs.readFileSync('assets/js/core.js','utf8');
for(const needle of ['persistSession:true','autoRefreshToken:true','https://znakomy.online/','loadProfiles','showAccount','logoutButton'])core.includes(needle)?ok(`Core ${needle}`):fail(`Core missing ${needle}`);
const product=fs.readFileSync('assets/js/product.js','utf8');
if(/assets\/js\/i18n\.js|assets\/css\/i18n\.css/.test(product))fail('unstable i18n is still loaded in production');else ok('unstable i18n disabled');
for(const needle of ['community.js','direct-fix.js','public-chat.js','notifications.js','mobile-rescue.css'])product.includes(needle)?ok(`stable loader ${needle}`):fail(`stable loader missing ${needle}`);
const mobile=fs.readFileSync('assets/css/mobile-rescue.css','utf8');
if(!mobile.includes('@media (max-width:820px)'))fail('mobile rescue breakpoint missing');else ok('mobile rescue breakpoint');
for(const path of ['musicians-haifa.html','en/musicians-haifa.html','he/musicians-haifa.html']){if(!fs.existsSync(path)){fail(`missing SEO language page ${path}`);continue}const s=fs.readFileSync(path,'utf8');if(!/hreflang="ru"/.test(s)||!/hreflang="he"/.test(s)||!/hreflang="en"/.test(s))fail(`${path} incomplete hreflang`);else ok(`${path} hreflang complete`)}
if(process.exitCode)process.exit(1);
console.log('\nProduction smoke audit passed: stable UI + auth + Direct + chat + mobile.');
