/* Browser-native, continuously scrolling rendering of the unchanged
   Australian Citizenship: Our Common Bond source PDF.
   PDF raster pages are generated in CI from the exact locally hosted PDF.
   Original source and optional selectable transcripts remain available. */
const ATEST_BOOKLET_URL='/A-Test/assets/our-common-bond-testable.pdf';
const ATEST_BOOKLET_OFFICIAL_URL='https://immi.homeaffairs.gov.au/citizenship-subsite/files/our-common-bond-testable.pdf';
const ATEST_BOOKLET_IMAGES='assets/booklet-pages/';
const ATEST_READ_KEY='atest-booklet-reader-v1';
const ATEST_PDF_PAGE_COUNT=50;
const ATEST_BOOKLET_SECTIONS=[
 ['Part 1 · Australia and its people',7,16],
 ['Part 2 · Democratic beliefs, rights and liberties',17,22],
 ['Part 3 · Government and the law',23,32],
 ['Part 4 · Australian values',33,39],
 ['Glossary',40,43]
];
let atestBookletScrollPending=false;
let atestTranscriptPromise=null;

function atestReadBooklet(){
 try{
  const data=JSON.parse(localStorage.getItem(ATEST_READ_KEY)||'{}');
  return data&&typeof data==='object'&&!Array.isArray(data)?data:{};
 }catch{return {}}
}
function atestSaveBooklet(data){
 try{localStorage.setItem(ATEST_READ_KEY,JSON.stringify(data));return true}
 catch{return false}
}
function atestBookletEscape(x){
 return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}
function atestBookletPage(p){return Math.min(43,Math.max(7,Number.parseInt(p,10)||7))}
function atestBookletPdfPage(p){return Math.min(ATEST_PDF_PAGE_COUNT,Math.max(1,Number.parseInt(p,10)||9))}
function atestBookletUrl(page){return ATEST_BOOKLET_URL+'#page='+(atestBookletPage(page)+2)}
function atestBookletImage(pdf){
 return ATEST_BOOKLET_IMAGES+'page-'+String(pdf).padStart(3,'0')+'.jpg';
}
function atestBookletPageDescription(pdf){
 if(pdf>=9&&pdf<=45)return 'Booklet page '+(pdf-2)+' · PDF page '+pdf;
 return 'PDF page '+pdf+' · front or supplementary material';
}
function atestCurrentPdfPage(){
 return atestBookletPdfPage(atestReadBooklet().pdfPage||9);
}
function atestUpdateReaderPosition(pdf,quiet=false){
 const current=atestBookletPdfPage(pdf),record=atestReadBooklet();
 if(record.pdfPage!==current){
  record.pdfPage=current;
  if(current>=9&&current<=45)record.page=current-2;
  atestSaveBooklet(record);
 }
 const label=document.getElementById('booklet-page-indicator');
 if(label)label.textContent=atestBookletPageDescription(current);
 const pageInput=document.getElementById('booklet-page');
 if(pageInput&&current>=9&&current<=45)pageInput.value=String(current-2);
 if(!quiet){
  const status=document.getElementById('booklet-status');
  if(status)status.textContent='Reading position saved: '+atestBookletPageDescription(current)+'.';
 }
}
function atestBookletGoPdf(pdf,announce=true){
 const n=atestBookletPdfPage(pdf);
 const target=document.getElementById('booklet-pdf-page-'+n);
 if(!target)return;
 atestUpdateReaderPosition(n,!announce);
 target.scrollIntoView({block:'start',behavior:'auto'});
}
function atestBookletTrackScroll(){
 if(atestBookletScrollPending||!document.querySelector('.booklet-pages'))return;
 atestBookletScrollPending=true;
 requestAnimationFrame(()=>{
  atestBookletScrollPending=false;
  if(!document.querySelector('.booklet-pages'))return;
  const marker=Math.min(innerHeight*.38,280);
  let closest=null;
  for(const page of document.querySelectorAll('.booklet-page')){
   const bounds=page.getBoundingClientRect();
   if(bounds.top<=marker&&bounds.bottom>marker){closest=page;break}
   if(bounds.top>marker){closest=page;break}
  }
  if(closest)atestUpdateReaderPosition(Number(closest.dataset.pdfPage),true);
 });
}
window.addEventListener('scroll',atestBookletTrackScroll,{passive:true});
window.addEventListener('resize',atestBookletTrackScroll,{passive:true});

