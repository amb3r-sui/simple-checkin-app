let audioCtx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  return localStorage.getItem('expresscheck_sound_enabled') !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('expresscheck_sound_enabled', enabled ? 'true' : 'false');
}

export function triggerSuccessFeedback() {
  // Haptic feedback for mobile devices
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 40, 80]);
    } catch {
      /* ignore */
    }
  }

  // Audio feedback using Web Audio API
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // C5 (523.25Hz) -> E5 (659.25Hz) and G5 (783.99Hz) -> C6 (1046.5Hz) chime
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);

    osc2.frequency.setValueAtTime(783.99, now);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    /* ignore audio errors */
  }
}
