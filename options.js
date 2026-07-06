// foldkit options · sovereign settings, all local
const DEFAULTS = {
  hudVisible: true,
  autoClassify: true,
  toolUrls: {
    mirror: 'https://sjgant80-hub.github.io/fallmirror/',
    px:     'https://sjgant80-hub.github.io/fallpx/',
    sig:    'https://sjgant80-hub.github.io/fallsignature/',
    bloom:  'https://sjgant80-hub.github.io/bloom-overlay/'
  }
};

const $ = id => document.getElementById(id);
const status = $('status');
let saveTimer;
function flash(){
  clearTimeout(saveTimer);
  status.classList.add('on');
  saveTimer = setTimeout(()=> status.classList.remove('on'), 1400);
}

async function load(){
  const s = await chrome.storage.sync.get(DEFAULTS);
  $('hudVisible').checked = !!s.hudVisible;
  $('autoClassify').checked = !!s.autoClassify;
  const urls = s.toolUrls || DEFAULTS.toolUrls;
  $('url-mirror').value = urls.mirror || DEFAULTS.toolUrls.mirror;
  $('url-px').value     = urls.px     || DEFAULTS.toolUrls.px;
  $('url-sig').value    = urls.sig    || DEFAULTS.toolUrls.sig;
  $('url-bloom').value  = urls.bloom  || DEFAULTS.toolUrls.bloom;
}

async function save(){
  await chrome.storage.sync.set({
    hudVisible: $('hudVisible').checked,
    autoClassify: $('autoClassify').checked,
    toolUrls: {
      mirror: $('url-mirror').value.trim() || DEFAULTS.toolUrls.mirror,
      px:     $('url-px').value.trim()     || DEFAULTS.toolUrls.px,
      sig:    $('url-sig').value.trim()    || DEFAULTS.toolUrls.sig,
      bloom:  $('url-bloom').value.trim()  || DEFAULTS.toolUrls.bloom
    }
  });
  flash();
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  ['hudVisible','autoClassify','url-mirror','url-px','url-sig','url-bloom']
    .forEach(id => $(id).addEventListener('change', save));
});
