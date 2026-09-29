import React, { useState } from "react";
import {
  X,
  Bot,
  Key,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Sliders,
} from "lucide-react";
import {
  customAiService,
  CustomAIConfig,
  AIProviderType,
} from "../../utils/customAiService";
import { i18n } from "../../utils/i18n";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAISettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<CustomAIConfig>(() => customAiService.getConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testResultMsg, setTestResultMsg] = useState<string>("");
  const [testReply, setTestReply] = useState<string>("");

  if (!isOpen) return null;

  const handleProviderSelect = (provider: AIProviderType) => {
    soundEngine.playTasbihClick();
    let endpoint = config.endpoint;
    let modelName = config.modelName;

    if (provider === "builtin") {
      endpoint = "/api/gemini/companion";
      modelName = "gemini-2.5-flash";
    } else if (provider === "openai_compatible") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      modelName = "gpt-4o-mini";
    } else if (provider === "gemini_direct") {
      endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
      modelName = "gemini-2.5-flash";
    } else if (provider === "ollama") {
      endpoint = "http://localhost:11434/v1/chat/completions";
      modelName = "llama3";
    }

    setConfig((prev) => ({
      ...prev,
      provider,
      endpoint,
      modelName,
    }));
  };

  const handleTestConnection = async () => {
    soundEngine.playTasbihClick();
    setTestStatus("testing");
    setTestResultMsg("جارٍ فحص الاتصال بالخادم والنموذج المختار...");
    setTestReply("");

    // Temporarily save to test
    customAiService.saveConfig(config);

    const res = await customAiService.testConnection();
    if (res.success) {
      soundEngine.playLevelUpChime();
      hapticEngine.trigger("assistant_respond");
      setTestStatus("success");
      setTestResultMsg(res.message);
      setTestReply(res.reply || "");
      speechEngine.speak("تم الاتصال بالنموذج الذكي بنجاح");
    } else {
      soundEngine.playGestureTwoFingerTap();
      setTestStatus("error");
      setTestResultMsg(res.message);
      speechEngine.speak("تعذر الاتصال بالخادم المخصص، يرجى مراجعة الرابط ومفتاح الـ API");
    }
  };

  const handleSave = () => {
    soundEngine.playTasbihClick();
    customAiService.saveConfig(config);
    speechEngine.speak("تم حفظ إعدادات المساعد الذكي المخصص بنجاح");
    onClose();
  };

  const handleReset = () => {
    soundEngine.playTasbihClick();
    customAiService.resetToDefault();
    setConfig(customAiService.getConfig());
    setTestStatus("idle");
    speechEngine.speak("تمت استعادة إعدادات الذكاء الاصطناعي الافتراضية");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#121214] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{i18n.t("companion.custom_ai")}</span>
              </h2>
              <p className="text-xs text-zinc-400">
                ربط خادمك الخاص ونموذجك المفضل (API & Endpoint & Model)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Provider Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              اختر نوع مزود الذكاء الاصطناعي (AI Provider):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleProviderSelect("builtin")}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  config.provider === "builtin"
                    ? "bg-emerald-500/15 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/40"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400">خادم النور المدمج</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">
                  Gemini Flash افتراضي بدون إعدادات
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect("openai_compatible")}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  config.provider === "openai_compatible"
                    ? "bg-cyan-500/15 border-cyan-500 text-white font-bold ring-1 ring-cyan-500/40"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-400">OpenAI Compatible</span>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">
                  OpenAI, DeepSeek, Groq, OpenRouter
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect("ollama")}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  config.provider === "ollama"
                    ? "bg-amber-500/15 border-amber-500 text-white font-bold ring-1 ring-amber-500/40"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">خادم محلي (Ollama)</span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">
                  تشغيل نماذج محلية Offline (Localhost)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect("gemini_direct")}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  config.provider === "gemini_direct"
                    ? "bg-blue-500/15 border-blue-500 text-white font-bold ring-1 ring-blue-500/40"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-400">Gemini Direct API</span>
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">
                  مفتاح Gemini API مباشر من Google
                </span>
              </button>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>عنوان الخادم (API Endpoint URL):</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">POST</span>
            </label>
            <input
              type="url"
              value={config.endpoint}
              onChange={(e) => setConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-hidden focus:border-cyan-500"
              dir="ltr"
            />
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>اسم النموذج (Model Name):</span>
            </label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => setConfig((prev) => ({ ...prev, modelName: e.target.value }))}
              placeholder="gpt-4o-mini / deepseek-chat / gemini-2.5-flash"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-hidden focus:border-amber-500"
              dir="ltr"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
              <span className="text-zinc-500 text-[10px] self-center">نماذج شائعة:</span>
              {["gemini-2.5-flash", "gpt-4o-mini", "deepseek-chat", "llama3"].map(
                (model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      setConfig((prev) => ({ ...prev, modelName: model }));
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-mono border border-white/5 transition"
                  >
                    {model}
                  </button>
                )
              )}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>مفتاح الـ API (API Key):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                (يُحفظ محلياً في متصفحك فقط بأمان)
              </span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">
                التحقق من صحة الربط:
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs transition active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{testStatus === "testing" ? "جارٍ الفحص..." : "اختبار الاتصال المباشر"}</span>
              </button>
            </div>

            {testStatus === "success" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{testResultMsg}</span>
                </div>
                {testReply && (
                  <p className="text-[11px] text-zinc-300 font-['Cairo',sans-serif] bg-black/30 p-2 rounded-lg mt-1 border border-white/5">
                    "{testReply}"
                  </p>
                )}
              </div>
            )}

            {testStatus === "error" && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{testResultMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
            >
              {i18n.t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              {i18n.t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
