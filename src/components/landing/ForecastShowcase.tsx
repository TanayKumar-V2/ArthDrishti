"use client";

import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ReferenceLine
} from "recharts";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Info,
  CalendarCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { FinancialValue } from "@/components/ui/ValueDisplay";
import { Skeleton } from "@/components/ui/FeedbackState";
import { toast } from "sonner";

interface DataPoint {
  label: string;
  historical?: number;
  projected?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  stroke?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated/95 backdrop-blur-md border border-border/80 p-3 rounded-sm shadow-xl font-sans text-xs space-y-1.5 min-w-[160px] select-none">
        <span className="font-bold text-foreground-muted uppercase tracking-widest text-[9px] block border-b border-border/30 pb-1 mb-1">
          {label}
        </span>
        {payload.map((p) => {
          if (!p.name || p.name.toLowerCase().includes("confidence") || p.value === undefined) return null;
          return (
            <div key={p.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
                <span className="text-foreground-secondary text-[11px] font-sans">{p.name}</span>
              </div>
              <span className="font-mono font-bold text-foreground">
                ₹{p.value.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ForecastShowcase() {
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState<"7D" | "30D" | "6M">("30D");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Mock data subsets
  const data7D: DataPoint[] = [
    { label: "Mon", historical: 42000 },
    { label: "Tue", historical: 41500 },
    { label: "Wed", historical: 41200 },
    { label: "Thu", historical: 45000 }, // Salary credit
    { label: "Fri", projected: 44200, confidenceLower: 43500, confidenceUpper: 44900 },
    { label: "Sat", projected: 43000, confidenceLower: 42000, confidenceUpper: 44000 }, // Rent debit
    { label: "Sun", projected: 42800, confidenceLower: 41200, confidenceUpper: 44400 },
  ];

  const data30D: DataPoint[] = [
    { label: "Day 1", historical: 45000 },
    { label: "Day 5", historical: 43200 },
    { label: "Day 10", historical: 41000 },
    { label: "Day 15", historical: 47800 }, // Income Credit
    { label: "Day 18", projected: 46200, confidenceLower: 45000, confidenceUpper: 47400 },
    { label: "Day 20", projected: 43200, confidenceLower: 41800, confidenceUpper: 44600 }, // EMI Debit
    { label: "Day 25", projected: 40500, confidenceLower: 38200, confidenceUpper: 42800 }, // Potential low warning
    { label: "Day 30", projected: 42200, confidenceLower: 39500, confidenceUpper: 44900 },
  ];

  const data6M: DataPoint[] = [
    { label: "Month 1", historical: 38000 },
    { label: "Month 2", historical: 42000 },
    { label: "Month 3", historical: 41000 },
    { label: "Month 4", projected: 45000, confidenceLower: 43000, confidenceUpper: 47000 },
    { label: "Month 5", projected: 48000, confidenceLower: 45000, confidenceUpper: 51000 },
    { label: "Month 6", projected: 43000, confidenceLower: 38000, confidenceUpper: 48000 }, // Tax outlier cycle
  ];

  const chartData = {
    "7D": data7D,
    "30D": data30D,
    "6M": data6M,
  }[activeRange];

  const summary = {
    "7D": { In: 45000, Out: 43000, Saved: 2000, Low: 41200 },
    "30D": { In: 187000, Out: 135000, Saved: 52000, Low: 38200 },
    "6M": { In: 1240000, Out: 890000, Saved: 350000, Low: 38000 },
  }[activeRange];

  const events = {
    "7D": [
      { day: "Thu", name: "Salary Credit", type: "inflow", val: 5000 },
      { day: "Sat", name: "Lease Rent", type: "outflow", val: 1200 },
    ],
    "30D": [
      { day: "Day 15", name: "Invoice Influx", type: "inflow", val: 7800 },
      { day: "Day 20", name: "Collateral EMI", type: "outflow", val: 3200 },
      { day: "Day 25", name: "Low Balance Alert", type: "warning", val: 0 },
    ],
    "6M": [
      { day: "Month 5", name: "Contract Renewal", type: "inflow", val: 35000 },
      { day: "Month 6", name: "Tax Audit Settlement", type: "outflow", val: 8000 },
    ],
  }[activeRange];

  return (
    <section id="solutions" className="py-24 bg-surface border-y border-border select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-forecast bg-forecast/10 border border-forecast/20 px-2 py-0.5 rounded-xs">
                Liquidity Forecaster
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground leading-snug">
              See your financial future <br className="hidden sm:inline" />
              before it happens.
            </h2>
            <p className="text-sm text-foreground-secondary font-sans max-w-xl leading-relaxed">
              ArthDrishti maps historical spending vectors against scheduled events to project cash runways with clear confidence bounds.
            </p>
          </div>
          
          {/* Time range controller */}
          <div className="flex items-center gap-1.5 bg-surface-elevated border border-border p-1 rounded-sm flex-shrink-0 self-start md:self-auto">
            {(["7D", "30D", "6M"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setActiveRange(r);
                  toast.info(`Switched cash forecast range to ${r}`);
                }}
                className={`px-4.5 py-1.5 rounded-xs text-xs font-sans font-semibold transition-all cursor-pointer ${
                  activeRange === r 
                    ? "bg-primary text-white shadow-xs" 
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                }`}
              >
                {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "6 Months"}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Forecast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Chart Card (8 Cols) */}
          <Card className="lg:col-span-8 overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-4">
              <div>
                <CardTitle className="text-base sm:text-lg">Predictive Liquidity Envelope</CardTitle>
                <CardDescription>
                  Dashed line shows expected balance; background bands show standard deviation envelope.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-80 w-full min-h-[300px] pt-6">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--forecast)" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="var(--forecast)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis dataKey="label" stroke="var(--foreground-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--foreground-muted)" fontSize={11} tickLine={false} domain={["dataMin - 5000", "dataMax + 5000"]} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    
                    {/* Confidence upper/lower limits area */}
                    <Area 
                      type="monotone" 
                      dataKey="confidenceUpper" 
                      stroke="transparent"
                      fill="url(#colorConfidence)" 
                      connectNulls
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidenceLower" 
                      stroke="transparent"
                      fill="var(--background)" // mask lower
                      fillOpacity={1}
                      connectNulls
                    />
                    
                    {/* Today reference divider line (Midpoint of arrays basically) */}
                    <ReferenceLine x={activeRange === "7D" ? "Thu" : activeRange === "30D" ? "Day 15" : "Month 3"} stroke="var(--border-strong)" strokeDasharray="3 3" label={{ value: "Today", fill: "var(--foreground-secondary)", position: "top", fontSize: 10 }} />

                    {/* Historical Cash Curve */}
                    <Area 
                      type="monotone" 
                      dataKey="historical" 
                      name="Historical Balance"
                      stroke="var(--primary)" 
                      strokeWidth={2.5}
                      fill="transparent"
                      connectNulls
                    />

                    {/* Forecast Cash Curve */}
                    <Area 
                      type="monotone" 
                      dataKey="projected" 
                      name="Projected Runway"
                      stroke="var(--forecast)" 
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="transparent"
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full rounded-sm" />
              )}
            </CardContent>
          </Card>

          {/* Side stats and Event logs (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Summary metrics cells */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-elevated/80 border border-border/80 p-4 rounded-sm">
                <span className="text-[10px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                  Expected Inflow
                </span>
                <FinancialValue value={summary.In} currency="INR" notation="compact" className="text-lg font-bold font-mono" />
              </div>
              <div className="bg-surface-elevated/80 border border-border/80 p-4 rounded-sm">
                <span className="text-[10px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                  Projected Outflow
                </span>
                <FinancialValue value={summary.Out} currency="INR" notation="compact" className="text-lg font-bold font-mono" />
              </div>
              <div className="bg-surface-elevated/80 border border-border/80 p-4 rounded-sm">
                <span className="text-[10px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                  Net Savings
                </span>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-positive" />
                  <FinancialValue value={summary.Saved} currency="INR" notation="compact" className="text-lg font-bold text-positive font-mono" />
                </div>
              </div>
              <div className="bg-surface-elevated/80 border border-border/80 p-4 rounded-sm">
                <span className="text-[10px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                  Expected Low Point
                </span>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-warning" />
                  <FinancialValue value={summary.Low} currency="INR" notation="compact" className="text-lg font-bold text-warning font-mono" />
                </div>
              </div>
            </div>

            {/* In-Line Scheduled events alerts */}
            <div className="flex-1 bg-surface-elevated/40 border border-border rounded-md p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-sans font-bold text-foreground uppercase tracking-wider">
                    Calendar Event Logs
                  </span>
                </div>

                <div className="space-y-3">
                  {events.map((evt, idx) => (
                    <div key={`${evt.name}-${idx}`} className="flex items-start justify-between text-xs font-sans">
                      <div className="flex gap-2">
                        {evt.type === "inflow" && (
                          <div className="h-5 w-5 rounded-xs bg-positive/10 border border-positive/20 flex items-center justify-center text-positive mt-0.5">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {evt.type === "outflow" && (
                          <div className="h-5 w-5 rounded-xs bg-forecast/10 border border-forecast/20 flex items-center justify-center text-forecast mt-0.5">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {evt.type === "warning" && (
                          <div className="h-5 w-5 rounded-xs bg-critical/10 border border-critical/20 flex items-center justify-center text-critical mt-0.5 animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-foreground block">{evt.name}</span>
                          <span className="text-[10px] text-foreground-muted">{evt.day}</span>
                        </div>
                      </div>
                      {evt.val > 0 && (
                        <FinancialValue value={evt.val} currency="INR" notation="compact" className="font-mono text-foreground font-semibold" />
                      )}
                      {evt.type === "warning" && (
                        <span className="text-[10px] font-sans font-bold text-critical uppercase tracking-wider animate-pulse">
                          Warning active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-forecast/5 border border-forecast/20 rounded-sm flex items-start gap-2 text-[11px] text-foreground-secondary leading-relaxed mt-4">
                <Info className="h-3.5 w-3.5 text-forecast flex-shrink-0 mt-0.5" />
                <span>
                  Predictions sync with recurring Plaid APIs daily. Click <strong>Sync Ledger</strong> in dashboard to refresh bounds manually.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
export default ForecastShowcase;
