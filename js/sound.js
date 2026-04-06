// Sound Controller

const SOUNDS = {
    button:     'assets/audio/button.mp3',
    pacmaneat:  'assets/audio/pacmaneat.mp3',
    background: 'assets/audio/background.mp3',
};

let soundEnabled = true;
let bgAudio = null;

// Web Audio API context + decoded buffers for zero-latency SFX
let audioCtx = null;
const buffers = {};

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

async function preloadBuffer(key, url) {
    try {
        const ctx  = getAudioCtx();
        const res  = await fetch(url);
        const data = await res.arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(data);
    } catch (e) {}
}

// ── Core Helpers ──────────────────────────────────────────────────────────────

function playSound(key) {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    const buf = buffers[key];
    if (!buf) return;
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
}

function playBackground() {
    if (!soundEnabled) return;
    if (bgAudio && !bgAudio.paused) return; // already playing

    bgAudio = new Audio(SOUNDS.background);
    bgAudio.loop   = false;
    bgAudio.volume = 1.0;
    bgAudio.play().catch(() => {});
}

function stopBackground() {
    if (bgAudio) {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }
}

// ── Sound Toggle ──────────────────────────────────────────────────────────────

function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    if (!enabled) stopBackground();
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function initSound() {
    // Pre-decode SFX buffers for instant playback
    preloadBuffer('button',   SOUNDS.button);
    preloadBuffer('pacmaneat', SOUNDS.pacmaneat);

    // Button click sound on all interactive buttons
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button, .nav-bottom-item, .nav-link, .tool-nav-btn');
        if (!btn) return;
        // Skip sound toggle button itself to avoid feedback loop
        if (btn.id === 'soundToggle') return;
        playSound('button');
    });

    // Sound toggle button
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            updateSoundIcon();
            if (!soundEnabled) stopBackground();
        });
        updateSoundIcon();
    }

    // Patch navigateTo to detect contact page & play background
    const _origNavigateTo = window.navigateTo;
    window.navigateTo = function (page) {
        _origNavigateTo(page);
        if (page === 'contact') playBackground();
        else stopBackground();
    };
}

function updateSoundIcon() {
    const onIcon  = document.getElementById('soundOnIcon');
    const offIcon = document.getElementById('soundOffIcon');
    if (onIcon)  onIcon.style.display  = soundEnabled ? 'block' : 'none';
    if (offIcon) offIcon.style.display = soundEnabled ? 'none'  : 'block';
}

// ── Public API ────────────────────────────────────────────────────────────────

window.initSound       = initSound;
window.playSound       = playSound;
window.playBackground  = playBackground;
window.stopBackground  = stopBackground;
window.setSoundEnabled = setSoundEnabled;
