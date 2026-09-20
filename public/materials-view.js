import { auth, db, onAuthStateChanged, collection, query, where, onSnapshot } from './firebase-config.js';
import { getGroupsForYear, getYearLabel, isValidYearGroup } from './year-group-config.js';
import { safeMaterialURL, subjectKey } from './material-utils.js';
import { connectMaterialLinks } from './supabase-storage.js';
connectMaterialLinks();
const host = document.querySelector('[data-materials-year]');
if (host) {
 const year = host.dataset.materialsYear;
 const fixedGroup = host.dataset.materialsGroup || '';
 const subject = host.dataset.materialsSubject || '';
 let stop = () => {}, user = null, generation = 0, records = [];
 const el = (tag, text, cls) => { const n=document.createElement(tag); if(text)n.textContent=text; if(cls)n.className=cls; return n; };
 const heading=el('h2','Uploaded study materials');
 const controls=el('div',null,'material-controls');
 const label=el('label','Group / Branch '); const groups=el('select'); groups.setAttribute('aria-label','Group / Branch');
 for(const group of getGroupsForYear(year)) { const o=el('option',group.label);o.value=group.id;groups.append(o); }
 if (fixedGroup && isValidYearGroup(year,fixedGroup)) groups.value=fixedGroup;
 else if(year === 'year-1') groups.value=localStorage.getItem('dbatu_group') === 'B' ? 'group-b':'group-a';
 groups.disabled=Boolean(fixedGroup); label.append(groups);
 const search=el('input');search.type='search';search.placeholder='Search uploaded materials';search.setAttribute('aria-label','Search uploaded materials');
 controls.append(label,search);
 const status=el('p','Sign in to view materials.');status.setAttribute('role','status');
 const list=el('div',null,'material-grid');
 host.replaceChildren(heading,controls,status,list);
 function render() {
  list.replaceChildren(); const needle=search.value.toLowerCase();
  const matches=records.filter(m => (!subject || subjectKey(m.subject)===subjectKey(subject) || subjectKey(m.subjectId)===subjectKey(subject)) && [m.title,m.subject,m.description,m.type].join(' ').toLowerCase().includes(needle));
  status.textContent=matches.length ? `${matches.length} material(s) · ${getYearLabel(year)}` : 'No matching materials uploaded yet.';
  for(const m of matches) {
   const card=el('article',null,'material-card');card.append(el('h3',m.title || 'Untitled material'));
   card.append(el('p',[m.subject,m.semester,m.type].filter(Boolean).join(' · ')));
   if(m.description)card.append(el('p',m.description));
   const url=safeMaterialURL(m.downloadURL);
   if(url) { const link=el('a','View / Download');link.href=url;link.target='_blank';link.rel='noopener noreferrer';card.append(link); }
   else card.append(el('p','File unavailable. Please contact an administrator.'));
   list.append(card);
  }
 }
 function subscribe() {
  stop(); const thisGeneration=++generation; records=[];list.replaceChildren();
  if(!user)return;
  if(!isValidYearGroup(year,groups.value)){status.textContent='Select a valid group.';return;}
  status.textContent='Loading materials…';
  const q=query(collection(db,'materials'),where('yearId','==',year),where('groupId','==',groups.value),where('published','==',true));
  stop=onSnapshot(q,snap=>{
   if(thisGeneration!==generation)return;
   records=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));render();
  },error=>{if(thisGeneration!==generation)return;records=[];list.replaceChildren();status.textContent='Could not load materials. Please retry or contact an administrator.';console.error('Materials read failed:',error.code);});
 }
 groups.addEventListener('change',subscribe);search.addEventListener('input',render);
 const unsubscribeAuth=onAuthStateChanged(auth,u=>{user=u; if(!u){stop();records=[];list.replaceChildren();location.replace('login.html');return;}subscribe();});
 window.addEventListener('pagehide',()=>{stop();unsubscribeAuth();},{once:true});
 // Follow the original first-year group buttons without changing their design.
 document.getElementById('group-selector')?.addEventListener('click',()=>queueMicrotask(()=>{groups.value=localStorage.getItem('dbatu_group')==='B'?'group-b':'group-a';subscribe();}));
}
