const REPO_OWNER = 'riantosee';
const REPO_NAME = 'fixify';
const RELEASE_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_RELEASES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

const SCREENSHOTS = {
  home: {
    src: './assets/screens/screen-home.png',
    tag: 'SCREEN 01 / BERANDA',
    caption: 'Beranda utama dengan sapaan dinamis, badge role, shortcut playlist, dan MiniPlayer Stereo aktif.',
  },
  player: {
    src: './assets/screens/screen-player.png',
    tag: 'SCREEN 02 / PEMUTAR STEREO',
    caption: 'Pemutar layar penuh native yang tetap aktif saat layar mati, lengkap dengan Stereo DSP & Slowed/Sped-Up.',
  },
  community: {
    src: './assets/screens/screen-community.png',
    tag: 'SCREEN 03 / KOMUNITAS',
    caption: 'Ruang obrolan live (# Umum, # Berbagi Lagu, # Santai) dan tab Playlist Bersama untuk kolaborasi member.',
  },
  profile: {
    src: './assets/screens/screen-profile.png',
    tag: 'SCREEN 04 / PROFIL & ROLE',
    caption: 'Avatar & banner GIF bergerak, badge DEV, Studio Developer & Kelola Role, Cache Cepat, serta Cek Pembaruan APK.',
  },
};

const DSP_PRESETS = {
  stereo: {
    name: 'Stereo Wide HD',
    output: '192 kbps / 44.1 kHz',
    pipeline: 'stereotools=slev=1.65 → extrastereo=1.75 → bass(+2.5dB) → treble(+2.5dB) → alimiter(0.95)',
    desc: 'Memperlebar pemisahan kanal kiri-kanan dengan limiter anti-clipping agar instrumen terasa luas di earphone maupun speaker.',
    path: 'M 0 85 C 70 54, 130 62, 210 72 C 300 76, 390 54, 470 46 C 515 44, 540 50, 560 54',
  },
  spatial: {
    name: '3D Spatial Concert',
    output: '192 kbps / 44.1 kHz',
    pipeline: 'stereotools=slev=1.95 → aecho(24|42ms) → bass(+3.0dB) → treble(+3.0dB) → alimiter(0.95)',
    desc: 'Separasi ekstra lebar dipadukan pantulan ambience panggung halus untuk kesan ruang 3D saat mendengarkan memakai headset.',
    path: 'M 0 78 C 75 48, 150 56, 230 64 C 320 56, 405 38, 485 36 C 525 36, 545 42, 560 46',
  },
  bass: {
    name: 'Deep Bass Stereo',
    output: '192 kbps / 44.1 kHz',
    pipeline: 'bass(g=+6.5dB, f=75Hz) → stereotools=slev=1.45 → treble(+1.5dB) → alimiter(0.95)',
    desc: 'Dorongan sub-bass 75Hz yang dalam dan padat dengan limiter studio untuk menjaga vokal tetap bersih tanpa pecah.',
    path: 'M 0 32 C 65 26, 120 44, 195 78 C 285 90, 380 80, 470 70 C 515 68, 540 70, 560 72',
  },
  vocal: {
    name: 'Crystal Vocal',
    output: '192 kbps / 44.1 kHz',
    pipeline: 'equalizer(2.8kHz, +3.5dB) → equalizer(200Hz, -1.5dB) → stereotools=slev=1.35 → alimiter(0.95)',
    desc: 'Mengangkat kejernihan vokal di 2.8kHz dan mengurangi muddiness low-mid — ideal untuk akustik, pop, dan podcast.',
    path: 'M 0 98 C 75 104, 155 96, 240 62 C 320 34, 400 38, 480 68 C 520 76, 545 78, 560 80',
  },
  normal: {
    name: 'Original Pass-Through',
    output: 'Direct CDN Stream',
    pipeline: 'direct-passthrough (0 transcoding, instant HTTP 206 byte-range stream)',
    desc: 'Stream audio asli langsung tanpa pemrosesan tambahan untuk waktu mulai tercepat dan respons seek instan.',
    path: 'M 0 75 C 140 75, 280 75, 420 75 C 490 75, 525 75, 560 75',
  },
};

