(()=>{
'use strict';
let deferredInstall=null;
let allowLeave=false;
const INSTALLED_KEY='ep-installed-v1';
const INSTALL_NUDGE_KEY='ep-install-nudge-v2';
const INSTALL_NUDGE_DELAY=1300;
const INSTALL_NUDGE_REPEAT=7*24*60*60*1000;
const sheet=document.getElementById('installSheet');
const installTop=document.getElementById('installTopBtn');
const pill=document.getElementById('connectionPill');
const tabs=[...document.querySelectorAll('#bottomTabs button')];
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
const isMobile=()=>/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)||matchMedia('(max-width: 760px)').matches;
const isInstalled=()=>isStandalone()||localStorage.getItem(INSTALLED_KEY)==='yes';
function rememberInstalled(){localStorage.setItem(INSTALLED_KEY,'yes')}
function active(view){tabs.forEach(b=>{const v=b.dataset.mobileView;const isLearn=view==='lesson'?v==='course':view==='exam'||view==='updates'||view==='more'||view==='faq'||view==='contact'?v==='profile':v===view;b.classList.toggle('active',!!isLearn)})}
function updateInstallVisibility(){if(isStandalone())rememberInstalled();if(installTop)installTop.hidden=isInstalled()}
function closeSheet(){sheet.hidden=true;sheet.innerHTML=''}
function iosInstructions(auto=false){sheet.hidden=false;sheet.innerHTML=`<div class="installPanel"><div class="installIcon">EP</div><div class="eyebrow">${auto?'Install for easier access':'Install English Pathways'}</div><h2>Put English Pathways on your Home Screen</h2><p>On iPhone or iPad, use your browser menu:</p><ol><li>Tap <b>Share</b>.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Confirm <b>Add</b>.</li></ol><p><small>After you open the installed app from the Home Screen, install buttons disappear automatically.</small></p><div class="buttons"><button class="primary" id="closeInstall">Got it</button>${auto?'<button class="ghost" id="installLater">Not now</button>':''}</div></div>`;document.getElementById('closeInstall').onclick=closeSheet;document.getElementById('installLater')?.addEventListener('click',closeSheet)}
function genericInstallHelp(auto=false){sheet.hidden=false;sheet.innerHTML=`<div class="installPanel"><div class="installIcon">EP</div><div class="eyebrow">${auto?'English Pathways works better installed':'Install English Pathways'}</div><h2>Add the course to your phone</h2><p>Open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p><div class="buttons"><button class="primary" id="closeInstall">Got it</button>${auto?'<button class="ghost" id="installLater">Not now</button>':''}</div></div>`;document.getElementById('closeInstall').onclick=closeSheet;document.getElementById('installLater')?.addEventListener('click',closeSheet)}
async function installApp(){if(isInstalled()){window.EnglishPathways?.say?.('The app is already installed.');updateInstallVisibility();return}if(deferredInstall){deferredInstall.prompt();const choice=await deferredInstall.userChoice;if(choice?.outcome==='accepted')rememberInstalled();deferredInstall=null;updateInstallVisibility();closeSheet();return}if(isIOS()){iosInstructions(false);return}genericInstallHelp(false)}
function showInstallNudge(){if(isInstalled()||!isMobile()||!sheet?.hidden)return;const last=Number(localStorage.getItem(INSTALL_NUDGE_KEY)||0);if(last&&Date.now()-last<INSTALL_NUDGE_REPEAT)return;localStorage.setItem(INSTALL_NUDGE_KEY,String(Date.now()));if(deferredInstall){sheet.hidden=false;sheet.innerHTML=`<div class="installPanel autoInstallPanel"><div class="installIcon">EP</div><div class="eyebrow">One tap away</div><h2>Install English Pathways</h2><p>Study in a cleaner full-screen app and return directly from your Home Screen.</p><div class="buttons"><button class="primary" id="autoInstallNow">Install app</button><button class="ghost" id="installLater">Not now</button></div></div>`;document.getElementById('autoInstallNow').onclick=installApp;document.getElementById('installLater').onclick=closeSheet;return}if(isIOS())iosInstructions(true);else genericInstallHelp(true)}
async function requestPersistentStorage(){if(navigator.storage?.persist)return await navigator.storage.persist();return false}
async function shareApp(){if(navigator.share){try{await navigator.share({title:'English Pathways',text:'English Pathways learning app',url:location.href});return true}catch(e){return false}}return false}
function connection(){const off=!navigator.onLine;pill.hidden=!off;pill.textContent='Offline';document.querySelector('.offlineNotice')?.remove();if(off){const n=document.createElement('div');n.className='offlineNotice';n.textContent='Offline mode: cached lessons still work. AI, cloud sync and teacher submission need internet.';document.querySelector('.appTopbar')?.after(n)}}
function showExitConfirm(){sheet.hidden=false;sheet.innerHTML=`<div class="installPanel exitPanel compactExit"><h2>Are you sure you want to exit?</h2><div class="buttons"><button class="primary" id="stayInApp">No</button><button class="ghost" id="leaveApp">Exit</button></div></div>`;document.getElementById('stayInApp').onclick=closeSheet;document.getElementById('leaveApp').onclick=()=>{closeSheet();allowLeave=true;history.back()}}
function armBackGuard(){try{if(!history.state?.epBase)history.replaceState({...history.state,epBase:true},'',location.href);history.pushState({epGuard:true},'',location.href)}catch(e){}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;updateInstallVisibility();setTimeout(showInstallNudge,INSTALL_NUDGE_DELAY)});
window.addEventListener('appinstalled',()=>{deferredInstall=null;rememberInstalled();updateInstallVisibility();closeSheet();window.EnglishPathways?.say?.('English Pathways installed.')});
window.addEventListener('online',connection);window.addEventListener('offline',connection);
window.addEventListener('ep:viewchange',e=>active(e.detail.view));
window.addEventListener('ep:exitrequest',showExitConfirm);
window.addEventListener('popstate',()=>{if(allowLeave){allowLeave=false;setTimeout(()=>{try{history.back()}catch(e){}},0);return}try{history.pushState({epGuard:true},'',location.href)}catch(e){}const v=window.EnglishPathways?.getView?.();if(v&&v!=='dashboard'&&v!=='onboard')window.EnglishPathways?.goBack?.();else showExitConfirm()});
tabs.forEach(b=>b.addEventListener('click',()=>{window.EnglishPathways?.soundFx?.('tap');if(b.dataset.mobileAction==='dictionary')return window.EnglishPathways?.openDictionary?.();const v=b.dataset.mobileView;if(v)window.EnglishPathways?.go?.(v)}));
installTop?.addEventListener('click',installApp);sheet?.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});
if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}))}
if(isStandalone())rememberInstalled();
connection();updateInstallVisibility();active(document.body.dataset.view);armBackGuard();
if(isMobile()&&!isInstalled())setTimeout(showInstallNudge,INSTALL_NUDGE_DELAY+500);
window.EnglishPathwaysMobile={installApp,requestPersistentStorage,shareApp,isStandalone,isInstalled,rememberInstalled,showInstallNudge};
})();
