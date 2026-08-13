(()=>{
'use strict';
let deferredInstall=null;
const INSTALLED_KEY='ep-installed-v1';
const sheet=document.getElementById('installSheet');
const installTop=document.getElementById('installTopBtn');
const pill=document.getElementById('connectionPill');
const tabs=[...document.querySelectorAll('#bottomTabs button')];
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
const isInstalled=()=>isStandalone()||localStorage.getItem(INSTALLED_KEY)==='yes';
function rememberInstalled(){localStorage.setItem(INSTALLED_KEY,'yes')}
function active(view){tabs.forEach(b=>{const v=b.dataset.mobileView;const isLearn=view==='lesson'?v==='course':view==='exam'||view==='updates'||view==='more'?v==='profile':v===view;b.classList.toggle('active',!!isLearn)})}
function updateInstallVisibility(){if(isStandalone())rememberInstalled();if(installTop)installTop.hidden=isInstalled()}
function closeSheet(){sheet.hidden=true;sheet.innerHTML=''}
function iosInstructions(){sheet.hidden=false;sheet.innerHTML=`<div class="installPanel"><div class="installIcon">EP</div><h2>Install English Pathways</h2><p>On iPhone or iPad, use Safari:</p><ol><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Confirm <b>Add</b>.</li></ol><p><small>After the app is opened from the Home Screen, the install buttons disappear automatically.</small></p><div class="buttons"><button class="primary" id="closeInstall">Got it</button></div></div>`;document.getElementById('closeInstall').onclick=closeSheet}
async function installApp(){if(isInstalled()){window.EnglishPathways?.say?.('The app is already installed.');updateInstallVisibility();return}if(deferredInstall){deferredInstall.prompt();const choice=await deferredInstall.userChoice;if(choice?.outcome==='accepted')rememberInstalled();deferredInstall=null;updateInstallVisibility();return}if(isIOS()){iosInstructions();return}sheet.hidden=false;sheet.innerHTML=`<div class="installPanel"><div class="installIcon">EP</div><h2>Install English Pathways</h2><p>If your browser does not show an install prompt, open its menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p><div class="buttons"><button class="primary" id="closeInstall">Got it</button></div></div>`;document.getElementById('closeInstall').onclick=closeSheet}
async function requestPersistentStorage(){if(navigator.storage?.persist)return await navigator.storage.persist();return false}
async function shareApp(){if(navigator.share){try{await navigator.share({title:'English Pathways',text:'English Pathways learning app',url:location.href});return true}catch(e){return false}}return false}
function connection(){const off=!navigator.onLine;pill.hidden=!off;pill.textContent='Offline';document.querySelector('.offlineNotice')?.remove();if(off){const n=document.createElement('div');n.className='offlineNotice';n.textContent='Offline mode: cached lessons still work. AI, cloud sync and teacher submission need internet.';document.querySelector('.appTopbar')?.after(n)}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;updateInstallVisibility()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;rememberInstalled();updateInstallVisibility();window.EnglishPathways?.say?.('English Pathways installed.')});
window.addEventListener('online',connection);window.addEventListener('offline',connection);
window.addEventListener('ep:viewchange',e=>active(e.detail.view));
tabs.forEach(b=>b.addEventListener('click',()=>{window.EnglishPathways?.soundFx?.('tap');if(b.dataset.mobileAction==='dictionary')return window.EnglishPathways?.openDictionary?.();const v=b.dataset.mobileView;if(v)window.EnglishPathways?.go?.(v)}));
installTop?.addEventListener('click',installApp);sheet?.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});
if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}))}
if(isStandalone())rememberInstalled();
connection();updateInstallVisibility();active(document.body.dataset.view);
window.EnglishPathwaysMobile={installApp,requestPersistentStorage,shareApp,isStandalone,isInstalled,rememberInstalled};
})();