function formatMB(bytes) {
  if (!bytes || bytes <= 0) return '73.8 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setupGallery() {
  const tabs = document.querySelectorAll('.gal-tab');
  const strips = document.querySelectorAll('.strip-item');
  const mainImg = document.getElementById('galleryMainImg');
  const tagEl = document.getElementById('galleryTag');
  const capEl = document.getElementById('galleryCaption');

  function selectShot(key) {
    const item = SCREENSHOTS[key];
    if (!item || !mainImg) return;

    tabs.forEach((t) => {
      const on = t.getAttribute('data-shot') === key;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    strips.forEach((s) => {
      s.classList.toggle('active', s.getAttribute('data-shot') === key);
    });

    mainImg.style.opacity = '0.35';
    setTimeout(() => {
      mainImg.src = item.src;
      mainImg.alt = item.caption;
      if (tagEl) tagEl.textContent = item.tag;
      if (capEl) capEl.textContent = item.caption;
      mainImg.style.opacity = '1';
    }, 110);
  }

  tabs.forEach((t) => t.addEventListener('click', () => selectShot(t.getAttribute('data-shot'))));
  strips.forEach((s) => s.addEventListener('click', () => selectShot(s.getAttribute('data-shot'))));
}

function setupDspRack() {
  const btns = document.querySelectorAll('#presetList .preset-btn');
  const nameEl = document.getElementById('dspActiveName');
  const outEl = document.getElementById('dspOutput');
  const pipeEl = document.getElementById('dspPipeline');
  const descEl = document.getElementById('dspDesc');
  const pathEl = document.getElementById('dspCurvePath');
  const areaEl = document.getElementById('dspCurveArea');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-mode');
      const preset = DSP_PRESETS[key];
      if (!preset) return;

      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (nameEl) nameEl.textContent = preset.name;
      if (outEl) outEl.textContent = preset.output;
      if (pipeEl) pipeEl.textContent = preset.pipeline;
      if (descEl) descEl.textContent = preset.desc;
      if (pathEl) pathEl.setAttribute('d', preset.path);
      if (areaEl) areaEl.setAttribute('d', `${preset.path} L 560 150 L 0 150 Z`);
    });
  });
}

function applyRelease({ version, apkUrl, sizeBytes, downloads, changelog }) {
  const ver = String(version || '3.2.0').replace(/^v/i, '');
  const url = apkUrl || FALLBACK_RELEASES_URL;
  const sizeStr = formatMB(sizeBytes);

  const navVer = document.getElementById('navVersion');
  const metaLine = document.getElementById('heroMetaLine');
  const dlLabel = document.getElementById('downloadBtnLabel');
  const dlStat = document.getElementById('heroDlStat');
  const clTitle = document.getElementById('changelogTitle');
  const sizeBadge = document.getElementById('releaseSizeBadge');
  const clList = document.getElementById('changelogList');

  if (navVer) navVer.textContent = `v${ver}`;
  if (metaLine) metaLine.textContent = `ANDROID APK • v${ver} • ${sizeStr} • OPEN SOURCE`;
  if (dlLabel) dlLabel.textContent = `Unduh Fixify v${ver} (.apk)`;
  if (clTitle) clTitle.textContent = `Fixify v${ver}`;
  if (sizeBadge) sizeBadge.textContent = `${sizeStr} APK`;
  if (dlStat && typeof downloads === 'number' && downloads > 0) {
    dlStat.textContent = `${downloads.toLocaleString('id-ID')}+ Unduhan`;
  }

  document.querySelectorAll('.js-download-btn').forEach((a) => {
    a.setAttribute('href', url);
  });

  if (clList && Array.isArray(changelog) && changelog.length > 0) {
    clList.innerHTML = '';
    changelog.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line.replace(/^[-•*]\s*/, '');
      clList.appendChild(li);
    });
  }
}

async function loadRelease() {
  try {
    const local = await fetch(`./version.json?t=${Date.now()}`);
    if (local.ok) {
      const d = await local.json();
      applyRelease({
        version: d.version,
        apkUrl: d.apkUrl,
        sizeBytes: d.fileSizeBytes,
        changelog: d.changelog,
      });
    }
  } catch {}

  try {
    const res = await fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return;
    const rel = await res.json();
    const assets = Array.isArray(rel.assets) ? rel.assets : [];
    const apk = assets.find((a) => String(a.name || '').toLowerCase().endsWith('.apk'));
    const notes = String(rel.body || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'))
      .slice(0, 8);

    applyRelease({
      version: rel.tag_name || rel.name,
      apkUrl: apk?.browser_download_url || rel.html_url,
      sizeBytes: apk?.size || 0,
      downloads: apk?.download_count || 0,
      changelog: notes.length > 0 ? notes : undefined,
    });
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  setupGallery();
  setupDspRack();
  loadRelease();
});
