"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import {
  Brain,
  Send,
  AlertTriangle,
  ArrowRight,
  Menu,
  ChevronRight,
  FolderMinus,
  Paperclip,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import { MOCK_RESPONSES, RichResponse } from "@/lib/advisor_data";

// ============================================================================
// CHAT MESSAGE TYPE
// ============================================================================
interface Message {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text: string;
  richData?: RichResponse;
}

// ============================================================================
// CHAT CHART COMPONENT
// ============================================================================
interface ChatChartProps {
  type: "bar" | "line" | "gauge";
  data: unknown;
}

const ChatChart = ({ type, data }: ChatChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    
    let option: echarts.EChartsOption = {};
    const isDark = document.documentElement.classList.contains("dark") || false;
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(226, 232, 240, 0.6)";
    const textColor = isDark ? "#94A3B8" : "#64748B";

    if (type === "bar") {
      const barData = data as { categories: string[]; values: number[] };
      option = {
        grid: { top: 10, right: 15, bottom: 20, left: 80 },
        xAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: textColor, fontSize: 8 } },
        yAxis: { type: "category", data: [...barData.categories].reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: textColor, fontSize: 8 } },
        series: [
          {
            type: "bar",
            data: [...barData.values].reverse(),
            itemStyle: {
              color: (params: unknown) => {
                const p = params as { value: number };
                return p.value >= 0 ? "#EF4444" : "#22C55E";
              },
              borderRadius: 3
            },
            label: { show: true, position: "right", formatter: "{c}%", fontSize: 8 }
          }
        ]
      };
    } else if (type === "line") {
      const lineData = data as { timeline: string[]; values: number[] };
      option = {
        grid: { top: 15, right: 15, bottom: 20, left: 45 },
        xAxis: { type: "category", data: lineData.timeline, axisLabel: { color: textColor, fontSize: 8 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: textColor, fontSize: 8 } },
        series: [
          {
            type: "line",
            data: lineData.values,
            smooth: true,
            itemStyle: { color: "#4F7CFF" },
            lineStyle: { width: 1.5 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(79, 124, 255, 0.15)" },
                { offset: 1, color: "rgba(79, 124, 255, 0)" }
              ])
            }
          }
        ]
      };
    } else if (type === "gauge") {
      const gaugeData = data as { score: number };
      option = {
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            center: ["50%", "75%"],
            radius: "95%",
            min: 0,
            max: 100,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.3, "#EF4444"],
                  [0.7, "#F97316"],
                  [1, "#22C55E"]
                ]
              }
            },
            pointer: {
              icon: "path://M12.8,0.7l12,20c0.4,0.7,0.2,1.5-0.4,1.9c-0.7,0.4-1.5,0.2-1.9-0.4L12,4.3L1.5,21.7c-0.4,0.7-1.2,0.9-1.9,0.5C-1,21.8-1.2,21-0.8,20.3l12-20C11.5,0.1,12.1,0.1,12.8,0.7z",
              length: "75%",
              width: 4,
              offsetCenter: [0, "5%"],
              itemStyle: { color: isDark ? "#E2E8F0" : "#475569" }
            },
            axisTick: { length: 4, lineStyle: { color: "auto", width: 1 } },
            splitLine: { length: 8, lineStyle: { color: "auto", width: 2 } },
            axisLabel: { color: textColor, fontSize: 8, distance: -35 },
            title: { offsetCenter: [0, "-20%"], fontSize: 9, color: textColor },
            detail: {
              fontSize: 14,
              offsetCenter: [0, "0%"],
              valueAnimation: true,
              formatter: "{value}",
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontWeight: "bold"
            },
            data: [{ value: gaugeData.score, name: "Target Health" }]
          }
        ]
      };
    }

    chart.setOption(option);
    
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [type, data]);

  return <div ref={chartRef} className="w-full h-36 mt-3 bg-surface-elevated/20 border border-border/40 rounded-sm" />;
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function AiAdvisorPage() {
  const router = useRouter();

  // Dialog / Chat history list
  const [history, setHistory] = useState([
    { id: "h1", title: "Credit Risk Analysis", timestamp: "Today, 10:14 AM", active: true },
    { id: "h2", title: "Discretionary Overspending Review", timestamp: "Yesterday, 3:45 PM", active: false },
    { id: "h3", title: "Affordable EMI Diagnostic", timestamp: "July 5, 2026", active: false },
    { id: "h4", title: "Cash Flow 6M Prediction", timestamp: "July 2, 2026", active: false }
  ]);

  // Message stream
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_welcome",
      sender: "assistant",
      timestamp: "10:14 AM",
      text: "GOOD MORNING, RAHUL.\n\nI've analyzed your financial health, transactions, risk profile, fraud alerts, and cash flow forecast.\n\nWhat would you like to understand today?"
    }
  ]);

  // Form input composer values
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [attachContext, setAttachContext] = useState(true);

  // Mobile drawer sheets toggles
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);

  // Scroll ref for chat log
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle preset prompt click
  const handlePromptSelect = useCallback((promptText: string, mockKey: string) => {
    // 1. Append user message
    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsError(false);

    // 2. Simulate AI thinking delay
    setTimeout(() => {
      const richReply = MOCK_RESPONSES[mockKey];
      if (richReply) {
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: richReply.text,
          richData: richReply
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
      } else {
        setIsError(true);
        setIsLoading(false);
      }
    }, 1100);
  }, []);

  // Handle composer submission
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    setInputValue("");

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsError(false);

    // Dynamic mock response parsing based on keywords
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase();
      let key = "risk"; // fallback
      if (normalizedQuery.includes("spend") || normalizedQuery.includes("buy") || normalizedQuery.includes("expense")) {
        key = "spending";
      } else if (normalizedQuery.includes("loan") || normalizedQuery.includes("afford") || normalizedQuery.includes("emi")) {
        key = "loan";
      } else if (normalizedQuery.includes("health") || normalizedQuery.includes("score") || normalizedQuery.includes("90")) {
        key = "health";
      } else if (normalizedQuery.includes("fraud") || normalizedQuery.includes("alert") || normalizedQuery.includes("anomaly")) {
        key = "fraud";
      } else if (normalizedQuery.includes("balance") || normalizedQuery.includes("forecast") || normalizedQuery.includes("6 months")) {
        key = "forecast";
      }

      const richReply = MOCK_RESPONSES[key];
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: richReply.text,
        richData: richReply
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  }, [inputValue]);

  // Load selected historical chat topic
  const handleSelectHistory = useCallback((id: string) => {
    setHistory((prev) => prev.map((h) => ({ ...h, active: h.id === id })));
    setIsHistoryOpen(false);
    
    // Clear and load mock message history based on topic
    let defaultMsg = "GOOD MORNING, RAHUL.\n\nI've analyzed your financial health, transactions, risk profile, fraud alerts, and cash flow forecast.\n\nWhat would you like to understand today?";
    let datasetKey = "";

    if (id === "h1") {
      datasetKey = "risk";
    } else if (id === "h2") {
      defaultMsg = "I've flagged unusual overspending in Dining & Entertainment relative to your baseline budget.";
      datasetKey = "spending";
    } else if (id === "h3") {
      defaultMsg = "Let's review the affordability parameters for a new term loan credit application.";
      datasetKey = "loan";
    } else if (id === "h4") {
      defaultMsg = "Reviewing cash flow forecasts and liquidity reserves projection curves.";
      datasetKey = "forecast";
    }

    const firstMsg: Message = {
      id: "m_welcome",
      sender: "assistant",
      timestamp: "10:14 AM",
      text: defaultMsg
    };

    if (datasetKey) {
      const rich = MOCK_RESPONSES[datasetKey];
      const detailMsg: Message = {
        id: "m_detail",
        sender: "assistant",
        timestamp: "10:15 AM",
        text: rich.text,
        richData: rich
      };
      setMessages([firstMsg, detailMsg]);
    } else {
      setMessages([firstMsg]);
    }
  }, []);

  // Clear active messages
  const handleNewChat = useCallback(() => {
    setMessages([
      {
        id: "m_welcome",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Conversation workspace reset. Ask me anything about your cash flow, transaction anomalies, credit ratings, or savings optimization."
      }
    ]);
    toast.success("Started a new AI Diagnostic session.");
  }, []);

  // Preset query pills definitions
  const suggestedPrompts = [
    { text: "Why did my risk score increase?", key: "risk" },
    { text: "Where am I overspending?", key: "spending" },
    { text: "Can I afford another loan?", key: "loan" },
    { text: "How to reach a Health Score of 90?", key: "health" },
    { text: "Explain my fraud alerts.", key: "fraud" },
    { text: "What is my 6M balance forecast?", key: "forecast" }
  ];

  return (
    <PageContainer className="pb-24 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* MOBILE OPTIMIZED TABS TOOLBAR */}
      <div className="flex justify-between items-center bg-surface border border-border p-2.5 rounded-sm select-none lg:hidden mb-4">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground font-sans font-bold cursor-pointer"
        >
          <Menu className="h-4 w-4" /> History
        </button>
        <span className="text-[11px] font-sans font-extrabold tracking-wider uppercase text-foreground-muted flex items-center gap-1">
          <Brain className="h-4 w-4 text-primary" /> AI Advisor
        </span>
        <button
          onClick={() => setIsContextOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground font-sans font-bold cursor-pointer"
        >
          Context Panel <ChevronRight className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* CORE WORKSPACE EXPERIENCE */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* COLUMN 1: CONVERSATION HISTORY (DESKTOP - 3 COLS) */}
        <div className="hidden lg:block lg:col-span-3 bg-surface border border-border/80 rounded-sm p-4 flex flex-col justify-between select-none">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
                Audit History
              </span>
              <button
                onClick={handleNewChat}
                className="text-[9px] font-sans font-bold hover:underline uppercase text-primary flex items-center gap-0.5 cursor-pointer"
              >
                + New Chat
              </button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xs transition-all border text-xs flex flex-col gap-1 cursor-pointer",
                    item.active
                      ? "bg-surface-elevated border-primary text-foreground font-semibold shadow-xs"
                      : "border-transparent text-foreground-secondary hover:bg-surface-elevated/40 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[9px] font-mono text-foreground-muted">{item.timestamp}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-foreground-muted border-t border-border/40 pt-4 mt-2 flex items-center gap-1.5">
            <FolderMinus className="h-4 w-4 text-foreground-secondary" />
            <span>Chat logs stored locally.</span>
          </div>
        </div>

        {/* COLUMN 2: AI CONVERSATION WORKSPACE (50% / 6 COLS) */}
        <div className="col-span-12 lg:col-span-6 bg-surface border border-border/80 rounded-sm flex flex-col overflow-hidden relative">
          
          {/* Scrollable Message stream area */}
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-5 scrollbar-none min-h-0">
            {messages.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] select-none",
                    isAssistant ? "self-start items-start" : "self-end items-end ml-auto"
                  )}
                >
                  {/* Sender title label */}
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider text-foreground-muted mb-1 px-1">
                    {isAssistant ? "ArthDrishti AI Advisor" : "Rahul Chahar (You)"}
                  </span>

                  {/* Bubble wrapper */}
                  <div
                    className={cn(
                      "p-4 rounded-sm border text-xs font-sans leading-relaxed shadow-xs w-full",
                      isAssistant
                        ? "bg-surface-elevated/35 border-border/80 text-foreground"
                        : "bg-primary text-primary-foreground border-primary"
                    )}
                  >
                    {/* Text layout */}
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Rich Response components block */}
                    {isAssistant && msg.richData && (
                      <div className="mt-4 pt-3.5 border-t border-border/50 space-y-4 text-foreground">
                        
                        {/* 1. Metrics Card Grid */}
                        {msg.richData.metrics && (
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            {msg.richData.metrics.map((m, idx) => (
                              <div key={idx} className="bg-surface-elevated/65 border border-border/50 p-2.5 rounded-xs flex flex-col justify-between">
                                <span className="text-[8px] font-sans text-foreground-muted block uppercase tracking-wider">{m.label}</span>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="font-extrabold text-foreground">{m.value}</span>
                                  {m.wasValue && <span className="text-[9px] text-foreground-muted line-through">{m.wasValue}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. Embedded Chart */}
                        {msg.richData.chartType && msg.richData.chartType !== "none" && (
                          <ChatChart type={msg.richData.chartType} data={msg.richData.chartData} />
                        )}

                        {/* 3. Risk Factors list */}
                        {msg.richData.riskFactors && (
                          <div className="border border-border/60 rounded-sm overflow-hidden bg-surface-elevated/25">
                            <div className="grid grid-cols-12 bg-surface-elevated/60 text-[8px] font-bold text-foreground-muted uppercase p-1.5 border-b border-border/40 font-sans tracking-widest">
                              <span className="col-span-5">Risk Factor</span>
                              <span className="col-span-4 text-right">Value</span>
                              <span className="col-span-3 text-right">Impact</span>
                            </div>
                            {msg.richData.riskFactors.map((r, idx) => (
                              <div key={idx} className="grid grid-cols-12 text-[10.5px] p-2 border-b border-border/20 last:border-b-0 font-sans">
                                <span className="col-span-5 font-semibold text-foreground">{r.name}</span>
                                <span className="col-span-4 text-right text-foreground-secondary font-mono">{r.current} <span className="text-[8.5px] text-foreground-muted">({r.target})</span></span>
                                <span className={cn("col-span-3 text-right font-bold font-mono", r.isRisk ? "text-critical" : "text-positive")}>
                                  {r.impact}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 4. Transactions List */}
                        {msg.richData.transactions && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">Audited Transactions</span>
                            {msg.richData.transactions.map((tx, idx) => (
                              <div key={idx} className="bg-surface-elevated/45 border border-border p-3 rounded-xs flex justify-between items-center text-xs">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-foreground block">{tx.name}</span>
                                  <span className="text-[9px] text-foreground-muted block">{tx.date} • {tx.category}</span>
                                </div>
                                <span className="font-mono font-extrabold text-critical">
                                  -₹{tx.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 5. Recommendations List */}
                        {msg.richData.recommendations && (
                          <div className="space-y-1.5 font-sans">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-foreground-muted block">Advisor Recommendations</span>
                            <ul className="list-disc pl-4 space-y-1 text-foreground-secondary text-[11px] leading-relaxed">
                              {msg.richData.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 6. Action Call to Actions */}
                        {msg.richData.ctaText && msg.richData.ctaHref && (
                          <div className="pt-2 border-t border-border/30">
                            <Button
                              onClick={() => {
                                toast.info(`Redirecting to simulator page...`);
                                router.push(msg.richData?.ctaHref ?? "/simulator");
                              }}
                              className="w-full text-[10px] font-sans font-extrabold py-2 uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {msg.richData.ctaText} <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
                            </Button>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp label */}
                  <span className="text-[8px] font-mono text-foreground-muted mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Simulated typing loader state */}
            {isLoading && (
              <div className="flex flex-col max-w-[85%] self-start items-start select-none">
                <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider text-foreground-muted mb-1 px-1">
                  Advisor is analyzing...
                </span>
                <div className="p-4 rounded-sm border border-border/80 bg-surface-elevated/35 text-xs text-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}

            {/* Error banner state */}
            {isError && (
              <div className="flex flex-col max-w-full self-center select-none text-center py-2 bg-critical/10 border border-critical/20 p-4 rounded-sm">
                <AlertTriangle className="h-6 w-6 text-critical mx-auto mb-2 animate-bounce" />
                <span className="text-xs font-bold text-critical font-sans">Attribution request failed</span>
                <p className="text-[10px] text-foreground-secondary mt-1 font-sans">
                  The network experienced timeout parameters. Please try again.
                </p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* COMPOSER INPUT DRAWER (BOTTOM AREA) */}
          <div className="border-t border-border/80 bg-surface-elevated/45 p-4.5 space-y-4">
            
            {/* Pill-shaped prompt buttons */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1.5 border-b border-border/30 select-none">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(p.text, p.key)}
                  className="shrink-0 bg-surface border border-border hover:border-primary/80 transition-all px-3 py-1.5 rounded-sm text-[10px] text-foreground-secondary hover:text-foreground font-semibold cursor-pointer"
                >
                  {p.text}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
              
              {/* Attach Context trigger switch */}
              <button
                type="button"
                onClick={() => {
                  setAttachContext(!attachContext);
                  toast.info(attachContext ? "Detached financial profile context from chat composer." : "Attached real-time financial diagnostic logs to composer.");
                }}
                className={cn(
                  "p-2 rounded-xs border transition-all cursor-pointer",
                  attachContext
                    ? "bg-primary/10 text-primary border-primary/25"
                    : "bg-surface text-foreground-secondary border-border"
                )}
                title={attachContext ? "Detach context logs" : "Attach profile context"}
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask advisor (e.g. Can I afford another loan?)"
                className="flex-1 bg-surface border border-border text-xs rounded-sm py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans font-medium"
              />

              <Button
                type="submit"
                size="sm"
                className="text-[10px] uppercase font-bold py-2.5 px-3 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* RESTRICTED DISCLAIMER WARNING */}
            <p className="text-[9.5px] text-foreground-muted leading-relaxed font-sans text-center select-none pt-1">
              ✦ ArthDrishti AI Advisor provides informational assessments derived from automated models. Output does not constitute guaranteed or registered financial advice.
            </p>
          </div>

        </div>

        {/* COLUMN 3: FINANCIAL CONTEXT PANEL (DESKTOP - 3 COLS) */}
        <div className="hidden lg:block lg:col-span-3 bg-surface border border-border/80 rounded-sm p-4 flex flex-col justify-between select-none">
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted flex items-center gap-1">
                Active Client Profile
              </span>
            </div>

            {/* Stats list linking to pages */}
            <div className="space-y-3.5 font-sans">
              {[
                { label: "Financial Health", value: "82/100", href: "/financial-health", status: "positive" },
                { label: "Default Risk Rating", value: "18% (Low)", href: "/credit-risk", status: "positive" },
                { label: "Pending Fraud Alerts", value: "2 Alerts", href: "/credit-risk", status: "critical" },
                { label: "Monthly Savings Rate", value: "24.8%", href: "/explainable-ai", status: "positive" },
                { label: "30-Day Liquidity Forecast", value: "Positive", href: "/cash-flow", status: "positive" }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    toast.info(`Redirecting client profile to ${stat.label} page...`);
                    router.push(stat.href);
                  }}
                  className="bg-surface-elevated/40 hover:bg-surface-elevated transition-all border border-border/60 p-3 rounded-xs flex justify-between items-center text-xs cursor-pointer group"
                >
                  <span className="font-semibold text-foreground-secondary group-hover:text-primary transition-all">
                    {stat.label}
                  </span>
                  <span className={cn(
                    "font-mono font-bold text-[11px]",
                    stat.status === "critical" ? "text-critical" : "text-positive"
                  )}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Top Risk Factor details */}
            <div className="bg-surface-elevated/35 border border-border/60 p-3 rounded-xs space-y-2">
              <span className="text-[9.5px] font-bold text-foreground-muted block uppercase tracking-wider">Top Risk Factor</span>
              <div className="flex justify-between items-start text-xs">
                <span className="font-semibold text-foreground">Debt-to-Income (42%)</span>
                <span className="text-[9.5px] font-mono text-critical font-bold">+24% Risk</span>
              </div>
              <p className="text-[10px] text-foreground-secondary leading-relaxed">
                Repay credit card balances below ₹60,000 immediately to reduce this DTI factor.
              </p>
            </div>

            {/* Top Recommendation details */}
            <div className="bg-surface-elevated/35 border border-border/60 p-3 rounded-xs space-y-2">
              <span className="text-[9.5px] font-bold text-foreground-muted block uppercase tracking-wider">Top Recommendation</span>
              <div className="flex justify-between items-start text-xs">
                <span className="font-semibold text-foreground">Build Reserves Buffer</span>
                <span className="text-[9.5px] font-mono text-positive font-bold">+15 Health</span>
              </div>
              <p className="text-[10px] text-foreground-secondary leading-relaxed">
                Establish a cash sweep buffer equivalent to 6 months of outgoings.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xs flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-foreground block">Session Audited</span>
              <span className="text-[9.5px] text-foreground-secondary block">Credentials validated with regional score registries.</span>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE HISTORY DRAWER SHEET */}
      <Sheet
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        side="left"
        className="w-full max-w-xs font-sans text-xs select-none"
      >
        <div className="space-y-4 py-3">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Chat Sessions list</span>
            <button
              onClick={() => {
                handleNewChat();
                setIsHistoryOpen(false);
              }}
              className="text-[9px] font-bold hover:underline text-primary uppercase cursor-pointer"
            >
              + New Chat
            </button>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectHistory(item.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xs transition-all border text-xs flex flex-col gap-1 cursor-pointer",
                  item.active
                    ? "bg-surface-elevated border-primary text-foreground font-semibold"
                    : "border-transparent text-foreground-secondary hover:bg-surface-elevated/40"
                )}
              >
                <span>{item.title}</span>
                <span className="text-[9px] font-mono text-foreground-muted">{item.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* MOBILE CONTEXT DRAWER SHEET */}
      <Sheet
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        title="Financial Context Logs"
        side="right"
        className="w-full max-w-xs font-sans text-xs select-none"
      >
        <div className="space-y-5 py-3">
          <div className="space-y-3">
            <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2.5">Active Client Metrics</span>
            <div className="space-y-3">
              {[
                { label: "Financial Health", value: "82/100", href: "/financial-health", status: "positive" },
                { label: "Default Risk Rating", value: "18% (Low)", href: "/credit-risk", status: "positive" },
                { label: "Pending Fraud Alerts", value: "2 Alerts", href: "/credit-risk", status: "critical" },
                { label: "Monthly Savings Rate", value: "24.8%", href: "/explainable-ai", status: "positive" },
                { label: "30-Day Liquidity Forecast", value: "Positive", href: "/cash-flow", status: "positive" }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    toast.info(`Redirecting client profile to ${stat.label} page...`);
                    setIsContextOpen(false);
                    router.push(stat.href);
                  }}
                  className="bg-surface-elevated/40 hover:bg-surface-elevated transition-all border border-border/60 p-3 rounded-xs flex justify-between items-center cursor-pointer"
                >
                  <span className="font-semibold text-foreground-secondary">
                    {stat.label}
                  </span>
                  <span className={cn(
                    "font-mono font-bold text-[11px]",
                    stat.status === "critical" ? "text-critical" : "text-positive"
                  )}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-elevated/35 border border-border/60 p-3 rounded-xs space-y-2">
            <span className="text-[9.5px] font-bold text-foreground-muted block uppercase tracking-wider">Top Risk Factor</span>
            <div className="flex justify-between items-start text-xs">
              <span className="font-semibold text-foreground">Debt-to-Income (42%)</span>
              <span className="text-[9.5px] font-mono text-critical font-bold">+24% Risk</span>
            </div>
            <p className="text-[10px] text-foreground-secondary leading-relaxed">
              Repay credit card balances below ₹60,000 immediately to reduce this DTI factor.
            </p>
          </div>

          <div className="bg-surface-elevated/35 border border-border/60 p-3 rounded-xs space-y-2">
            <span className="text-[9.5px] font-bold text-foreground-muted block uppercase tracking-wider">Top Recommendation</span>
            <div className="flex justify-between items-start text-xs">
              <span className="font-semibold text-foreground">Build Reserves Buffer</span>
              <span className="text-[9.5px] font-mono text-positive font-bold">+15 Health</span>
            </div>
            <p className="text-[10px] text-foreground-secondary leading-relaxed">
              Establish a cash sweep buffer equivalent to 6 months of outgoings.
            </p>
          </div>
        </div>
      </Sheet>

    </PageContainer>
  );
}
