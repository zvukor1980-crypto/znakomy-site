import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const fail=m=>{console.error('FAIL:',m);process.exitCode=1},ok=m=>console.log('OK:',m);
const index=fs.readFileSync('index.html','utf8');
for(const id of ['authModal','authForm','profileForm','profileGrid','openMessages','chatDrawer','conversationList','activeChat','messageForm','messageStream','logoutButton']) index.includes(`id="${id}"`)?ok(`#${id}`):fail(`missing #${id}`);
for(const asset of ['assets/images/znakomy-family-band-v1.jpg','assets/brand/znakomy-mark.svg','assets/brand/znakomy-logo.svg']) fs.existsSync(asset)?ok(`asset ${asset}`):fail(`missing asset ${asset}`);
if(!index.includes('assets/images/znakomy-family-band-v1.jpg'))fail('hero image not referenced');else ok('hero image referenced');
if(!index.includes('/assets/brand/znakomy-mark.svg'))fail('brand mark not referenced');else ok('brand mark referenced');
if(!index.includes('assets/js/core.js'))fail('core.js is not loaded');else ok('local core.js loaded');
const files=fs.readdirSync('assets/js').filter(f=>f.endsWith('.js'));for(const file of files){try{execFileSync(process.execPath,['--check',`assets/js/${file}`],{stdio:'pipe'});ok(`syntax ${file}`)}catch(e){fail(`syntax ${file}`)}}
for(const path of ['assets/js/core.js','assets/js/product.js','assets/js/direct-fix.js','assets/js/community.js','assets/js/profile-flow.js','assets/js/admin-panel.js','assets/js/navigation.js','assets/js/i18n.js']){const src=fs.readFileSync(path,'utf8');if(/raw\.githubusercontent\.com|cdn\.jsdelivr\.net|unpkg\.com/.test(src))fail(`${path} external runtime dependency`);else ok(`${path} local-runtime only`)}
const product=fs.readFileSync('assets/js/product.js','utf8');for(const n of ['community.js','direct-fix.js','public-chat.js','notifications.js','mobile-rescue.css','i18n.js','i18n.css']) product.includes(n)?ok(`loader ${n}`):fail(`loader missing ${n}`);
const i18n=fs.readFileSync('assets/js/i18n.js','utf8');for(const n of ['ru:{','en:{','he:{','znakomy-lang','document.documentElement.dir'])i18n.includes(n)?ok(`i18n ${n}`):fail(`i18n missing ${n}`);if(i18n.includes('MutationObserver'))fail('i18n must not use MutationObserver');else ok('i18n non-destructive: no MutationObserver');
const direct=fs.readFileSync('assets/js/direct-fix.js','utf8');for(const n of ['start_conversation','messageForm','mark_conversation_read'])direct.includes(n)?ok(`Direct ${n}`):fail(`Direct missing ${n}`);
const mobile=fs.readFileSync('assets/css/mobile-rescue.css','utf8');if(!mobile.includes('@media (max-width:820px)'))fail('mobile breakpoint missing');else ok('mobile breakpoint');
if(process.exitCode)process.exit(1);console.log('\nProduction smoke audit passed: assets + core + Direct + chat + RU/HE/EN + mobile.');
