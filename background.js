// foldkit background · service worker · context menu + keyboard command
// AI-Native Solutions · MIT

const TOOL_URLS = {
  mirror: 'https://sjgant80-hub.github.io/fallmirror/',
  px:     'https://sjgant80-hub.github.io/fallpx/',
  sig:    'https://sjgant80-hub.github.io/fallsignature/',
  bloom:  'https://sjgant80-hub.github.io/bloom-overlay/'
};

const MENUS = [
  { id: 'fk-mirror', title: 'Send selection to FallMirror',  tool: 'mirror' },
  { id: 'fk-px',     title: 'Send selection to FallPx',      tool: 'px' },
  { id: 'fk-sig',    title: 'Sign with FallSignature',       tool: 'sig' },
  { id: 'fk-bloom',  title: 'Analyse in Bloom Overlay',      tool: 'bloom' },
  { id: 'fk-sep',    type: 'separator' },
  { id: 'fk-toggle', title: 'Toggle foldkit sidebar',        contexts: ['page'] }
];

function openTool(tool, input){
  const base = TOOL_URLS[tool];
  if (!base) return;
  const url = base + (input ? '?input=' + encodeURIComponent(input.slice(0, 4000)) : '');
  chrome.tabs.create({ url });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const m of MENUS){
      chrome.contextMenus.create({
        id: m.id,
        title: m.title,
        type: m.type || 'normal',
        contexts: m.contexts || (m.type === 'separator' ? ['selection'] : ['selection'])
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const m = MENUS.find(x => x.id === info.menuItemId);
  if (!m) return;
  if (m.id === 'fk-toggle'){
    if (tab && tab.id != null) chrome.tabs.sendMessage(tab.id, { type: 'toggle-sidebar' });
    return;
  }
  if (m.tool) openTool(m.tool, info.selectionText || '');
});

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd !== 'toggle-sidebar') return;
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0] && tabs[0].id != null){
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle-sidebar' }).catch(()=>{});
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'open-tool'){
    openTool(msg.tool, msg.input || '');
    sendResponse({ ok: true });
  }
  return true;
});
