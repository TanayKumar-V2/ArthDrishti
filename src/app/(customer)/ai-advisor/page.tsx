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
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import type { RichResponse } from "@/lib/advisor_data";
import { advisorApi, getStoredUser, authApi } from "@/lib/api";

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
    const textColor = isDark ? "#849087" : "#64716A";

    if (type === "bar") {
      const barData = data as { categories: string[]; values: number[] };
      option = {
        grid: { top: 10, right: 15, bottom: 20, left: 80 },
        xAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
        yAxis: { type: "category", data: [...barData.categories].reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: textColor, fontSize: 10 } },
        series: [
          {
            type: "bar",
            data: [...barData.values].reverse(),
            itemStyle: {
              color: (params: unknown) => {
                const p = params as { value: number };
                return p.value >= 0 ? "#AD493D" : "#286A4A";
              },
              borderRadius: 3
            },
            label: { show: true, position: "right", formatter: "{c}%", fontSize: 10 }
          }
        ]
      };
    } else if (type === "line") {
      const lineData = data as { timeline: string[]; values: number[] };
      option = {
        grid: { top: 15, right: 15, bottom: 20, left: 45 },
        xAxis: { type: "category", data: lineData.timeline, axisLabel: { color: textColor, fontSize: 10 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
        series: [
          {
            type: "line",
            data: lineData.values,
            smooth: true,
            itemStyle: { color: "#176B55" },
            lineStyle: { width: 1.5 },
            areaStyle: { color: "rgba(23, 107, 85, 0.10)" }
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
                  [0.3, "#AD493D"],
                  [0.7, "#95651A"],
                  [1, "#286A4A"]
                ]
              }
            },
            pointer: {
              icon: "path://M12.8,0.7l12,20c0.4,0.7,0.2,1.5-0.4,1.9c-0.7,0.4-1.5,0.2-1.9-0.4L12,4.3L1.5,21.7c-0.4,0.7-1.2,0.9-1.9,0.5C-1,21.8-1.2,21-0.8,20.3l12-20C11.5,0.1,12.1,0.1,12.8,0.7z",
              length: "75%",
              width: 4,
              offsetCenter: [0, "5%"],
              itemStyle: { color: isDark ? "#a7b2aa" : "#475569" }
            },
            axisTick: { length: 4, lineStyle: { color: "auto", width: 1 } },
            splitLine: { length: 8, lineStyle: { color: "auto", width: 2 } },
            axisLabel: { color: textColor, fontSize: 10, distance: -35 },
            title: { offsetCenter: [0, "-20%"], fontSize: 10, color: textColor },
            detail: {
              fontSize: 14,
              offsetCenter: [0, "0%"],
              valueAnimation: true,
              formatter: "{value}",
              color: isDark ? "#edf1eb" : "#1B2622",
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

  return <div ref={chartRef} className="mt-4 h-52 w-full rounded-2xl border border-border/70 bg-surface p-2" />;
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function AiAdvisorPage() {
  const router = useRouter();

  // Dialog / Chat history list
  const [history, setHistory] = useState<Array<{ id: string; title: string; timestamp: string; active: boolean }>>([]);

  // User profile
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Message stream
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = getStoredUser();
    const name = stored?.full_name ? stored.full_name.split(" ")[0].toUpperCase() : "THERE";
    return [
      {
        id: "m_welcome",
        sender: "assistant",
        timestamp: "10:14 AM",
        text: `Hello, ${name}. Ask me about the transaction data and analysis available in your account.`
      }
    ];
  });

  // Form input composer values
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [attachContext, setAttachContext] = useState(true);
  const [profileMetrics, setProfileMetrics] = useState<Record<string, unknown> | null>(null);

  // Mobile drawer sheets toggles
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);

  // Keep chat scrolling inside its message pane so it cannot move the whole page.
  const chatLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    const chatLog = chatLogRef.current;
    if (!chatLog) return;
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Hydrate user financial metrics from backend
  useEffect(() => {
    let isMounted = true;
    authApi
      .getCurrentUser()
      .then((user) => {
        if (isMounted && user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {});

    advisorApi
      .getContext()
      .then((data) => {
        if (isMounted && data) {
          setProfileMetrics(data);
        }
      })
      .catch(() => setProfileMetrics(null));
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle preset prompt click
  const handlePromptSelect = useCallback(
    async (promptText: string, _promptKey: string) => {
      const userMsgId = `user_${Date.now()}`;
      const userMsg: Message = {
        id: userMsgId,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: promptText,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setIsError(false);

      try {
        const historyPayload = messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text }));
        const res = await advisorApi.chat(promptText, historyPayload);
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: res.response,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (cause) {
        setIsError(true);
        setMessages((prev) => [...prev, {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: cause instanceof Error ? cause.message : "Unable to generate a response right now. Please try again.",
        }]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  // Handle composer submission
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const query = inputValue.trim();
      setInputValue("");

      const userMsg: Message = {
        id: `user_${Date.now()}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: query,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setIsError(false);

      try {
        const historyPayload = messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text }));
        const res = await advisorApi.chat(query, historyPayload);
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: res.response,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (cause) {
        setIsError(true);
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: cause instanceof Error ? cause.message : "Unable to generate a response right now. Please try again.",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, messages]
  );

  // Load selected historical chat topic
  const handleSelectHistory = useCallback((id: string) => {
    setHistory((prev) => prev.map((h) => ({ ...h, active: h.id === id })));
    setIsHistoryOpen(false);
    setMessages([{ id: `history_${id}`, sender: "assistant", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: "Saved conversations are not available in this demo yet." }]);
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
    <PageContainer className="flex h-full min-h-0 flex-col gap-4 p-4 lg:p-6">
      
      {/* MOBILE OPTIMIZED TABS TOOLBAR */}
      <div className="mb-1 flex items-center justify-between rounded-2xl border border-border/70 bg-surface p-2.5 select-none lg:hidden">
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
      <div className="grid min-h-0 flex-1 grid-cols-12 grid-rows-[minmax(0,1fr)] gap-4 overflow-hidden xl:gap-5">
        
        {/* COLUMN 1: CONVERSATION HISTORY (DESKTOP - 3 COLS) */}
        <div className="hidden min-h-0 flex-col justify-between rounded-[1.6rem] border border-border/70 bg-surface p-4 select-none lg:col-span-3 lg:flex xl:p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                Audit History
              </span>
              <button
                onClick={handleNewChat}
                className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
              >
                + New Chat
              </button>
            </div>

            <div className="max-h-[min(65vh,680px)] space-y-2 overflow-y-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={cn(
                    "w-full rounded-xl border p-3.5 text-left text-[13px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col gap-1.5 cursor-pointer",
                    item.active
                      ? "bg-surface-elevated border-primary text-foreground font-semibold shadow-xs"
                      : "border-transparent text-foreground-secondary hover:bg-surface-elevated/40 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[10px] font-mono text-foreground-muted">{item.timestamp}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-4 text-[11px] text-foreground-muted">
            <FolderMinus className="h-4 w-4 text-foreground-secondary" />
            <span>Chat logs stored locally.</span>
          </div>
        </div>

        {/* COLUMN 2: AI CONVERSATION WORKSPACE (50% / 6 COLS) */}
        <div className="relative col-span-12 flex min-h-0 flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-surface lg:col-span-9">
          
          {/* Engine & Status Banner */}
          <div className="flex items-center justify-between gap-4 border-b border-border/70 bg-surface px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 font-sans font-semibold text-foreground-secondary">
              <Brain className="h-4 w-4 text-primary" />
              <span>Financial Risk Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsContextOpen(true)} className="hidden items-center gap-2 rounded-full border border-border/70 px-3.5 py-2 text-[11px] font-medium text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground lg:inline-flex">Profile context<ChevronRight className="h-3.5 w-3.5 text-primary" /></button>
            </div>
          </div>

          {/* Scrollable Message stream area */}
          <div ref={chatLogRef} className="flex-1 min-h-0 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-7">
            {messages.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex max-w-[92%] flex-col sm:max-w-[82%]",
                    isAssistant ? "self-start items-start" : "self-end items-end ml-auto"
                  )}
                >
                  {/* Sender title label */}
                  <span className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                    {isAssistant ? "ArthDrishti AI Advisor" : `${currentUser?.full_name || "You"} (You)`}
                  </span>

                  {/* Bubble wrapper */}
                  <div
                    className={cn(
                      "w-full rounded-2xl border p-4 text-[13px] leading-6 sm:p-5 sm:text-[14px]",
                      isAssistant
                        ? "bg-surface-elevated/55 border-border/70 text-foreground"
                        : "bg-primary text-primary-foreground border-primary"
                    )}
                  >
                    {/* Text layout */}
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Rich Response components block */}
                    {isAssistant && msg.richData && (
                      <div className="mt-5 space-y-5 border-t border-border/60 pt-5 text-foreground">
                        
                        {/* 1. Metrics Card Grid */}
                        {msg.richData.metrics && (
                          <div className="grid grid-cols-2 gap-2.5 font-mono sm:grid-cols-3">
                            {msg.richData.metrics.map((m, idx) => (
                              <div key={idx} className="flex min-h-20 flex-col justify-between rounded-xl border border-border/60 bg-surface p-3">
                                <span className="block text-[10px] font-sans font-medium uppercase tracking-[0.1em] text-foreground-muted">{m.label}</span>
                                <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                                  <span className="text-[14px] font-semibold text-foreground">{m.value}</span>
                                  {m.wasValue && <span className="text-[10px] text-foreground-muted line-through">{m.wasValue}</span>}
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
                            <div className="grid grid-cols-12 bg-surface-elevated/60 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                              <span className="col-span-5">Risk Factor</span>
                              <span className="col-span-4 text-right">Value</span>
                              <span className="col-span-3 text-right">Impact</span>
                            </div>
                            {msg.richData.riskFactors.map((r, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-2 border-b border-border/50 px-3 py-3 text-[12px] last:border-b-0">
                                <span className="col-span-5 font-semibold text-foreground">{r.name}</span>
                                <span className="col-span-4 text-right font-mono text-foreground-secondary">{r.current} <span className="text-[10px] text-foreground-muted">({r.target})</span></span>
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
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-foreground-muted">Audited Transactions</span>
                            {msg.richData.transactions.map((tx, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface-elevated/50 p-3.5 text-[12px]">
                                <div className="space-y-0.5">
                                  <span className="text-[13px] font-semibold text-foreground block">{tx.name}</span>
                                  <span className="text-[9px] text-foreground-muted block">{tx.date} • {tx.category}</span>
                                </div>
                                <span className="shrink-0 font-mono text-[13px] font-semibold text-critical">
                                  -₹{tx.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 5. Recommendations List */}
                        {msg.richData.recommendations && (
                          <div className="space-y-2 font-sans">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">Advisor recommendations</span>
                            <ul className="list-disc space-y-2 pl-5 text-[12px] leading-5 text-foreground-secondary">
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
                              className="group w-full rounded-full py-2.5 text-[12px] font-semibold"
                            >
                              {msg.richData.ctaText}<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/15"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span>
                            </Button>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp label */}
                  <span className="mt-1 px-1 text-[10px] font-mono text-foreground-muted">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Simulated typing loader state */}
            {isLoading && (
              <div className="flex flex-col max-w-[85%] self-start items-start select-none">
                <span className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                  Advisor is analyzing...
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface-elevated/55 p-4 text-[13px] text-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            )}

            {/* Error banner state */}
            {isError && (
              <div className="flex max-w-full flex-col self-center rounded-2xl border border-critical/20 bg-critical/5 p-5 text-center">
                <AlertTriangle className="h-6 w-6 text-critical mx-auto mb-2" />
                <span className="text-[13px] font-semibold text-critical">Attribution request failed</span>
                <p className="mt-1 text-[12px] text-foreground-secondary">
                  The network experienced timeout parameters. Please try again.
                </p>
              </div>
            )}

          </div>

          {/* COMPOSER INPUT DRAWER (BOTTOM AREA) */}
          <div className="shrink-0 space-y-3 border-t border-border/70 bg-surface-elevated/45 p-4 sm:p-5">

            {/* Pill-shaped prompt buttons */}
            <div className="flex gap-2 overflow-x-auto border-b border-border/50 pb-2 select-none scrollbar-none">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(p.text, p.key)}
                  className="shrink-0 rounded-full border border-border/70 bg-surface px-4 py-2 text-[11px] font-medium text-foreground-secondary transition-colors hover:border-primary/40 hover:bg-surface-hover hover:text-foreground cursor-pointer"
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
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all cursor-pointer",
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
                className="h-11 flex-1 rounded-xl border border-border/80 bg-surface px-4 text-[13px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans"
              />

              <Button
                type="submit"
                size="sm"
                className="h-11 w-11 shrink-0 rounded-xl cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* RESTRICTED DISCLAIMER WARNING */}
            <p className="pt-1 text-center text-[10px] leading-5 text-foreground-muted font-sans select-none">
              ✦ ArthDrishti AI Advisor provides informational assessments derived from automated models. Output does not constitute guaranteed or registered financial advice.
            </p>
          </div>

        </div>

        {/* COLUMN 3: FINANCIAL CONTEXT PANEL (DESKTOP - 3 COLS) */}
        <div className="hidden">
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted flex items-center gap-1">
                Active Client Profile
              </span>
            </div>

            {/* Stats list linking to pages */}

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
        className="w-full max-w-sm font-sans text-[13px] select-none"
      >
        <div className="space-y-4 py-3">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">Chat sessions</span>
            <button
              onClick={() => {
                handleNewChat();
                setIsHistoryOpen(false);
              }}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
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
                  "w-full rounded-xl border p-3.5 text-left text-[13px] transition-all flex flex-col gap-1.5 cursor-pointer",
                  item.active
                    ? "bg-surface-elevated border-primary text-foreground font-semibold"
                    : "border-transparent text-foreground-secondary hover:bg-surface-elevated/40"
                )}
              >
                <span>{item.title}</span>
                <span className="text-[10px] font-mono text-foreground-muted">{item.timestamp}</span>
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
        className="w-full max-w-sm font-sans text-[13px] select-none"
      >
        <div className="space-y-5 py-3">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-[0.12em] block border-b border-border/50 pb-3">Active Client Metrics</span>
            <div className="space-y-3">
              {[
                { label: "Financial Health", value: profileMetrics?.financial_health_score != null ? `${profileMetrics.financial_health_score}/100` : "Unavailable", href: "/financial-health" },
                { label: "Default Risk Rating", value: profileMetrics?.default_probability_pct != null ? `${profileMetrics.default_probability_pct}% (${profileMetrics.credit_risk_band})` : "Unavailable", href: "/credit-risk" },
                { label: "Pending Fraud Alerts", value: profileMetrics?.pending_fraud_alerts != null ? `${profileMetrics.pending_fraud_alerts} alerts` : "Unavailable", href: "/fraud" },
                { label: "Monthly Savings Rate", value: profileMetrics?.savings_rate_pct != null ? `${profileMetrics.savings_rate_pct}%` : "Unavailable", href: "/explainable-ai" },
                { label: "Emergency Cushion", value: profileMetrics?.emergency_fund_months != null ? `${profileMetrics.emergency_fund_months} months` : "Unavailable", href: "/cash-flow" }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    toast.info(`Redirecting client profile to ${stat.label} page...`);
                    setIsContextOpen(false);
                    router.push(stat.href);
                  }}
                  className="bg-surface-elevated/40 hover:bg-surface-elevated transition-colors border border-border/60 p-3.5 rounded-xl flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-foreground-secondary">
                    {stat.label}
                  </span>
                  <span className="font-mono font-semibold text-[12px] text-foreground">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>


        </div>
      </Sheet>

    </PageContainer>
  );
}
