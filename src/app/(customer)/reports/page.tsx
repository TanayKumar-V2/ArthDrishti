"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Database,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import { MOCK_REPORTS, ReportItem } from "@/lib/reports_data";

export default function ReportsCenterPage() {
  const router = useRouter();

  // List of reports state
  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);
  
  // Filtering and sorting state
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newReportType, setNewReportType] = useState<string>("Complete Intelligence");
  const [newReportPeriod, setNewReportPeriod] = useState<string>("Last 30 Days");
  const [newReportFormat, setNewReportFormat] = useState<string>("PDF");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    "Executive Summary": true,
    "Key Risks": true,
    "Financial Health": true,
    "Credit Analysis": true,
    "Fraud Analysis": true,
    "Cash Flow Forecast": true,
    "AI Explanations": true,
    "Recommendations": true,
    "Methodology": true
  });

  // Filter selection change handler
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter application
  const filteredReports = useMemo(() => {
    if (activeFilter === "All") return reports;
    return reports.filter((r) => r.type === activeFilter);
  }, [reports, activeFilter]);

  // Actions
  const handleDownload = useCallback((name: string) => {
    toast.success(`Downloading: "${name}.${newReportFormat.toLowerCase()}"`);
  }, [newReportFormat]);

  const handleShare = useCallback((name: string) => {
    toast.success(`Link for "${name}" copied to clipboard!`);
  }, []);

  const handleRegenerate = useCallback((id: string) => {
    toast.info("Regenerating audit telemetry report...");
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            generatedDate: "Just Now",
            fileSize: `${(parseFloat(r.fileSize) * 1.05).toFixed(1)} MB`
          };
        }
        return r;
      })
    );
    setTimeout(() => {
      toast.success("Intelligence Report regenerated successfully.");
    }, 800);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Intelligence Report deleted.");
  }, []);

  // Section toggle inside generate modal
  const handleSectionToggle = useCallback((section: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Submit report generation
  const handleGenerateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setGenerationProgress(0);

    // Animate progress indicator
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setGenerationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Append new generated report mock item to local state
        const reportId = `report_${Date.now()}`;
        const newReport: ReportItem = {
          id: reportId,
          name: `${newReportType} Report`,
          type: newReportType as ReportItem["type"],
          generatedDate: "Just Now",
          analysisPeriod: newReportPeriod,
          status: "Ready",
          fileSize: "1.8 MB",
          summary: {
            status: "GENERATE SUCCESS",
            topRisk: "Simulated parameters active",
            strongestFactor: "Active score evaluation",
            topRecommendation: "Observe risk offsets using simulator",
            confidence: "95% diagnostic confidence"
          },
          content: {
            executiveSummary: `This ${newReportType} Report presents audit data compiled for the ${newReportPeriod} cycle. Metrics evaluation has completed successfully.`,
            keyRisks: "Evaluated default factors align within expected ranges.",
            financialHealth: "Accumulated buffer reserve checks classify as satisfactory.",
            creditAnalysis: "Calculated default rating indices represent stable bounds.",
            fraudAnalysis: "Transaction patterns conform to standard local parameters.",
            cashFlowForecast: "Forecasting projections report positive trajectory markers.",
            aiExplanations: "Model feature evaluations attributes primary parameters.",
            recommendations: "Maintain active parameters and clear card balance dues.",
            methodology: "Computed using LightGBM classifications and tree SHAP attribution."
          }
        };

        setReports((prev) => [newReport, ...prev]);
        setIsProcessing(false);
        setIsModalOpen(false);
        toast.success(`Generated: "${newReport.name}"`);
      }
    }, 150);
  }, [newReportType, newReportPeriod]);

  // Filters categories row labels
  const filterOptions = [
    { id: "All", label: "All Reports" },
    { id: "Complete Intelligence", label: "Complete Intelligence" },
    { id: "Financial Health", label: "Financial Health" },
    { id: "Credit Risk", label: "Credit Risk" },
    { id: "Fraud", label: "Fraud Anomaly" },
    { id: "Cash Flow", label: "Cash Flow" }
  ];

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-6.5 w-6.5 text-primary" /> INTELLIGENCE REPORTS
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Review automatically generated financial health reports, credit audits, location anomaly alerts, and cash flow projections.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="text-[10px] uppercase font-sans font-bold gap-1.5 cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" /> Generate Report
        </Button>
      </div>

      {/* FILTER BUTTONS BAR */}
      <div className="mt-6 flex flex-wrap gap-1.5 bg-surface-elevated/40 border border-border p-2 rounded-sm select-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleFilterChange(opt.id)}
            className={cn(
              "px-3 py-1.5 rounded-xs text-[10.5px] uppercase font-sans font-bold transition-all cursor-pointer",
              activeFilter === opt.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* SKELETON LOADING OR EMPTY STATS FEEDBACK */}
      {isLoading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border/80 bg-surface p-4.5 rounded-sm animate-pulse flex justify-between items-center">
              <div className="space-y-2 w-1/3">
                <div className="h-3.5 bg-border rounded-xs w-full" />
                <div className="h-3 bg-border rounded-xs w-2/3" />
              </div>
              <div className="h-7 bg-border rounded-xs w-24" />
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="mt-8 select-none text-center border border-border border-dashed p-12 rounded-sm bg-surface">
          <FileText className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No reports match filter</h3>
          <p className="text-xs text-foreground-secondary mt-1 max-w-sm mx-auto font-sans">
            Adjust your filter criteria tags above or click Generate Report to create a new audit assessment.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 select-none">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="border border-border/80 bg-surface p-4.5 rounded-sm hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
                  {report.type}
                </span>
                <h4 className="text-sm font-extrabold text-foreground leading-tight">
                  {report.name}
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-foreground-secondary font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-foreground-muted" /> Period: {report.analysisPeriod}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-foreground-muted" /> Generated: {report.generatedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="h-3.5 w-3.5 text-foreground-muted" /> Size: {report.fileSize}
                  </span>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                <Button
                  onClick={() => {
                    toast.info(`Opening Report: "${report.name}"...`);
                    router.push(`/reports/${report.id}`);
                  }}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-extrabold py-2 px-3.5 gap-1 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(report.name)}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold py-2 px-3 hover:bg-surface-elevated border-border/80 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(report.name)}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold py-2 px-3 hover:bg-surface-elevated border-border/80 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRegenerate(report.id)}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold py-2 px-3 hover:bg-surface-elevated border-border/80 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(report.id)}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold py-2 px-3 hover:bg-surface-elevated hover:text-critical border-border/80 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* GENERATE REPORT MODAL CONTAINER */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
        title="Generate Intelligence Report"
        className="w-full max-w-md font-sans text-xs select-none"
      >
        {isProcessing ? (
          <div className="py-8 text-center space-y-5">
            <RefreshCw className="h-10 w-10 text-primary mx-auto animate-spin" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">Compiling Audit Telemetry data</span>
              <p className="text-[10px] text-foreground-secondary">
                Running LightGBM classifiers and structuring SHAP attribution models...
              </p>
            </div>
            {/* Progress counter */}
            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-foreground-secondary uppercase">
                <span>Compilation Progress</span>
                <span className="font-mono text-primary">{generationProgress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-150"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerateSubmit} className="space-y-5">
            
            {/* Report Type selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                Report Type
              </label>
              <div className="relative">
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className="w-full bg-surface border border-border rounded-sm py-2 pl-3 pr-10 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="Complete Intelligence">Complete Financial Intelligence</option>
                  <option value="Financial Health">Financial Health Summary</option>
                  <option value="Credit Risk">Credit Risk Assessment</option>
                  <option value="Fraud">Fraud Investigation Logs</option>
                  <option value="Cash Flow">Cash Flow Forecast Projections</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-foreground-muted pointer-events-none" />
              </div>
            </div>

            {/* Analysis Period selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                Analysis Period
              </label>
              <div className="relative">
                <select
                  value={newReportPeriod}
                  onChange={(e) => setNewReportPeriod(e.target.value)}
                  className="w-full bg-surface border border-border rounded-sm py-2 pl-3 pr-10 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="Last 30 Days">Last 30 Days (June/July 2026)</option>
                  <option value="Q2 2026">Q2 2026 (Apr - Jun 2026)</option>
                  <option value="H2 2026">H2 2026 Projection (Jul - Dec 2026)</option>
                  <option value="Year-to-Date">Year-to-Date 2026</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-foreground-muted pointer-events-none" />
              </div>
            </div>

            {/* Include Sections checklists */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                Include Sections
              </label>
              <div className="grid grid-cols-2 gap-2 bg-surface-elevated/45 border border-border p-3.5 rounded-sm">
                {Object.keys(selectedSections).map((sec) => (
                  <div
                    key={sec}
                    onClick={() => handleSectionToggle(sec)}
                    className="flex items-center gap-2 cursor-pointer select-none text-[10.5px]"
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-4 w-4 rounded-xs border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                        selectedSections[sec]
                          ? "bg-primary border-primary text-white"
                          : "border-border bg-surface"
                      )}
                    >
                      {selectedSections[sec] && <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />}
                    </button>
                    <span className="text-foreground-secondary">{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Format selections */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                Export Format
              </label>
              <div className="flex gap-4">
                {["PDF", "JSON", "CSV"].map((fmt) => (
                  <div
                    key={fmt}
                    onClick={() => setNewReportFormat(fmt)}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs"
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                        newReportFormat === fmt ? "border-primary" : "border-border"
                      )}
                    >
                      {newReportFormat === fmt && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="font-semibold text-foreground-secondary">{fmt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 text-[10px] font-sans font-bold uppercase py-2.5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-[10px] font-sans font-bold uppercase py-2.5 cursor-pointer"
              >
                Generate Report
              </Button>
            </div>

          </form>
        )}
      </Modal>

    </PageContainer>
  );
}
