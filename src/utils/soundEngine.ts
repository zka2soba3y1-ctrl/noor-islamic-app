/**
 * Sound & Haptic Synthesizer for Noor Global Islamic Project
 * Designed to provide sensory tactile and auditory feedback without external audio files
 */

import { hapticEngine, HapticPatternType } from "./hapticEngine";

class SoundHapticEngine {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Warm up and unlock audio context on user gesture
   */
  init() {
    try {
      this.getAudioContext();
    } catch {}
  }

  /**
   * Play a soft haptic vibration if supported
   */
  vibrate(pattern: number | number[]) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if restricted
      }
    }
  }

  /**
   * Trigger a named haptic pattern from the Haptic Pattern Engine
   */
  triggerHaptic(patternId: HapticPatternType) {
    hapticEngine.trigger(patternId);
  }

  /**
   * Trigger dedicated haptic alert pattern for specific prayer
   */
  playPrayerAlertHaptic(prayerKey: string) {
    const key = prayerKey.toLowerCase();
    if (key.includes("fajr") || key.includes("فجر")) {
      hapticEngine.trigger("prayer_fajr");
    } else if (key.includes("dhuhr") || key.includes("ظهر") || key.includes("ضهر")) {
      hapticEngine.trigger("prayer_dhuhr");
    } else if (key.includes("asr") || key.includes("عصر")) {
      hapticEngine.trigger("prayer_asr");
    } else if (key.includes("maghrib") || key.includes("مغرب")) {
      hapticEngine.trigger("prayer_maghrib");
    } else if (key.includes("isha") || key.includes("عشاء") || key.includes("عشا")) {
      hapticEngine.trigger("prayer_isha");
    } else {
      hapticEngine.trigger("prayer_dhuhr");
    }
  }

  /**
   * Trigger dedicated haptic alert pattern for athkar
   */
  playAthkarAlertHaptic(type: "morning" | "evening" | "sleep" | string) {
    if (type === "morning" || type.includes("صباح")) {
      hapticEngine.trigger("athkar_morning");
    } else if (type === "evening" || type.includes("مساء")) {
      hapticEngine.trigger("athkar_evening");
    } else if (type === "sleep" || type.includes("نوم")) {
      hapticEngine.trigger("athkar_sleep");
    } else {
      hapticEngine.trigger("athkar_morning");
    }
  }

  /**
   * Play a single tasbih acoustic bead click
   */
  playTasbihClick() {
    this.vibrate(25);
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Milestone for 33 tasbeehat (distinct double vibration + harmonic chime)
   */
  playMilestone33() {
    this.vibrate([60, 80, 60]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch {}
  }

  /**
   * Milestone for 100 tasbeehat (triple vibration + full resonant chime)
   */
  playMilestone100() {
    this.vibrate([80, 60, 80, 60, 120]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.25, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch {}
  }

  /**
   * Qibla Proximity Beep (frequency and interval speed up as diff decreases)
   */
  playQiblaProximityPip(diffAngle: number) {
    const absDiff = Math.abs(diffAngle);
    if (absDiff < 4) {
      // Locked state: will be handled by playQiblaLocked
      return;
    }

    // Vibrations: short pulse
    const duration = Math.max(15, Math.min(40, Math.round(50 - absDiff / 4)));
    this.vibrate(duration);

    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch increases as angle closes in (400Hz when 90 deg away, up to 880Hz when 5 deg away)
      const pitch = Math.min(880, Math.max(380, 880 - absDiff * 5.5));
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  /**
   * Qibla Locked Chime: User reached the exact Kaaba direction (±3 deg for 800ms)
   */
  playQiblaLocked() {
    this.vibrate([100, 50, 150]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      // Resonant harmonic chord: F# - A# - C# - F# (peaceful resonant tone)
      const chord = [740, 932, 1108];

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
      });
    } catch {}
  }

  /**
   * Voice Assistant Listening Trigger Beep
   */
  playAssistantActivate() {
    this.vibrate([70, 40, 70]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Powerful Islamic Intro Chime & Harmonic Sequence for Welcome Flow
   */
  playIntroIslamicTheme() {
    this.vibrate([100, 60, 150, 60, 200]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      // Majestic Hijaz / Rast resonant frequencies: D4, F4, G4, A4, D5
      const notes = [
        { f: 293.66, t: 0.0, dur: 1.8, vol: 0.22 },
        { f: 349.23, t: 0.2, dur: 1.6, vol: 0.18 },
        { f: 440.0, t: 0.45, dur: 1.5, vol: 0.2 },
        { f: 587.33, t: 0.75, dur: 2.0, vol: 0.25 },
        { f: 880.0, t: 1.05, dur: 1.8, vol: 0.15 },
      ];

      notes.forEach(({ f, t, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(vol, now + t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + dur);
      });
    } catch {}
  }

  /**
   * Adhan call preview harmonic tone
   */
  playAdhanChime() {
    this.vibrate([200, 100, 300]);
    try {
      // Import adhanService dynamically or dispatch event to play authentic Sheikh Ali Mulla Adhan
      window.dispatchEvent(new CustomEvent("noor-play-adhan-request"));
    } catch {}
  }

  /**
   * Stop any playing Adhan
   */
  stopAdhan() {
    try {
      window.dispatchEvent(new CustomEvent("noor-stop-adhan-request"));
    } catch {}
  }

  /**
   * Resonant harmonic completion chime when completing target duas or prayers
   */
  playLevelUpChime() {
    this.vibrate([60, 40, 80, 40, 120]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  /**
   * Serene ambient chime for Athkar smart reminders
   */
  playAthkarNotificationChime() {
    this.vibrate([80, 50, 80, 50, 140]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      // Gentle pentatonic chime (F5, A5, C6, E6)
      const frequencies = [698.46, 880.0, 1046.5, 1318.51];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.16, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.75);
      });
    } catch {}
  }

  /**
   * Tactile feedback for double-tap gesture
   */
  playGestureDoubleTap() {
    this.vibrate([40, 30, 50]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      [580, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.15, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.08);
      });
    } catch {}
  }

  /**
   * Tactile feedback for swipe gesture (swoosh harmonic)
   */
  playGestureSwipe(direction: "left" | "right" | "up" | "down" = "right") {
    this.vibrate(35);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const startFreq = direction === "right" || direction === "down" ? 350 : 550;
      const endFreq = direction === "right" || direction === "down" ? 650 : 320;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Tactile feedback for two-finger gesture (pause / mute)
   */
  playGestureTwoFingerTap() {
    this.vibrate([60, 50, 60]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  /**
   * Audio chime for training milestone / gesture practice success
   */
  playGestureSuccess() {
    this.vibrate([40, 30, 40, 30, 80]);
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.15, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.2);
      });
    } catch {}
  }
}

export const soundEngine = new SoundHapticEngine();
