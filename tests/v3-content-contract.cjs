// AUS-TEST V3 supplementary content contract. Run: node tests/v3-content-contract.cjs
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'v3-content.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(source,context);
const call=id=>vm.runInContext('v3DomainPanel('+JSON.stringify(id)+')',context);
const required=['first-peoples','settlement','federation','powers','levels','rule-law','speech','religion','fair-go','respect','community'];
for(const id of required){
  const html=call(id);
  assert.match(html,/Learning objective/);
  assert.match(html,/Explain it back/);
  assert.match(html,/OUR COMMON BOND pp/);
  assert.match(html,/details/);
  assert.match(html,/Reinforcement:/);
}
assert.equal(call('unknown'),'','Missing lessons degrade gracefully');
assert.ok(!call('federation').includes('<script'),'No executable HTML in content');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(app.includes("v3DomainPanel(id)"),'Study flow renders V3 lesson panel');
assert.ok(html.indexOf('v3-content.js')<html.indexOf('app.js'),'New script loads before application');
console.log('V3 content contract: '+required.length+' priority lessons verified');
