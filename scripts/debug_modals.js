const { chromium } = require('playwright');
const path = require('path');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const filePath = path.join(__dirname, '..', 'FACIU-v6.36.11.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Open Workspace Manager modal
  await page.evaluate(() => {
    openWorkspaceManager();
  });
  await page.waitForTimeout(500);

  const modalInfo = await page.evaluate(() => {
    const modal = document.getElementById('modalWorkspaceManager');
    const header1 = document.querySelector('.bg-brava-navy');
    const nav2 = document.getElementById('faciu-nav-row2');
    const modalPanel = modal.querySelector('div');

    function getZAndPos(el) {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        id: el.id,
        tagName: el.tagName,
        zIndex: cs.zIndex,
        position: cs.position,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        height: rect.height,
        width: rect.width
      };
    }

    // Check elementFromPoint at center of modal or modal close button
    const closeBtn = document.getElementById('btnWsCloseX');
    let hitEl = null;
    if (closeBtn) {
      const r = closeBtn.getBoundingClientRect();
      const elAtPoint = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      hitEl = elAtPoint ? {
        id: elAtPoint.id,
        className: elAtPoint.className,
        tagName: elAtPoint.tagName,
        outerHTML: elAtPoint.outerHTML.substring(0, 100)
      } : null;
    }

    return {
      modal: getZAndPos(modal),
      modalPanel: getZAndPos(modalPanel),
      header1: getZAndPos(header1),
      nav2: getZAndPos(nav2),
      hitEl
    };
  });

  console.log('Modal Info:', JSON.stringify(modalInfo, null, 2));

  await browser.close();
}

test().catch(console.error);
