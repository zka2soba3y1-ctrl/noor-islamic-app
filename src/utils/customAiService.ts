/**
 * Custom AI Assistant Connector Service
 * Allows users to connect their own AI backend / endpoint / model name
 * (OpenAI-compatible, Gemini direct, Ollama, DeepSeek, Groq, OpenRouter, etc.)
 */

export type AIProviderType = "builtin" | "openai_compatible" | "gemini_direct" | "ollama";

export interface CustomAIConfig {
  provider: AIProviderType;
  endpoint: string;
  modelName: string;
  apiKey: string;
  systemPrompt: string;
  temperature: number;
}

const DEFAULT_CONFIG: CustomAIConfig = {
  provider: "builtin",
  endpoint: "/api/gemini/companion",
  modelName: "gemini-2.5-flash",
  apiKey: "",
  systemPrompt:
    "أنت رفيق إسلامي ذكي، وقور، رحيم ومتقن في تطبيق 'النور'. تجيب بأدب جم، لغة عربية فصحى مشكولة أو لهجة مصرية هادئة ودودة حسب طلب المستخدم، مع توثيق المصادر من القرآن الكريم والسنة النبوية الصحيحة.",
  temperature: 0.7,
};

class CustomAIService {
  private config: CustomAIConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): CustomAIConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try {
      const saved = localStorage.getItem("noor_custom_ai_config");
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_CONFIG;
  }

  getConfig(): CustomAIConfig {
    return { ...this.config };
  }

  saveConfig(newConfig: Partial<CustomAIConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_custom_ai_config", JSON.stringify(this.config));
        window.dispatchEvent(
          new CustomEvent("noor-custom-ai-changed", { detail: { config: this.config } })
        );
      } catch {}
    }
  }

  resetToDefault() {
    this.config = { ...DEFAULT_CONFIG };
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("noor_custom_ai_config");
        window.dispatchEvent(
          new CustomEvent("noor-custom-ai-changed", { detail: { config: this.config } })
        );
      } catch {}
    }
  }

  isCustomEnabled(): boolean {
    return this.config.provider !== "builtin" && Boolean(this.config.endpoint);
  }

  /**
   * Live Test Connection to the specified Endpoint and Model
   */
  async testConnection(): Promise<{ success: boolean; message: string; reply?: string }> {
    if (!this.isCustomEnabled()) {
      return {
        success: true,
        message: "الخادم الافتراضي المدمج لتطبيق النور مفعل وجاهز للعمل.",
        reply: "السلام عليكم ورحمة الله وبركاته، أنا رفيقك في تطبيق النور وجاهز لمساعدتك.",
      };
    }

    try {
      const reply = await this.query("السلام عليكم، من أنت باختصار؟");
      return {
        success: true,
        message: `تم الاتصال بنجاح بالنموذج (${this.config.modelName}) عبر الخادم المحدد!`,
        reply,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `فشل الاتصال: ${err?.message || "تعذر الوصول للعنوان أو مفتاح API غير صحيح"}`,
      };
    }
  }

  /**
   * Dispatch query to either custom provider or built-in endpoint
   */
  async query(prompt: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    // If Built-in Provider
    if (this.config.provider === "builtin" || !this.config.endpoint) {
      const res = await fetch("/api/gemini/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: prompt,
          conversationHistory,
        }),
      });
      if (!res.ok) {
        throw new Error(`خطأ في خادم النور (${res.status})`);
      }
      const data = await res.json();
      return data.response || "عذراً، لم أتمكن من استرجاع إجابة واضحة حالياً.";
    }

    // If OpenAI-Compatible or Ollama or Direct Endpoint
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey.trim()}`;
    }

    const messages = [
      { role: "system", content: this.config.systemPrompt },
      ...conversationHistory.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: prompt },
    ];

    const body: Record<string, any> = {
      model: this.config.modelName || "gpt-4o-mini",
      messages,
      temperature: this.config.temperature || 0.7,
    };

    const res = await fetch(this.config.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`خطأ في استجابة الخادم (${res.status}): ${errorText.slice(0, 120)}`);
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.response ||
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("لم يتم العثور على نص في استجابة النموذج.");
    }

    return content;
  }
}

export const customAiService = new CustomAIService();
