/**
 * Speech Engine: High-fidelity Arabic TTS & Voice Command Recognizer
 */

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private arabicVoice: SpeechSynthesisVoice | null = null;
  private egyptianVoice: SpeechSynthesisVoice | null = null;
  private femaleArabicVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;
  // Spoken voice assistant is strictly deactivated by default, active ONLY in "وضع البصيرة للمكفوفين"
  private isFeedbackEnabled = false;
  // Voice tone / gender preference: 'male' (default warm male) or 'female' (warm calm female)
  private voiceGender: "male" | "female" = "male";
  private voicePitch: number = 0.98;
  private voiceRate: number = 0.98;

  constructor() {
    if (typeof window !== "undefined") {
      const savedPref = localStorage.getItem("noor_voice_feedback");
      if (savedPref !== null) {
        this.isFeedbackEnabled = savedPref === "true";
      } else {
        this.isFeedbackEnabled = false;
      }

      const savedGender = localStorage.getItem("noor_voice_gender");
      if (savedGender === "female" || savedGender === "male") {
        this.voiceGender = savedGender;
        this.voicePitch = savedGender === "female" ? 1.2 : 0.95;
      }

      const savedRate = localStorage.getItem("noor_voice_rate");
      if (savedRate) {
        const parsedRate = parseFloat(savedRate);
        if (!isNaN(parsedRate)) this.voiceRate = parsedRate;
      }

      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  /**
   * Get current voice gender ('male' | 'female')
   */
  getVoiceGender(): "male" | "female" {
    return this.voiceGender;
  }

  /**
   * Set voice gender ('male' | 'female') and persist preference
   */
  setVoiceGender(gender: "male" | "female") {
    this.voiceGender = gender;
    this.voicePitch = gender === "female" ? 1.22 : 0.95;
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_voice_gender", gender);
    }
    this.initVoices();
  }

  /**
   * Get current voice pitch
   */
  getVoicePitch(): number {
    return this.voicePitch;
  }

  /**
   * Set voice pitch
   */
  setVoicePitch(pitch: number) {
    this.voicePitch = pitch;
  }

  /**
   * Get current speech reading rate
   */
  getVoiceRate(): number {
    return this.voiceRate;
  }

  /**
   * Set speech reading rate
   */
  setVoiceRate(rate: number) {
    this.voiceRate = rate;
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_voice_rate", String(rate));
    }
  }

  /**
   * Check if Voice Sensory Feedback / Blind Mode is enabled
   */
  isVoiceFeedback(): boolean {
    return this.isFeedbackEnabled;
  }

  /**
   * Set Voice Sensory Feedback state
   */
  setVoiceFeedback(enabled: boolean) {
    this.isFeedbackEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_voice_feedback", String(enabled));
    }
    if (enabled) {
      this.speak("تم تفعيل وضع البصيرة للمكفوفين. المساعد الصوتي في خدمتكم لنطق الأقسام والأزرار.");
    } else {
      this.stop();
    }
  }

  /**
   * Toggle Voice Sensory Feedback / Blind Mode
   */
  toggleVoiceFeedback(): boolean {
    const nextState = !this.isFeedbackEnabled;
    this.setVoiceFeedback(nextState);
    return nextState;
  }

  /**
   * Update accessibility live region for screen readers (NVDA, TalkBack, VoiceOver)
   */
  public announceForScreenReader(text: string) {
    if (typeof document === "undefined") return;
    let liveRegion = document.getElementById("noor-sr-announcements");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "noor-sr-announcements";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      liveRegion.style.position = "absolute";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.padding = "0";
      liveRegion.style.margin = "-1px";
      liveRegion.style.overflow = "hidden";
      liveRegion.style.clip = "rect(0, 0, 0, 0)";
      liveRegion.style.whiteSpace = "nowrap";
      liveRegion.style.border = "0";
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = text;
  }

  /**
   * Announce voice feedback for navigation tab changes
   */
  speakNavFeedback(tabTitle: string, tabDesc?: string) {
    const fullText = tabDesc
      ? `الانتقال إلى ${tabTitle}. ${tabDesc}`
      : `الانتقال إلى ${tabTitle}.`;
    this.announceForScreenReader(fullText);

    if (!this.isFeedbackEnabled) return;
    this.speak(fullText, { immediate: true, rate: 1.0 });
  }

  /**
   * Announce voice feedback for theme changes
   */
  speakThemeFeedback(theme: string) {
    let description = "";
    switch (theme) {
      case "natural":
        description = "تم تفعيل الثيم الطبيعي المعتمد، درجات الزمرد الأخضر المريحة للعين.";
        break;
      case "paper":
        description = "تم تفعيل نمط المصحف الورقي الدافئ، قراءة نهارية هادئة بلون ورق المصحف الكلاسيكي.";
        break;
      case "night":
        description = "تم تفعيل الوضع الليلي الأسود الخالص لشاشات أوليد، راحة تامة للعين وتوفير للبطارية.";
        break;
      case "light":
        description = "تم تفعيل الوضع الفاتح العصري، تباين عالي ووضوح فائق للنصوص.";
        break;
      default:
        description = `تم تغيير الثيم إلى ${theme}`;
    }

    this.announceForScreenReader(description);

    if (!this.isFeedbackEnabled) return;
    this.speak(description, { immediate: true, rate: 1.0 });
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();

    // Prioritize natural male Arabic / Egyptian voices for companion (صوت رجل مصري/عربي دافئ)
    const maleNames = ["maged", "tarek", "tarik", "naayf", "shakir", "majed", "hamed", "omar", "ali", "mehdi", "male"];
    const maleArabicVoice = voices.find(
      (v) =>
        (v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")) &&
        maleNames.some((m) => v.name.toLowerCase().includes(m))
    );

    // Prioritize natural female Arabic voices (صوت امرأة عربية هادئة ورقيقة)
    const femaleNames = ["zeina", "laila", "layla", "mariam", "maryam", "salma", "hoda", "samira", "fatima", "female"];
    this.femaleArabicVoice = voices.find(
      (v) =>
        (v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")) &&
        femaleNames.some((f) => v.name.toLowerCase().includes(f))
    ) || null;

    // Prioritize natural Egyptian voices for trainer/companion
    this.egyptianVoice =
      maleArabicVoice ||
      voices.find((v) => v.lang.startsWith("ar-EG") || v.lang.startsWith("ar_EG")) ||
      voices.find((v) => v.name.toLowerCase().includes("egypt") || v.name.toLowerCase().includes("مصر")) ||
      null;

    // Prioritize natural Arabic voices
    this.arabicVoice =
      maleArabicVoice ||
      voices.find((v) => v.lang.startsWith("ar-SA") || v.lang.startsWith("ar_SA")) ||
      this.egyptianVoice ||
      voices.find((v) => v.lang.startsWith("ar")) ||
      voices.find((v) => v.name.toLowerCase().includes("arabic") || v.name.toLowerCase().includes("عربي")) ||
      null;

    if (!this.egyptianVoice) {
      this.egyptianVoice = this.arabicVoice;
    }
    if (!this.femaleArabicVoice) {
      // If no dedicated female voice, use available arabic voice with higher pitch
      this.femaleArabicVoice = this.arabicVoice;
    }
    this.isInitialized = true;
  }

  /**
   * Speak Egyptian Arabic text for companion/trainer
   */
  speakEgyptian(
    text: string,
    options: { immediate?: boolean; rate?: number; pitch?: number; gender?: "male" | "female"; onEnd?: () => void } = {}
  ) {
    if (!this.synth) return;

    if (options.immediate !== false) {
      this.synth.cancel();
    }

    const cleanText = text
      .replace(/[*_#`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (!this.isInitialized) {
      this.initVoices();
    }

    const targetGender = options.gender || this.voiceGender;
    if (targetGender === "female" && this.femaleArabicVoice) {
      utterance.voice = this.femaleArabicVoice;
      utterance.pitch = options.pitch || 1.22;
    } else {
      if (this.egyptianVoice) utterance.voice = this.egyptianVoice;
      utterance.pitch = options.pitch || this.voicePitch;
    }

    utterance.lang = "ar-EG";
    utterance.rate = options.rate || this.voiceRate;

    if (options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    this.synth.speak(utterance);
  }

  /**
   * Speak Arabic text immediately
   */
  speak(text: string, options: { immediate?: boolean; rate?: number; onEnd?: () => void } = {}) {
    if (!this.synth) return;

    if (options.immediate !== false) {
      this.synth.cancel(); // Stop any pending speech
    }

    const cleanText = text
      .replace(/[*_#`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (!this.arabicVoice) {
      this.initVoices();
    }
    if (this.arabicVoice) {
      utterance.voice = this.arabicVoice;
    }
    utterance.lang = "ar-SA";
    utterance.rate = options.rate || 0.95; // Calm, reverent Arabic cadence
    utterance.pitch = 1.0;

    if (options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }

  /**
   * Create voice recognition instance
   */
  createRecognition(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ): any | null {
    if (typeof window === "undefined") return null;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return null;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "ar-SA";

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0]) {
          const text = event.results[0][0].transcript;
          onResult(text);
        }
      };

      recognition.onerror = (event: any) => {
        if (onError) onError(event);
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      return recognition;
    } catch {
      return null;
    }
  }
}

export const speechEngine = new SpeechEngine();