function atestBookletPagesHtml(targetPdf){
 let html='';
 for(let pdf=1;pdf<=ATEST_PDF_PAGE_COUNT;pdf++){
  const label=atestBookletPageDescription(pdf);
  const image=atestBookletImage(pdf),alt='Original Our Common Bond page image: '+label;
  html+='<figure class="booklet-page" id="booklet-pdf-page-'+pdf+'" data-pdf-page="'+pdf+'" tabindex="-1">'+
   '<figcaption>'+atestBookletEscape(label)+'</figcaption>'+
   '<a href="'+image+'" target="_blank" rel="noopener noreferrer" aria-label="Open large image of '+atestBookletEscape(label)+' in a new tab">'+
   '<img src="'+image+'" width="1012" height="1432" alt="'+atestBookletEscape(alt)+'" loading="'+(Math.abs(pdf-targetPdf)<=1?'eager':'lazy')+'" decoding="async"></a>'+
   '<details data-booklet-transcript="'+pdf+'"><summary>Read selectable text from this page</summary>'+
   '<div class="booklet-transcript" aria-live="polite">Opening the text transcript…</div></details></figure>';
 }
 return html;
}
function atestReaderView(page){
 const saved=atestReadBooklet(),given=page!==undefined&&page!==null&&page!=='';
 const printed=atestBookletPage(given?page:(saved.page||7));
 const currentPdf=given?printed+2:atestBookletPdfPage(saved.pdfPage||printed+2);
 const checks=saved.finished||{},done=Object.values(checks).filter(Boolean).length;
 const escape=atestBookletEscape;
 const options=ATEST_BOOKLET_SECTIONS.map(([label,start,end])=>
  '<option value="'+start+'"'+(printed>=start&&printed<=end?' selected':'')+'>'+escape(label)+'</option>'
 ).join('');
 const sections=ATEST_BOOKLET_SECTIONS.map(([label,start],i)=>
  '<div class="booklet-section"><label><input type="checkbox" data-booklet-finished="'+i+'" '+(checks[i]?'checked':'')+'> '+escape(label)+'</label>'+
  '<button type="button" data-booklet-page="'+start+'">Jump to p. '+start+'</button></div>'
 ).join('');
 const host=document.getElementById('app');if(!host)return;
 host.innerHTML='<section class="card booklet-reader" aria-label="Official Our Common Bond reader">'+
  '<div class="eyebrow">OFFICIAL SOURCE · DEPARTMENT OF HOME AFFAIRS</div>'+
  '<h1>Australian Citizenship: Our Common Bond</h1>'+
  '<p>Read the unmodified official booklet as a continuous, scrollable document. Pages are images created from the PDF stored on AUS-TEST. Use the selectable page transcript or open the original PDF when needed.</p>'+
  '<div class="booklet-controls">'+
  '<label>Booklet page <input id="booklet-page" type="number" min="7" max="43" value="'+printed+'"></label>'+
  '<button type="button" data-booklet-go>Go to page</button>'+
  '<label>Jump to section <select id="booklet-section">'+options+'</select></label>'+
  '<button type="button" data-booklet-save>Save reading place</button></div>'+
  '<div class="booklet-reader-toolbar"><button type="button" data-booklet-step="-1">← Previous page</button>'+
  '<strong id="booklet-page-indicator">'+escape(atestBookletPageDescription(currentPdf))+'</strong>'+
  '<button type="button" data-booklet-step="1">Next page →</button></div>'+
  '<p id="booklet-status" role="status" aria-live="polite">'+done+'/5 sections reviewed. Scroll down to read continuously.</p>'+
  '<div class="booklet-pages" aria-label="Original booklet pages, scroll vertically">'+atestBookletPagesHtml(currentPdf)+'</div>'+
  '<p class="booklet-fallback"><a href="'+escape(atestBookletUrl(printed))+'" target="_blank" rel="noopener noreferrer">Open the full original PDF in a new tab</a> · '+
  '<a href="'+ATEST_BOOKLET_URL+'" target="_blank" rel="noopener noreferrer">Download the original PDF</a></p>'+
  '<h2>Reading checklist</h2><div class="booklet-checklist">'+sections+'</div>'+
  '<h2>My reading notes</h2><label for="booklet-notes">What should I remember from this reading?</label>'+
  '<textarea id="booklet-notes" rows="4" placeholder="Key points, tricky words and questions...">'+escape(saved.notes||'')+'</textarea>'+
  '<button type="button" data-booklet-notes>Save notes</button>'+
  '<div class="actions"><button type="button" data-booklet-return>Return to my lesson</button>'+
  '<button type="button" data-view="study">Study syllabus</button>'+
  '<button type="button" data-view="practice">Practise questions</button></div>'+
  '<p class="hint">Original Commonwealth of Australia booklet (2020), licensed CC BY 4.0 except the Coat of Arms. The source PDF is preserved. Text transcripts are extracted for accessibility; the original page images remain authoritative for layout and symbols.</p></section>';
 const state=atestReadBooklet();
 state.pdfPage=currentPdf;
 if(currentPdf>=9&&currentPdf<=45)state.page=currentPdf-2;
 atestSaveBooklet(state);
 requestAnimationFrame(()=>atestBookletGoPdf(currentPdf,false));
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-booklet-open],[data-booklet-page],[data-booklet-go],[data-booklet-save],[data-booklet-notes],[data-booklet-return],[data-booklet-step]');
 if(!trigger)return;
 event.preventDefault();event.stopImmediatePropagation();
 const saved=atestReadBooklet();
 if(trigger.hasAttribute('data-booklet-return')){
  const id=localStorage.getItem('atest-last-domain');
  return id&&typeof domainKnowledge!=='undefined'&&domainKnowledge[id]?route('domain/'+id):route('study');
 }
 if(trigger.hasAttribute('data-booklet-open'))return atestReaderView(trigger.dataset.bookletOpen||saved.page||7);
 if(trigger.hasAttribute('data-booklet-page'))return atestBookletGoPdf(atestBookletPage(trigger.dataset.bookletPage)+2);
 if(trigger.hasAttribute('data-booklet-go'))return atestBookletGoPdf(atestBookletPage(document.getElementById('booklet-page')?.value)+2);
 if(trigger.hasAttribute('data-booklet-step'))return atestBookletGoPdf(atestCurrentPdfPage()+Number(trigger.dataset.bookletStep));
 if(trigger.hasAttribute('data-booklet-notes'))saved.notes=document.getElementById('booklet-notes')?.value||'';
 if(trigger.hasAttribute('data-booklet-save'))saved.pdfPage=atestCurrentPdfPage();
 atestSaveBooklet(saved);
 const message=document.getElementById('booklet-status');
 if(message)message.textContent='Saved on this device. '+atestBookletPageDescription(saved.pdfPage||9)+'.';
},true);
document.addEventListener('change',event=>{
 const item=event.target;
 if(item.id==='booklet-section')atestBookletGoPdf(atestBookletPage(item.value)+2);
 if(item.matches?.('[data-booklet-finished]')){
  const data=atestReadBooklet();data.finished=data.finished||{};
  data.finished[item.dataset.bookletFinished]=item.checked;atestSaveBooklet(data);
  const status=document.getElementById('booklet-status');
  if(status)status.textContent=Object.values(data.finished).filter(Boolean).length+'/5 sections reviewed.';
 }
});
document.addEventListener('input',event=>{
 if(event.target?.id!=='booklet-notes')return;
 const data=atestReadBooklet();data.notes=event.target.value;atestSaveBooklet(data);
});
document.addEventListener('toggle',event=>{
 const node=event.target.closest?.('details[data-booklet-transcript]');
 if(!node?.open)return;
 const target=node.querySelector('.booklet-transcript');
 if(!target||node.dataset.loaded==='true')return;
 if(!atestTranscriptPromise){
  atestTranscriptPromise=fetch(ATEST_BOOKLET_IMAGES+'transcripts.json').then(r=>{
   if(!r.ok)throw new Error('Transcript HTTP '+r.status);
   return r.json();
  }).catch(error=>{atestTranscriptPromise=null;throw error});
 }
 atestTranscriptPromise.then(data=>{
  target.textContent=data[node.dataset.bookletTranscript]||'This page has no extractable text. Open the original PDF.';
  target.style.whiteSpace='pre-wrap';
  node.dataset.loaded='true';
 }).catch(()=>{
  target.textContent='The text transcript is not available. Open the unmodified PDF using the link below the pages.';
 });
},true);
