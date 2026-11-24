const REPO_OWNER = 'riantosee';
const REPO_NAME = 'fixify';
const RELEASE_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_RELEASES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

const DSP_PROFILES = {
  stereo: {
    chip: 'STEREO WIDE HD',
    mockBadge: 'STEREO WIDE HD • CACHE',
    bars: [62, 74, 68, 72, 84, 92, 88],
    caption:
      'Memperluas soundstage stereo hingga 165% dengan limiter studio agar nada tinggi tetap bening dan bass terasa hangat.',
  },
  spatial: {
    chip: '3D SPATIAL CONCERT',
    mockBadge: '3D SPATIAL • CACHE',
    bars: [70, 78, 80, 76, 86, 95, 92],
    caption:
      'Separasi stereo ekstra lebar (195%) dipadukan ambience konser halus yang terasa mengelilingi kepala saat memakai headset.',
  },
  bass: {
    chip: 'DEEP BASS STEREO',
    mockBadge: 'DEEP BASS • CACHE',
    bars: [96, 90, 72, 65, 70, 76, 72],
    caption:
      'Boost sub-bass 75Hz (+6.5dB) yang dalam dan bertenaga tanpa distorsi berkat anti-clipping limiter studio.',
  },
  vocal: {
    chip: 'CRYSTAL VOCAL',
    mockBadge: 'CRYSTAL VOCAL • CACHE',
    bars: [50, 56, 72, 92, 95, 80, 70],
    caption:
      'Menonjolkan kejelasan vokal di rentang 2.8kHz dan merapikan frekuensi low-mid agar akustik & podcast terdengar bening.',
  },
};

function formatMB(bytes) {
  if (!bytes || bytes <= 0) return 'Android APK';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setupStereoInteractive() {
  const buttons = document.querySelectorAll('.dsp-btn');
  const visChip = document.getElementById('visChip');
  const visCaption = document.getElementById('visCaption');
  const visBars = document.querySelectorAll('#visBars .vbar');
  const mockBadge = document.getElementById('mockStereoBadge');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      const profile = DSP_PROFILES[mode];
      if (!profile) return;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (visChip) visChip.textContent = profile.chip;
      if (visCaption) visCaption.textContent = profile.caption;
      if (mockBadge) mockBadge.textContent = profile.mockBadge;

      visBars.forEach((bar, idx) => {
        const h = profile.bars[idx] || 65;
        bar.style.setProperty('--h', `${h}%`);
      });
    });
  });
}

function applyReleaseData({ version, apkUrl, sizeBytes, downloads, changelog }) {
  const cleanVer = String(version || '3.2.0').replace(/^v/i, '');
  const finalUrl = apkUrl || FALLBACK_RELEASES_URL;

  const navVer = document.getElementById('navVersion');
  const heroPill = document.getElementById('heroReleasePill');
  const metaVer = document.getElementById('metaVersion');
  const metaSize = document.getElementById('metaSize');
  const metaDl = document.getElementById('metaDownloads');
  const dlLabel = document.getElementById('downloadBtnLabel');
  const clTitle = document.getElementById('changelogTitle');
  const clList = document.getElementById('changelogList');

  if (navVer) navVer.textContent = `v${cleanVer}`;
  if (heroPill) heroPill.textContent = `Rilis Terbaru v${cleanVer} • Bebas Iklan • Auto-Update`;
  if (metaVer) metaVer.textContent = `v${cleanVer}`;
  if (metaSize && sizeBytes) metaSize.textContent = formatMB(sizeBytes);
  if (metaDl && typeof downloads === 'number' && downloads > 0) {
    metaDl.textContent = `${downloads.toLocaleString('id-ID')}+ Unduhan`;
  }
  if (dlLabel) dlLabel.textContent = `Download Fixify v${cleanVer} (APK)`;
  if (clTitle) clTitle.textContent = `Fixify v${cleanVer}`;

  document.querySelectorAll('.js-download-btn').forEach((el) => {
    el.setAttribute('href', finalUrl);
  });

  if (clList && Array.isArray(changelog) && changelog.length > 0) {
    clList.innerHTML = '';
    changelog.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.replace(/^[-•*]\s*/, '');
      clList.appendChild(li);
    });
  }
}

async function loadLatestRelease() {
  // 1. Load local version.json first for instant paint
  try {
    const localRes = await fetch(`./version.json?t=${Date.now()}`);
    if (localRes.ok) {
      const localData = await localRes.json();
      applyReleaseData({
        version: localData.version,
        apkUrl: localData.apkUrl,
        sizeBytes: localData.fileSizeBytes,
        changelog: localData.changelog,
      });
    }
  } catch {}

  // 2. Hydrate with live GitHub Releases API (size, download count, latest APK asset)
  try {
    const ghRes = await fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!ghRes.ok) return;
    const rel = await ghRes.json();
    const assets = Array.isArray(rel.assets) ? rel.assets : [];
    const apk = assets.find((a) => String(a.name || '').toLowerCase().endsWith('.apk'));

    const lines = String(rel.body || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'))
      .slice(0, 8);

    applyReleaseData({
      version: rel.tag_name || rel.name,
      apkUrl: apk?.browser_download_url || rel.html_url,
      sizeBytes: apk?.size || 0,
      downloads: apk?.download_count || 0,
      changelog: lines.length > 0 ? lines : undefined,
    });
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  setupStereoInteractive();
  loadLatestRelease();
});
