/* AUS-TEST contextual supplementary resources: official-source-first.
   Links open in separate tabs and never change learner progress. */
const ATEST_CONTEXT_RESOURCES={
 "federation":[["Watch Australia's Federation","https://peo.gov.au/resource-hub/videos","Parliamentary Education Office · Federation video"]],
 "referendum":[["Explore referendum learning","https://www.aec.gov.au/community/community.htm","Australian Electoral Commission"]],
 "democracy":[["Watch representation and Parliament","https://peo.gov.au/resource-hub/videos","Parliamentary Education Office"]],
 "parliament":[["Watch the Houses of Parliament","https://peo.gov.au/resource-hub/videos","Parliamentary Education Office"]],
 "powers":[["Watch the Constitution","https://peo.gov.au/resource-hub/videos","Parliamentary Education Office"]],
 "levels":[["Watch three levels of government","https://peo.gov.au/resource-hub/videos","Parliamentary Education Office"]],
 "laws":[["Watch how a law is made","https://peo.gov.au/understand-our-parliament/how-parliament-works/bills-and-laws/making-a-law","Parliamentary Education Office"]],
 "say":[["Explore voting education","https://education.aec.gov.au/teacher-resources/resources.html","Australian Electoral Commission"]],
 "aec":[["Explore voting education","https://education.aec.gov.au/teacher-resources/resources.html","Australian Electoral Commission"]],
 values-law:[["Official citizenship preparation","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test","Department of Home Affairs"]],
 "values-freedoms":[["Official citizenship preparation","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test","Department of Home Affairs"]],
 "values-equality":[["Official citizenship preparation","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test","Department of Home Affairs"]],
 "mutual-respect":[["Official citizenship preparation","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test","Department of Home Affairs"]]
};
function atestContextResources(id){
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const additional=ATEST_CONTEXT_RESOURCES[id]||[["Listen and practise with Home Affairs","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test","Official citizenship preparation"]];
 const items=[["Official examinable source","https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond","Department of Home Affairs"],...additional];
 return '<section class="card lesson-context-resources" aria-label="Resources for this lesson"><div class="eyebrow">LEARN MORE · THIS LESSON</div><h3>Watch, listen and reinforce</h3><p>Read <em>Our Common Bond</em> for exam facts. These optional resources help explain and visualise the topic. They are not official examination questions.</p><div class="lesson-resource-links">'+items.map(([title,url,source],i)=>'<a class="btn" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(title)+', opens in a new tab">'+esc(i===0?'📖 ':'▶ ')+esc(title)+' ↗<small>'+esc(source)+'</small></a>').join('')+'</div><p class="hint">This lesson stays open here while resources open in another tab. Return and explain what you learned.</p></section>';
}
