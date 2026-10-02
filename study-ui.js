/* Study UI: safe saved state, complete study navigation and application routes.
   Loaded after the curriculum and before the optional arcade. */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const number = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  const memory = new Map();
  let storageUnavailable = false;
  function storageNotice() {
    storageUnavailable = true;
    if (document.getElementById('storage-notice')) return;
    const notice = document.createElement('p'); notice.id = 'storage-notice'; notice.className = 'storage-notice'; notice.setAttribute('role', 'status');
    notice.textContent = 'Device storage is unavailable. You can keep studying, but progress may not survive closing this tab.';
    document.querySelector('.topbar')?.after(notice);
  }
  if (localStorage.available === false) storageNotice();
  window.addEventListener('atest-storage-warning', storageNotice);
  const read = key => { try { return localStorage.getItem(key) ?? memory.get(key) ?? null; } catch { storageNotice(); return memory.get(key) ?? null; } };
  const write = (key, value) => { memory.set(key, String(value)); try { localStorage.setItem(key, String(value)); } catch { storageNotice(); } };
  function normalise(source) {
    const s = record(source), result = {stats:{}, known:{}, missed:{}, mocks:[], reviews:{}, domains:{}, domainEvidence:{}};
    for (const field of ['stats', 'domainEvidence']) for (const [key, raw] of Object.entries(record(s[field]))) {
      if (!(field === 'stats' ? topicInfo[key] : domainKnowledge[key])) continue;
      const value = record(raw), t = number(value.t); result[field][key] = {t, c:Math.min(t, number(value.c))};
    }
    for (const [key, raw] of Object.entries(record(s.domains))) if (domainKnowledge[key]) result.domains[key] = Math.min(3, number(raw));
    for (const [key, raw] of Object.entries(record(s.missed))) if (questions.some(q => q[1] === key)) result.missed[key] = number(raw);
    for (const [key, raw] of Object.entries(record(s.known))) if (flashcards[key]) result.known[key] = raw === true;
    for (const [key, raw] of Object.entries(record(s.reviews))) if (flashcards[key]) result.reviews[key] = number(raw);
    result.mocks = (Array.isArray(s.mocks) ? s.mocks : []).filter(m => m && typeof m === 'object' && Number.isFinite(m.score) && Number.isFinite(m.values)).slice(-10).map(m => ({...m, score:Math.min(20, number(m.score)), values:Math.min(5, number(m.values)), date:number(m.date)}));
    return result;
  }
  // Do not clear or overwrite a learner's stored record during migration.
  state = normalise(state);
  save = () => write('atest-state', JSON.stringify(state));
  function resumeDomain() {
    const all = orderedDomains(), last = read('atest-last-domain');
    return all.find(d => d.id === last && (state.domains[d.id] || 0) < 3) || all.find(d => (state.domains[d.id] || 0) < 3) || all[0];
  }
  function tools() {
    return `<section class="card study-library" id="study-library"><div class="eyebrow">LEARNING LIBRARY</div><h2>All your study tools</h2><p>Choose depth, recall or a complete curriculum check.</p><div class="study-tool-grid">${[['readings','Readings','Long-form explanations'],['learn','Lessons','Examples and context'],['glossary','Glossary','Plain-English terms'],['visual','Visual stories','Explore connected ideas'],['map','States & capitals','Explore and test recall'],['cards','Flashcards','Reveal and rate'],['syllabus','Curriculum','The complete domain map'],['audit','Coverage audit','Teaching and evidence checks']].map(([view,title,detail]) => `<button data-view="${view}"><b>${title}</b><small>${detail}</small></button>`).join('')}</div><h3>Topic study guides</h3><div class="actions">${Object.keys(topicInfo).map(id => `<button data-study="${id}">${topicInfo[id].name}</button>`).join('')}</div></section>`;
  }
  study = function () {
    const all = orderedDomains(), next = resumeDomain(), done = all.filter(d => (state.domains[d.id] || 0) >= 3).length;
    app.innerHTML = pageHead('STUDY','Your course, all in one place','Jump to any part below. Read, practise and return to the exact idea you left.') +
      `<section class="card study-resume" id="study-continue"><div><div class="eyebrow">CONTINUE STUDYING</div><h2>${domainKnowledge[next.id].title}</h2><p>${done} / ${all.length} domains verified</p></div><button class="btn primary" data-study-resume>Continue →</button></section>` +
      `<div class="study-parts">${curriculumV2.map(p => {
        const pending = p.domains.find(([id]) => (state.domains[id] || 0) < 3), target = pending || p.domains[0];
        return `<section class="card study-part" id="part-${p.id}"><div class="eyebrow">PART ${p.part}</div><h2>${topicInfo[p.id].icon} ${p.title}</h2><p>${p.domains.filter(([id]) => (state.domains[id] || 0) >= 3).length} / ${p.domains.length} verified</p><div class="domain-list">${p.domains.map(([id,label]) => `<button class="domain-row domain-button" data-domain="${id}"><span class="${(state.domains[id]||0)>=3?'domain-ok':'domain-open'}">${(state.domains[id]||0)>=3?'✓':(state.domains[id]||0)>=2?'◆':(state.domains[id]||0)?'◐':'○'}</span><span>${label}</span></button>`).join('')}</div><div class="actions"><button class="primary" data-domain="${target[0]}">${pending?'Study next domain':'Review this part'} →</button><button data-study="${p.id}">Deep study guide</button><button data-topic="${p.id}">Practise this part</button></div></section>`;
      }).join('')}</div>` + tools();
  };
  openDomain = function (id) {
    const d = domainKnowledge[id]; if (!d) { study(); return; }
    const e = domainEnrichment[id] || ['', '', '', d.cue], ev = state.domainEvidence[id] || {c:0,t:0}, all = orderedDomains(), i = all.findIndex(x => x.id === id);
    write('atest-last-domain', id); state.domains[id] = Math.max(1, state.domains[id] || 0); save();
    app.innerHTML = `<div class="study-breadcrumb"><button data-view="study">← All study parts</button><span>Domain ${i+1} / ${all.length}</span></div>` + pageHead('STUDY', d.title, 'Learn the idea. Test your recall. Keep your place.') +
      `<article class="card domain-study"><div class="eyebrow">${topicInfo[d.part].name}</div>${[['learn','Learn',d.teach],['example','Example',e[1]],['trap','Common trap',e[2]],['recall','Recall hook',e[3]]].map(([key,label,text],n) => `<section class="study-step ${key}" id="domain-${key}"><span>${n+1}</span><div><h3>${label}</h3><p>${text}</p></div></section>`).join('')}<section class="evidence" id="domain-evidence"><h3>Your evidence</h3><b>${ev.c} correct / ${ev.t} attempts</b><small>Verification requires 3+ attempts, 2+ correct and at least 75% accuracy.</small><div class="actions"><button class="primary" data-domain-master="${id}">${state.domains[id]>=3?'✓ Verified':state.domains[id]>=2?'◆ Understood':'◆ I understand this'}</button><button data-topic="${d.part}">Test this part</button></div></section></article><div class="study-nav">${i>0?`<button class="btn" data-domain="${all[i-1].id}">← ${all[i-1].label}</button>`:'<button class="btn" data-view="study">Back to Study</button>'}${i+1<all.length?`<button class="btn primary" data-domain="${all[i+1].id}">${all[i+1].label} →</button>`:'<button class="btn primary" data-view="practice">Go to Practise →</button>'}</div>`;
  };
  studyResume = () => openDomain(resumeDomain().id);
  // Manual Previous/Next must not be overwritten by the due-card queue.
  function firstDueCard() { const due = flashcards.map((_,i) => ({i,d:state.reviews[i]||0})).filter(x => x.d<=Date.now()).sort((a,b)=>a.d-b.d); cardIndex = due[0]?.i ?? 0; flipped=false; }
  cards = function () {
    cardIndex = (number(cardIndex) % flashcards.length); const c = flashcards[cardIndex], known = !!state.known[cardIndex];
    app.innerHTML = pageHead('FLASHCARDS','Build recall','Think first, reveal second, then rate your recall.') + `<section class="card flash"><div class="eyebrow">${c[2].toUpperCase()} · ${cardIndex+1} / ${flashcards.length}</div><div class="face">${flipped?c[1]:c[0]}</div><p class="hint">${flipped?'Answer':'Retrieve it before you tap reveal.'}</p><div class="actions"><button class="primary" data-flip>${flipped?'Show question':'Reveal answer'}</button>${flipped?'<button data-rate="0">Review again</button><button data-rate="1">I know it</button>':''}</div><p class="hint">${known?'✓ Marked known':'Not marked known yet'}</p></section><div class="actions"><button data-prev>← Previous</button><button data-next>Next →</button><button data-view="practice">Back to Practise</button></div>`;
  };
  const originalDashboard = dashboard;
  dashboard = function () {
    // The older dashboard reads a legacy arcade score directly from localStorage.
    try { originalDashboard(); } catch (error) {
      if (!storageUnavailable) { try { localStorage.getItem('atest-quest-best'); throw error; } catch (storageError) { if (storageError === error) throw error; storageNotice(); } }
      app.innerHTML = pageHead('WELCOME TO A-TEST','Make a little progress today','Your study tools work even when device storage is unavailable.') + `<div class="mode-grid">${[['study','Study'],['practice','Practise'],['games','Play'],['mock','Mock'],['readiness','Progress']].map(([view,title])=>modeCard('✦',title,'Choose your next step','',view,'lavender')).join('')}</div>`;
    }
  };
  const originalStoryAnswer = storyAnswer;
  storyAnswer = function (i) { originalStoryAnswer(i); const p = document.querySelector('#story-feedback .feedback > p'); if (p && p.textContent === 'undefined') p.textContent = 'Revisit the story nodes to reinforce this answer.'; };
  const originalDrawMock = drawMockQuestion;
  drawMockQuestion = function () { originalDrawMock(); const left=Math.max(0,mockEnds-Date.now()),clock=document.getElementById('mock-clock'); if(clock)clock.textContent=Math.floor(left/60000)+':'+String(Math.floor(left%60000/1000)).padStart(2,'0'); };
  const originalMockAnswer = mockAnswer;
  mockAnswer = function (i) {
    if (!session || session.mode!=='mock' || session.submitted || !session.q[session.i] || !Number.isInteger(i) || i<0 || i>=session.q[session.i][2].length) return;
    if (Date.now()>=mockEnds) { finishMock(); return; }
    const q=session.q[session.i],ok=i===q[3],st=state.stats[q[0]]||{c:0,t:0};st.t++;if(ok)st.c++;state.stats[q[0]]=st;state.missed[q[1]]=ok?0:(state.missed[q[1]]||0)+1;
    originalMockAnswer(i);
  };
  finishMock = function () {
    if (!session || session.mode!=='mock' || session.submitted) return;
    session.submitted=true; if(mockTimer){clearInterval(mockTimer);mockTimer=null;}
    const elapsed=Math.min(45,Math.max(0,Math.round((Date.now()-session.started)/60000))),pass=session.score>=15&&session.valuesCorrect===5;
    const missing=session.q.slice(session.answers.length).map(q=>({q,chosen:null,ok:false,domain:questionDomainMap[q[1]]}));
    const misses=[...session.answers.filter(a=>!a.ok),...missing];
    state.mocks.push({score:session.score,values:session.valuesCorrect,pass,date:Date.now(),minutes:elapsed,unanswered:missing.length});state.mocks=state.mocks.slice(-10);save();
    app.innerHTML=pageHead('MOCK RESULT',pass?'You met the pass standard':'Keep building your recall','Review your results, then return to the ideas that need attention.')+`<div class="cards"><div class="card"><h3>Overall</h3><h2>${session.score} / 20</h2></div><div class="card"><h3>Values</h3><h2>${session.valuesCorrect} / 5</h2></div><div class="card"><h3>Time used</h3><h2>${elapsed} min</h2></div><div class="card"><h3>Unanswered</h3><h2>${missing.length}</h2></div></div><section class="card mock-review"><h3>Post-exam review</h3>${misses.length?misses.map(a=>`<div class="review-row"><div><b>${escape(a.q[1])}</b><p class="bad">Your answer: ${a.chosen===null?'Not answered':escape(a.q[2][a.chosen])}</p><p class="good">Correct: ${escape(a.q[2][a.q[3]])}</p><small>${escape(a.q[4])}</small></div>${a.domain?`<button class="btn" data-domain="${a.domain}">Study this idea</button>`:''}</div>`).join(''):'<p class="good">No incorrect answers.</p>'}<div class="actions"><button class="primary" data-view="mock">Take another mock</button><button data-view="readiness">View Progress</button><button data-evidence>Train evidence gaps</button></div></section>`;
  };
  // Initialise after the arcade has registered its lifecycle cleanup. The arcade
  // remains optional: a missing arcade file cannot leave the study app blank.
  document.addEventListener('DOMContentLoaded', () => {
    const baseRoute=route;
    let currentPath='', sectionFrame=0;
    const aliases={play:'games',progress:'readiness',today:'home',practise:'practice'};
    const views=new Set(['home','study','practice','games','mock','readiness','readings','learn','glossary','visual','map','cards','syllabus','audit','game','mistakes','values']);
    const detail={domain:openDomain,guide:openStudy,lesson,story:openStory,topic:start};
    const canonical=view=>view==='games'?'play':view==='readiness'?'progress':view;
    function setURL(path, section='', replace=false) { const hash='#'+path+(section?'~'+section:'');if(location.hash!==hash)history[replace?'replaceState':'pushState']({path},'',hash); }
    function sectionScroll(id, smooth=false) {
      const target=document.getElementById(id);if(!target || !app.contains(target))return;
      target.scrollIntoView({block:'start',behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});
      const heading=target.matches('h2,h3')?target:target.querySelector('h2,h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
      app.querySelectorAll('[data-section]').forEach(a=>{if(a.dataset.section===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    }
    route=function(raw='home',fromHistory=false){
      const [path,section='']=String(raw).replace(/^#/,'').split('~'),[rawKind,id]=path.split('/'),kind=aliases[rawKind]||rawKind;
      if(fromHistory && path===currentPath && section && document.getElementById(section)){sectionScroll(section);return;}
      const validDetail=detail[kind] && (kind==='domain'?!!domainKnowledge[id]:kind==='topic'?(id==='all'||!!topicInfo[id]):kind==='story'?!!visualStories[id]:!!topicInfo[id]);
      if(!validDetail && !views.has(kind)){raw='study';}
      const chosen=validDetail?(kind==='topic'?'practice':'study'):views.has(kind)?kind:'study';
      if(chosen==='cards')firstDueCard();
      baseRoute(chosen,true);
      if(validDetail)detail[kind](id);
      currentPath=validDetail?kind+'/'+id:canonical(chosen);
      if(!fromHistory)setURL(currentPath);else if(path!==currentPath)setURL(currentPath,'',true);
      decorate();
      if(section)sectionScroll(section);else{window.scrollTo({top:0,behavior:'auto'});const h=app.querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
    };
    // Capture only navigation actions, before the legacy delegated handlers.
    window.addEventListener('click',e=>{
      const el=e.target.closest('button,a');if(!el)return;
      if(el.disabled){e.preventDefault();e.stopImmediatePropagation();return;}
      const section=el.dataset.section;
      let destination=null;
      if(el.hasAttribute('data-view'))destination=el.dataset.view;
      else if(el.hasAttribute('data-domain'))destination='domain/'+el.dataset.domain;
      else if(el.hasAttribute('data-study'))destination='guide/'+el.dataset.study;
      else if(el.hasAttribute('data-lesson'))destination='lesson/'+el.dataset.lesson;
      else if(el.hasAttribute('data-story'))destination='story/'+el.dataset.story;
      else if(el.hasAttribute('data-topic'))destination='topic/'+el.dataset.topic;
      else if(el.hasAttribute('data-study-resume'))destination='domain/'+resumeDomain().id;
      if(section){e.preventDefault();e.stopImmediatePropagation();setURL(currentPath,section);sectionScroll(section,true);return;}
      if(el.hasAttribute('data-domain-master')){e.preventDefault();e.stopImmediatePropagation();const id=el.dataset.domainMaster;if(domainKnowledge[id]){state.domains[id]=Math.max(2,state.domains[id]||0);save();openDomain(id);decorate();sectionScroll('domain-evidence');}return;}
      if(destination!==null){e.preventDefault();e.stopImmediatePropagation();route(destination);}
    },true);
    function decorate(){
      if(app.querySelector('.onpage-nav') || document.body.classList.contains('dash-active'))return;
      const items=[];
      function add(selector,id,label){const node=app.querySelector(selector);if(node){node.id=id;node.classList.add('page-section');items.push([id,label]);}}
      if(app.querySelector('.domain-study'))[['learn','Learn'],['example','Example'],['trap','Trap'],['recall','Recall'],['evidence','Evidence']].forEach(([id,label])=>add('#domain-'+id,'domain-'+id,label));
      else if(app.querySelector('.study-parts')){add('#study-continue','study-continue','Continue');curriculumV2.forEach(p=>add('#part-'+p.id,'part-'+p.id,'Part '+p.part));add('#study-library','study-library','Library');}
      else if(app.querySelector('.dash-lobby')){add('.dash-hero','play-start','Play');add('.dash-modes','play-modes','Modes');add('.dash-worlds','play-worlds','Worlds');add('.dash-help','play-help','How to play');}
      else if(app.querySelector('.reading-card'))app.querySelectorAll('.reading-card').forEach((node,i)=>{node.id='reading-'+i;node.classList.add('page-section');items.push([node.id,'Part '+(i+1)]);});
      else if(app.querySelector('.today-hero')){add('.today-hero','today-start','Today');add('.mode-grid','today-modes','Modes');add('.quick-shelf','today-tools','Quick tools');}
      else if(app.querySelector('.mastery-heatmap')){add('.progress-hero','progress-summary','Overview');add('.curriculum-grid','progress-domains','Domains');add('.next-path','progress-next','Next steps');}
      else if(app.querySelector('.evidence-queue')){add('.evidence-queue','practice-queue','Your queue');add('.cards','practice-parts','Topic drills');}
      else if(app.querySelector('.lineage')){add('.study-insight','guide-insight','Insight');add('.lineage','guide-lineage','Lineage');add('.study-cue','guide-recall','Recall');}
      if(items.length<2)return;
      const nav=document.createElement('nav');nav.className='onpage-nav';nav.setAttribute('aria-label','On this page');nav.innerHTML='<span>On this page</span><div>'+items.map(([id,label],i)=>`<a href="#${currentPath}~${id}" data-section="${id}"${i===0?' aria-current="location"':''}>${label}</a>`).join('')+'</div>';
      const head=app.querySelector(':scope > .page-head');if(head)head.after(nav);else app.prepend(nav);
    }
    new MutationObserver(()=>{cancelAnimationFrame(sectionFrame);sectionFrame=requestAnimationFrame(decorate);}).observe(app,{childList:true});
    let ticking=false;
    window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;const links=[...app.querySelectorAll('[data-section]')];if(!links.length)return;const threshold=(app.querySelector('.onpage-nav')?.getBoundingClientRect().bottom||0)+40;let active=links[0];for(const link of links){const node=document.getElementById(link.dataset.section);if(node&&node.getBoundingClientRect().top<=threshold)active=link;}links.forEach(a=>{if(a===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{passive:true});
    // arcade.js already forwards hashchange to the current route function.
    // When it failed to load, install the equivalent fallback handler here.
    if(!document.querySelector('.dash-lobby')){
      // Dispatching to the same path is harmless; suppress duplicate fallback routing.
      window.addEventListener('hashchange',()=>{const target=location.hash.slice(1);if(target.split('~')[0]!==currentPath)route(target,true);});
    }
    route(location.hash.slice(1)||'home',true);
    document.querySelector('.footer')?.insertAdjacentHTML('beforeend','<span class="build-label">Study repair · v6.1</span>');
  },{once:true});
})();
