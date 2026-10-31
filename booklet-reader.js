/* Official booklet reader. PDF content remains hosted by Australian Home Affairs.
   Printed booklet pages are PDF pages +2 (verified from official PDF). */
const ATEST_BOOKLET_URL='https://immi.homeaffairs.gov.au/citizenship-subsite/files/our-common-bond-testable.pdf';
const ATEST_READ_KEY='atest-booklet-reader-v1';
const ATEST_BOOKLET_SECTIONS=[['Part 1 · Australia and its people',7,16],['Part 2 · Democratic beliefs, rights and liberties',17,22],['Part 3 · Government and the law',23,32],['Part 4 · Australian values',33,39],['Glossary',40,43]];
function atestReadBooklet(){try{const v=JSON.parse(localStorage.getItem(ATEST_READ_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
function atestSaveBooklet(v){try{localStorage.setItem(ATEST_READ_KEY,JSON.stringify(v));return true}catch{return false}}
function atestBookletEscape(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function atestBookletPage(p){return Math.min(43,Math.max(7,Number.parseInt(p,10)||7))}
function atestBookletUrl(page){return ATEST_BOOKLET_URL+'#page='+(atestBookletPage(page)+2);}
function atestReaderView(page){
 const state=atestReadBooklet(),p=atestBookletPage(page||state.page||7);state.page=p;atestSaveBooklet(state);
 const esc=atestBookletEscape;
 const checks=state.finished||{},done=Object.values(checks).filter(Boolean).length;
 const options=ATEST_BOOKLET_SECTIONS.map(([label,start,end])=>'<option value="'+start+'"'+(p>=start&&p<=end?' selected':'')+'>'+esc(label)+'</option>').join('');
 const sections=ATEST_BOOKLET_SECTIONS.map(([label,start,end],i)=>'<div class="booklet-section"><label><input type="checkbox" data-booklet-finished="'+i+'" '+(checks[i]?'checked':'')+'> '+esc(label)+'</label><button type="button" data-booklet-page="'+start+'">Read p. '+start+'</button></div>').join('');
 const pdf=atestBookletUrl(p);
 const host=document.getElementById('app');if(!host)return;
 host.innerHTML='<section class="card booklet-reader" aria-label="Official Our Common Bond reader"><div class="eyebrow">OFFICIAL SOURCE · DEPARTMENT OF HOME AFFAIRS</div><h1>Australian Citizenship: Our Common Bond</h1><p>Read the unchanged official testable booklet. Your bookmarks and private reading notes stay on this device, separate from exam scores.</p><div class="booklet-controls"><label>Booklet page <input id="booklet-page" type="number" min="7" max="43" value="'+p+'"></label><button data-booklet-go>Go to page</button><label>Jump to section <select id="booklet-section">'+options+'</select></label><button data-booklet-save>Bookmark current page</button></div><p id="booklet-status" role="status" aria-live="polite">Booklet p. '+p+' · PDF viewer p. '+(p+2)+' · '+done+'/5 sections reviewed</p><iframe title="Official Australian Citizenship Our Common Bond PDF, booklet page '+p+'" src="'+esc(pdf)+'" loading="lazy"></iframe><p class="booklet-fallback">If the document does not display inside your browser, <a href="'+esc(pdf)+'" target="_blank" rel="noopener noreferrer">open the official PDF at this page</a>. <a href="'+ATEST_BOOKLET_URL+'" target="_blank" rel="noopener noreferrer">Download the original booklet</a>.</p><h2>Reading checklist</h2><div class="booklet-checklist">'+sections+'</div><h2>My reading notes</h2><label for="booklet-notes">What should I remember from this reading?</label><textarea id="booklet-notes" rows="4" placeholder="Write key points, tricky words or questions here...">'+esc(state.notes||'')+'</textarea><button type="button" data-booklet-notes>Save notes</button><div class="actions"><button type="button" data-booklet-return>Return to my lesson</button><button type="button" data-view="study">Study syllabus</button><button type="button" data-view="practice">Practise questions</button></div><p class="hint">The original booklet is copyright Commonwealth of Australia 2020, available under CC BY 4.0 except the Coat of Arms. AUS-TEST is an independent study aid.</p></section>';
 window.scrollTo?.({top:0,behavior:'instant'});
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-booklet-open],[data-booklet-page],[data-booklet-go],[data-booklet-save],[data-booklet-notes],[data-booklet-return]');
 if(!trigger)return;
 event.preventDefault();event.stopImmediatePropagation();
 const state=atestReadBooklet();
 if(trigger.hasAttribute('data-booklet-return')){const id=localStorage.getItem('atest-last-domain');if(id&&typeof domainKnowledge!=='undefined'&&domainKnowledge[id])return route('domain/'+id);return route('study');}
 if(trigger.hasAttribute('data-booklet-open'))return atestReaderView(trigger.dataset.bookletOpen||state.page||7);
 if(trigger.hasAttribute('data-booklet-page'))return atestReaderView(trigger.dataset.bookletPage);
 if(trigger.hasAttribute('data-booklet-go'))return atestReaderView(document.getElementById('booklet-page')?.value);
 const current=atestBookletPage(document.getElementById('booklet-page')?.value||state.page||7);
 if(trigger.hasAttribute('data-booklet-save')){state.page=current;atestSaveBooklet(state);}
 if(trigger.hasAttribute('data-booklet-notes')){state.notes=document.getElementById('booklet-notes')?.value||'';atestSaveBooklet(state);}
 const status=document.getElementById('booklet-status');if(status)status.textContent='Saved on this device. Booklet page '+current+'.';
},true);
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='booklet-section')return atestReaderView(el.value);
 if(el.matches?.('[data-booklet-finished]')){
   const state=atestReadBooklet();state.finished=state.finished||{};
   state.finished[el.dataset.bookletFinished]=el.checked;atestSaveBooklet(state);
   const status=document.getElementById('booklet-status');if(status)status.textContent=Object.values(state.finished).filter(Boolean).length+'/5 sections marked reviewed.';
 }
});
