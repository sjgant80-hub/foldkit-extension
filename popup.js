// foldkit popup · quick launcher + hud toggle
async function getSelection(){
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id == null) return '';
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'get-selection' }).catch(()=>null);
    return (res && res.selection) || '';
  } catch { return ''; }
}

document.querySelectorAll('.tool').forEach(b => {
  b.addEventListener('click', async () => {
    const input = await getSelection();
    chrome.runtime.sendMessage({ type: 'open-tool', tool: b.dataset.tool, input });
    window.close();
  });
});

document.getElementById('toggle-sb').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null){
    chrome.tabs.sendMessage(tab.id, { type: 'toggle-sidebar' }).catch(()=>{});
  }
  window.close();
});

const hud = document.getElementById('hud');
chrome.storage.sync.get({ hudVisible: true }, res => { hud.checked = !!res.hudVisible; });
hud.addEventListener('change', () => {
  chrome.storage.sync.set({ hudVisible: hud.checked });
});

document.getElementById('opts').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
