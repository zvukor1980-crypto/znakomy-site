import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const fail=m=>{console.error('FAIL:',m);process.exitCode=1},ok=m=>console.log('OK:',m);
const index=fs.readFileSync('index.html','utf8');
for(const id of ['authModal','authForm','profileForm','profileGrid','openMessages','chatDrawer','conversationList','activeChat','messageForm','messageStream','logoutButton']) index.includes(`id="${id}"`)?ok(`#${id}`):fail(`missing #${id}`);
for(const asset of ['assets/images/znakomy-family-band-v1.jpg','assets/brand/znakomy-mark.svg','assets/brand/znakomy-logo.svg']) fs.existsSync(asset)?ok(`asset ${asset}`):fail(`missing asset ${asset}`);
if(!index.includes('assets/images/znakomy-family-band-v1.jpg'))fail('hero image not referenced');else ok('hero image referenced');
if(!index.includes('/assets/brand/znakomy-mark.svg'))fail('brand mark not referenced');else ok('brand mark referenced');
if(!index.includes('assets/js/core.js'))fail('core.js is not loaded');else ok('local core.js loaded');

const jsFiles=fs.readdirSync('assets/js').filter(f=>f.endsWith('.js'));
for(const file of jsFiles){try{execFileSync(process.execPath,['--check',`assets/js/${file}`],{stdio:'pipe'});ok(`syntax ${file}`)}catch(e){fail(`syntax ${file}`)}}
for(const p of ['assets/js/core.js','assets/js/product.js','assets/js/direct-fix.js','assets/js/community.js','assets/js/profile-flow.js','assets/js/admin-panel.js','assets/js/navigation.js','assets/js/i18n.js','assets/js/repair.js','assets/js/link-audit.js']){const src=fs.readFileSync(p,'utf8');if(/raw\.githubusercontent\.com|cdn\.jsdelivr\.net|unpkg\.com/.test(src))fail(`${p} external runtime dependency`);else ok(`${p} local-runtime only`)}

const product=fs.readFileSync('assets/js/product.js','utf8');
for(const n of ['community.js','direct-fix.js','public-chat.js','notifications.js','mobile-rescue.css','i18n.js','i18n.css','repair.js','repair.css','link-audit.js'])product.includes(n)?ok(`loader ${n}`):fail(`loader missing ${n}`);
for(const n of ['submitReviewButton','publicChatEmergency','floatingPublicChat','znakomy-hero-title-final'])product.includes(n)?ok(`runtime safeguard ${n}`):fail(`runtime safeguard missing ${n}`);

const i18n=fs.readFileSync('assets/js/i18n.js','utf8');
for(const n of ['ru:{','en:{','he:{','znakomy-lang','document.documentElement.dir','znakomy:language','myProfile','profilePending'])i18n.includes(n)?ok(`i18n ${n}`):fail(`i18n missing ${n}`);
if(i18n.includes('MutationObserver'))fail('i18n must not use MutationObserver');else ok('i18n non-destructive: no MutationObserver');

const direct=fs.readFileSync('assets/js/direct-fix.js','utf8');
for(const n of ['start_conversation','messageForm','mark_conversation_read'])direct.includes(n)?ok(`Direct ${n}`):fail(`Direct missing ${n}`);

const community=fs.readFileSync('assets/js/community.js','utf8');
for(const n of ["ru:{","en:{","he:{","znakomy:language","dataset.community","market_listings"])community.includes(n)?ok(`Community ${n}`):fail(`Community missing ${n}`);

const adminPanel=fs.readFileSync('assets/js/admin-panel.js','utf8');
for(const n of ['shell.hidden = true','shell.hidden=false','shell.hidden=true'])adminPanel.includes(n)?ok(`Admin panel privacy ${n}`):fail(`Admin panel privacy missing ${n}`);

const repair=fs.readFileSync('assets/js/repair.js','utf8');
for(const n of ['repair_requests','db.from','ZnakomyRepair','ru:','en:','he:','znakomy:language'])repair.includes(n)?ok(`Repair ${n}`):fail(`Repair missing ${n}`);

const navigation=fs.readFileSync('assets/js/navigation.js','utf8');
for(const n of ['public-chat-shell','community-shell','community-section','public-chat','repairModal','data-public-chat-close','data-repair-close'])navigation.includes(n)?ok(`History ${n}`):fail(`History missing ${n}`);

const linkAudit=fs.readFileSync('assets/js/link-audit.js','utf8');
for(const n of ['bands-haifa.html','jams-haifa.html','ads-haifa.html','music-market-haifa.html','card.dataset.community','e.defaultPrevented'])linkAudit.includes(n)?ok(`Feature routing ${n}`):fail(`Feature routing missing ${n}`);

const mobile=fs.readFileSync('assets/css/mobile-rescue.css','utf8');
if(!mobile.includes('@media (max-width:820px)'))fail('mobile breakpoint missing');else ok('mobile breakpoint');

const htmlFiles=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(ent.name))continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.name.endsWith('.html'))htmlFiles.push(p)}}
walk('.');
let checked=0;
for(const file of htmlFiles){
  const src=fs.readFileSync(file,'utf8');
  const re=/(?:href|src)=["']([^"']+)["']/g;let m;
  while((m=re.exec(src))){
    let u=m[1].trim();
    if(!u||u.startsWith('#')||u.startsWith('mailto:')||u.startsWith('tel:')||u.startsWith('javascript:')||/^https?:\/\//.test(u)||u.startsWith('data:'))continue;
    if(['/\#groups','/\#jams','/\#events'].includes(u))fail(`${file}: stale homepage anchor ${u}`);
    u=u.split('#')[0].split('?')[0];if(!u)continue;
    let target;if(u==='/'||u==='')target='index.html';else if(u.startsWith('/'))target=u.slice(1);else target=path.normalize(path.join(path.dirname(file),u));
    if(!target)target='index.html';if(target.endsWith('/'))target=path.join(target,'index.html');if(!path.extname(target)&&fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    checked++;if(!fs.existsSync(target))fail(`${file}: broken local link ${m[1]} -> ${target}`);
  }
}
ok(`local href/src targets checked: ${checked}`);

for(const p of ['ads-haifa.html','en/ads-haifa.html','he/ads-haifa.html'])fs.existsSync(p)?ok(`ads page ${p}`):fail(`missing ${p}`);

const sitemap=fs.readFileSync('sitemap.xml','utf8');
const seoPages=htmlFiles.filter(p=>p!=='index.html'&&!p.startsWith('.github/')&&!p.includes('seo-fragment'));
for(const p of seoPages){const url='https://znakomy.online/'+p.replaceAll('\\','/');sitemap.includes(`<loc>${url}</loc>`)?ok(`sitemap ${p}`):fail(`sitemap missing ${p}`)}

if(process.exitCode)process.exit(1);
console.log('\nProduction smoke audit passed: assets + links + sitemap + core + Direct + community + chat + repair + history + RU/HE/EN + mobile + regression safeguards.');
