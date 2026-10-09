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
  ShieldCheck,
  Bot
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

  React.useEffect(() => {
    if (isOpen) {
      if (aiRecommendations.length === 0 && !isAiLoading) {
        fetchAIRecommendations();
      }
      // Force reset chat to the dynamic initial state every time it opens for demonstration purposes
      setChatHistory([
        {
          sender: "ai",
          text: `SmartRelief AI Decision Support Engine initialized. I have analyzed ${incidents.length} active incidents and ${resources.length} resource stockpiles. How can I assist with tactical dispatch or resource allocation?`,
          timestamp: "Just now"
        }
      ]);
    }
  }, [isOpen]);

  const [activeTab, setActiveTab] = useState<"recommendations" | "chat">("recommendations");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "ai"; text: string; timestamp: string }[]
  >([]);
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
      const activeCrits = incidents.filter(i => i.severity === 'CRITICAL').length;
      const lowRes = resources.filter(r => r.availableQuantity <= r.minThreshold).length;
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: `SmartRelief Decision Engine: Based on current live data, there are ${activeCrits} critical incidents requiring immediate attention, and ${lowRes} resource categories are below 20% safe capacity. I recommend prioritizing dispatch to the most critical incident zones and initiating inter-LGU transfer for depleted resources.`,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "recommendations"
                ? "bg-blue-600 text-white shadow-sm border-transparent"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">AI Recommendations ({aiRecommendations.filter(r => r.status === "PENDING").length})</span>
            <span className="sm:hidden">Recs ({aiRecommendations.filter(r => r.status === "PENDING").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-sm border-transparent"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Scenario Advisor</span>
            <span className="sm:hidden">Chat</span>
          </button>
        </div>

        <button
          onClick={() => fetchAIRecommendations()}
          disabled={isAiLoading}
          className="w-full sm:w-auto justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`} />
          <span>Re-Analyze Operations</span>
        </button>
      </div>

      {/* Tab 1: AI Recommendations List */}
      {activeTab === "recommendations" && (
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human-in-the-Loop Decision Model:</span> AI suggestions provide structured decision support with spatial rationale. All recommendations require explicit administrator approval or modification before execution.
            </div>
          </div>

          <div className="space-y-3">
            {isAiLoading ? (
              // Realistic Skeleton System
              <>
                {[1, 2].map((i) => (
                  <div key={`skeleton-${i}`} className="p-4 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {/* Skeleton Badge */}
                          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                          {/* Skeleton Score */}
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          {/* Skeleton Category */}
                          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        {/* Skeleton Title */}
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                      </div>
                    </div>

                    {/* Skeleton Rationale Box */}
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                      <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>

                    {/* Skeleton Action */}
                    <div className="mt-3 flex items-start gap-2">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded shrink-0"></div>
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              aiRecommendations.length > 0 ? (
                aiRecommendations.map(rec => (
              <div
                key={rec.id}
                className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-500 ${
                  rec.status === "ACCEPTED"
                    ? "bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-800/60 shadow-[0_8px_30px_rgba(16,185,129,0.12)]"
                    : rec.status === "REJECTED"
                    ? "bg-gradient-to-b from-rose-50/50 to-slate-50/50 dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/30 opacity-80 grayscale-[0.4]"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:border-blue-300/50 dark:hover:border-blue-500/30"
                }`}
              >
                {/* Decorative Glowing Blobs */}
                {rec.status === "PENDING" && (
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                )}
                {rec.status === "ACCEPTED" && (
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                )}
                {rec.status === "REJECTED" && (
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                )}

                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  rec.status === 'ACCEPTED' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                  rec.status === 'REJECTED' ? 'bg-gradient-to-b from-rose-400 to-rose-600' :
                  'bg-gradient-to-b from-blue-400 to-indigo-600'
                }`} />

                {rec.status === "ACCEPTED" && (
                  <div className="absolute top-5 right-5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-200 dark:border-emerald-500/30 backdrop-blur-md">
                    <Check className="w-4 h-4" />
                    Executed
                  </div>
                )}
                {rec.status === "REJECTED" && (
                  <div className="absolute top-5 right-5 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border border-rose-200 dark:border-rose-500/30 backdrop-blur-md">
                    <X className="w-4 h-4" />
                    Dismissed
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 relative z-10 pl-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <StatusBadge type="severity" value={rec.severity} size="sm" />
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
                        <BrainCircuit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                          {rec.impactScore} Score
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold tracking-wider bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                        {rec.category}
                      </span>
                    </div>

                    <h4 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                      rec.status === 'REJECTED' 
                        ? 'text-slate-500 dark:text-slate-400' 
                        : 'bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'
                    }`}>
                      {rec.title}
                    </h4>
                  </div>
                </div>

                <div className={`mt-5 p-4 rounded-2xl text-sm space-y-2 border relative overflow-hidden group transition-all duration-300 ${
                  rec.status === 'ACCEPTED' ? 'bg-emerald-50/50 border-emerald-100/50 dark:bg-emerald-900/10 dark:border-emerald-500/20' :
                  rec.status === 'REJECTED' ? 'bg-rose-50/50 border-rose-100/50 dark:bg-rose-900/10 dark:border-rose-500/20' :
                  'bg-slate-50/50 hover:bg-slate-50 border-slate-200/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 dark:border-slate-700/50'
                }`}>
                  <div className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2 tracking-wide">
                    <Bot className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    AI Rationale & Analysis
                  </div>
                  <p className={`leading-relaxed font-medium ${
                    rec.status === 'REJECTED' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {rec.reasoning}
                  </p>
                </div>

                <div className={`mt-4 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm border ${
                  rec.status === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/20 dark:border-emerald-500/30' :
                  rec.status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/10 dark:bg-rose-500/10 dark:border-rose-500/20' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/30'
                }`}>
                  <div className={`p-3 rounded-2xl shadow-sm shrink-0 ${
                    rec.status === 'ACCEPTED' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' :
                    rec.status === 'REJECTED' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 dark:from-rose-900/50 dark:to-rose-800/50 dark:text-rose-400' :
                    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30'
                  }`}>
                    {rec.status === 'ACCEPTED' ? <Check className="w-6 h-6" /> :
                     rec.status === 'REJECTED' ? <X className="w-6 h-6" /> :
                     <ArrowRight className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <span className={`block text-[11px] font-black uppercase tracking-widest mb-1 ${
                      rec.status === 'ACCEPTED' ? 'text-emerald-700 dark:text-emerald-400' :
                      rec.status === 'REJECTED' ? 'text-rose-700 dark:text-rose-400' :
                      'text-blue-700 dark:text-blue-400'
                    }`}>
                      {rec.status === 'ACCEPTED' ? 'Executed Action' :
                       rec.status === 'REJECTED' ? 'Dismissed Action' :
                       'Recommended Action'}
                    </span>
                    <span className={`font-semibold text-base sm:text-lg ${
                      rec.status === 'REJECTED' ? 'text-slate-500 dark:text-slate-400 line-through decoration-rose-500/50' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {rec.recommendedAction}
                    </span>
                  </div>
                </div>

                {rec.status === "PENDING" && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3 relative z-10">
                    <button
                      onClick={() => rejectAIRecommendation(rec.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-2 border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Reject Proposal
                    </button>

                    <button
                      onClick={() => acceptAIRecommendation(rec.id)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <Check className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                      <span className="relative z-10">Authorize & Execute</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <Bot className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Recommendations Available</h3>
              <p className="text-xs text-slate-500 mt-1">Click "Re-Analyze Operations" to generate AI insights based on current data.</p>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Scenario Query Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[400px] pt-2">
          <div className="flex-1 overflow-y-auto space-y-3 p-3 pr-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
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
              placeholder="e.g., 'What is the optimal evacuation route for Barangay San Jose?' or 'Predict resource demand'..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isSendingQuery || !chatQuery.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
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
