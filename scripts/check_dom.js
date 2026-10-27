const fs = require('fs');
const content = fs.readFileSync('FACIU-v6.36.11.html', 'utf8');

// Let's find all parents of #faciu-nav-row2 and #modalWorkspaceManager
// Using simple regex or jsdom
try {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(content);
  const doc = dom.window.document;
  
  const nav = doc.getElementById('faciu-nav-row2');
  console.log('Nav parent:', nav ? nav.parentElement.tagName + (nav.parentElement.id ? '#' + nav.parentElement.id : '') + ' class: ' + nav.parentElement.className : 'null');
  
  const modal = doc.getElementById('modalWorkspaceManager');
  console.log('Modal parent:', modal ? modal.parentElement.tagName + (modal.parentElement.id ? '#' + modal.parentElement.id : '') + ' class: ' + modal.parentElement.className : 'null');

  // Print all ancestors of nav
  let curr = nav;
  const navAncestors = [];
  while (curr) {
    navAncestors.push(curr.tagName + (curr.id ? '#' + curr.id : '') + ' (class: ' + (curr.className || '') + ', style: ' + (curr.getAttribute('style') || '') + ')');
    curr = curr.parentElement;
  }
  console.log('\nNav ancestors:\n', navAncestors.join('\n -> '));

  // Print all ancestors of modal
  curr = modal;
  const modalAncestors = [];
  while (curr) {
    modalAncestors.push(curr.tagName + (curr.id ? '#' + curr.id : '') + ' (class: ' + (curr.className || '') + ', style: ' + (curr.getAttribute('style') || '') + ')');
    curr = curr.parentElement;
  }
  console.log('\nModal ancestors:\n', modalAncestors.join('\n -> '));

} catch (e) {
  console.error(e);
}
