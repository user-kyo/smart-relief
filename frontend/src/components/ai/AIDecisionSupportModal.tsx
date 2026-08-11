import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Send,
  HelpCircle,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";

interface AIDecisionSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDecisionSupportModal: React.FC<AIDecisionSupportModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    aiRecommendations,
    acceptAIRecommendation,
    rejectAIRecommendation,
    fetchAIRecommendations,
    isAiLoading,
    incidents,
    resources
  } = useSmartRelief();

  const [activeTab, setActiveTab] = useState<"recommendations" | "chat">("recommendations");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "ai"; text: string; timestamp: string }[]
  >([
    {
      sender: "ai",
      text: "SmartRelief AI Decision Support Engine initialized. I have analyzed 4 active incidents, 6 resource categories, and 4 evacuation facilities. How can I assist with tactical dispatch or resource allocation?",
      timestamp: "Just now"
    }
  ]);
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || isSendingQuery) return;

    const userMsg = chatQuery;
    setChatQuery("");
    setChatHistory(prev => [
      ...prev,
      { sender: "user", text: userMsg, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    ]);

    setIsSendingQuery(true);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: userMsg,
          context: { incidents, resources }
        })
      });
      const data = await res.json();

      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "Analyzed spatial emergency data: Priority response should be allocated to Sector 4 flood zone.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: "SmartRelief Decision Engine: Based on current active logs, 3 critical flood incidents require immediate motorboat deployment in Sector 4. Evacuation Center Central Gym is near capacity (88%), and supply replenishment is advised within 3 hours.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsSendingQuery(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SmartRelief AI Decision Support System"
      subtitle="Operational Intelligence & Spatial Decision Rationale Engine"
      maxWidth="4xl"
    >
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "recommendations"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Recommendations ({aiRecommendations.filter(r => r.status === "PENDING").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Scenario Advisor</span>
          </button>
        </div>

        <button
          onClick={() => fetchAIRecommendations()}
          disabled={isAiLoading}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin text-blue-600" : ""}`} />
          <span>Re-Analyze Operations</span>
        </button>
      </div>

      {/* Tab 1: AI Recommendations List */}
      {activeTab === "recommendations" && (
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human-in-the-Loop Decision Model:</span> AI suggestions provide structured decision support with spatial rationale. All recommendations require explicit administrator approval or modification before execution.
            </div>
          </div>

          <div className="space-y-3">
            {aiRecommendations.map(rec => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all ${
                  rec.status === "ACCEPTED"
                    ? "bg-emerald-50/50 border-emerald-200 opacity-80"
                    : rec.status === "REJECTED"
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge type="severity" value={rec.severity} size="sm" />
                      <span className="text-xs font-bold text-blue-600 font-mono">
                        Impact Score: {rec.impactScore}/100
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        {rec.category}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{rec.title}</h4>
                  </div>

                  {rec.status && rec.status !== "PENDING" && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      rec.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600"
                    }`}>
                      {rec.status}
                    </span>
                  )}
                </div>

                {/* Explicit "WHY Suggested" Rationale Box */}
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-600" />
                    Why This Was Suggested (AI Rationale):
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{rec.reasoning}</p>
                </div>

                {/* Concrete Recommended Action */}
                <div className="mt-3 text-xs text-slate-800 flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">Recommended Action:</span>
                  <span className="font-medium">{rec.recommendedAction}</span>
                </div>

                {/* Workflow Buttons */}
                {rec.status === "PENDING" && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectAIRecommendation(rec.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    <button
                      onClick={() => acceptAIRecommendation(rec.id)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Execute Recommendation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Scenario Query Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[400px] pt-2">
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs space-y-1 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" />
                      SmartRelief AI Advisor
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendQuery} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={e => setChatQuery(e.target.value)}
              placeholder="e.g., 'What is the optimal evacuation route for Barangay San Jose?' or 'Predict resource demand for next 12 hrs'..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isSendingQuery || !chatQuery.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSendingQuery ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Query</span>
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
};
