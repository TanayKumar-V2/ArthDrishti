"use client";

import { AppLogo } from "@/components/ui/AppLogo";

import React, { useState } from "react";
import { 
  Settings, 
  AlertOctagon, 
  HelpCircle,
  FileText,
  Trash2,
  Share2,
  Inbox,
  Activity,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, StatusBadge, RiskBadge, TrendIndicator } from "@/components/ui/Badge";
import { FinancialValue, ModelConfidence, MetricCardShell } from "@/components/ui/ValueDisplay";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui/FeedbackState";
import { SearchInput, FilterChip, DateRangeControl, ThemeToggle } from "@/components/ui/InputControls";
import { Tabs, Modal, Sheet, Tooltip, Popover, Dropdown } from "@/components/ui/Overlays";

export default function DesignSystemPage() {
  // Overlays state
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState("colors");

  // Input states
  const [searchText, setSearchText] = useState("");
  const [chipSelected, setChipSelected] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");

  // Dropdown menu mock items
  const menuItems = [
    { id: "share", label: "Share Report", icon: Share2, onClick: () => toast.success("Shared successfully!") },
    { id: "archive", label: "Archive Document", icon: FileText, onClick: () => toast.info("Archived document") },
    { id: "delete", label: "Delete Permanently", icon: Trash2, destructive: true, onClick: () => toast.error("Document deleted") },
  ];

  const showcaseTabs = [
    { id: "colors", label: "Colors & Typography", icon: Activity },
    { id: "primitives", label: "Core Primitives", icon: Settings },
    { id: "overlays", label: "Overlays & Modals", icon: HelpCircle },
  ];

  return (
    <PageContainer className="pb-24">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-xs border border-primary/20">
              Foundations v1.0
            </span>
          </div>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Design tokens, theme states, layout guides, and interactive primitives conforming to the ArthDrishti product philosophy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>
            Portal Dashboard
          </Button>
        </div>
      </div>

      {/* Navigation Switcher */}
      <Tabs tabs={showcaseTabs} activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* TAB CONTENT: COLORS & TYPOGRAPHY */}
      {activeTab === "colors" && (
        <div className="space-y-12">
          {/* Colors Panel */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Semantic Color Palette</h3>
              <p className="text-xs text-foreground-secondary">
                Tailwind variables dynamically shifting between Dark and Light mode.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {/* Background */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-background border border-border flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-background</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Main Background</span>
              </div>
              {/* Sidebar */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-sidebar border border-border flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-sidebar</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Sidebar Layer</span>
              </div>
              {/* Surface Flat */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-surface border border-border flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-surface</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Card Surface</span>
              </div>
              {/* Surface Elevated */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-surface-elevated border border-border flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-surface-elevated</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Elevated Popups</span>
              </div>
              {/* Primary Blue */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-primary flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-primary</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Intel Blue (#4F7CFF)</span>
              </div>
              {/* AI Violet */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-ai flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-ai</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">AI Violet (#8B5CF6)</span>
              </div>
              {/* Forecast Cyan */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-forecast flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-forecast</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Forecast Cyan (#06B6D4)</span>
              </div>
              {/* Success */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-positive flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-positive</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Positive (#10B981)</span>
              </div>
              {/* Warning */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-warning flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-warning</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Warning (#F59E0B)</span>
              </div>
              {/* Critical */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-critical flex items-end p-2">
                  <span className="text-[10px] font-mono text-white font-bold">bg-critical</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Critical (#EF4444)</span>
              </div>
              {/* Border */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-border border border-border-strong flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-border</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Border Divider</span>
              </div>
              {/* Strong Border */}
              <div className="flex flex-col gap-1.5">
                <div className="h-16 w-full rounded-sm bg-border-strong flex items-end p-2">
                  <span className="text-[10px] font-mono text-foreground font-bold">bg-border-strong</span>
                </div>
                <span className="text-[11px] text-foreground-secondary font-medium">Strong Border</span>
              </div>
            </div>
          </section>

          {/* Typography Panel */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Typography Scales</h3>
              <p className="text-xs text-foreground-secondary">
                Font families matching headings (Manrope), UI content (Inter), and financial stats (Geist Mono).
              </p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">Display Hero</span>
                <span className="text-4xl sm:text-5xl font-heading font-bold text-foreground">ArthDrishti Platform</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">Page Title</span>
                <span className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">Financial Stability</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">Section Header</span>
                <span className="text-xl sm:text-2xl font-heading font-semibold text-foreground">Credit Risk Diagnostic</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">Card Header</span>
                <span className="text-base sm:text-lg font-heading font-semibold text-foreground">Cash Flow Forecasting</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">Body Paragraph</span>
                <span className="text-sm font-sans text-foreground-secondary leading-relaxed max-w-xl">
                  This platform applies explainable AI techniques (SHAP/LIME) to provide deep transparency into loan underwriting decisions and portfolio stress vectors.
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-border/40 pb-4">
                <span className="text-xs font-mono text-foreground-muted w-36">System Labels</span>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary">
                  Active ML Models
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-xs font-mono text-foreground-muted w-36">KPI Metric Value</span>
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-foreground">
                  $12,450,000.00
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB CONTENT: CORE PRIMITIVES */}
      {activeTab === "primitives" && (
        <div className="space-y-12">
          {/* Badge Showcase */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Status Badges & Risk Accessibility</h3>
              <p className="text-xs text-foreground-secondary">
                Strict rule: Risk badges must always display: <code className="bg-surface px-1 py-0.5 rounded-xs border border-border">color + icon + text</code>.
              </p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-md grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Category Badges */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-muted">Standard Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="ai">AI Agent</Badge>
                  <Badge variant="forecast">Forecast</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Critical</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Status Badges */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-muted">System Status States</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="completed" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="failed" />
                  <StatusBadge status="active" />
                  <StatusBadge status="shadow" />
                  <StatusBadge status="retired" />
                </div>
              </div>

              {/* Risk States */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-muted">Risk Badges (Color+Icon+Text)</h4>
                <div className="flex flex-wrap gap-2.5">
                  <RiskBadge rating="Low" />
                  <RiskBadge rating="Medium" />
                  <RiskBadge rating="High" />
                  <RiskBadge rating="Critical" />
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Inputs */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Interactive Input Controls</h3>
              <p className="text-xs text-foreground-secondary">
                Styled form elements supporting filters, date ranges, and theme matching.
              </p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <label className="text-xs font-sans font-medium text-foreground-secondary">Search Field</label>
                <SearchInput 
                  placeholder="Query client ledger..." 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClear={() => setSearchText("")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans font-medium text-foreground-secondary block">Selectable Filter Chip</label>
                <FilterChip 
                  label="Enforce ESG Bounds" 
                  selected={chipSelected} 
                  count={12} 
                  onClick={() => setChipSelected(!chipSelected)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans font-medium text-foreground-secondary">Financial Cycles</label>
                <DateRangeControl value={selectedPeriod} onChangeValue={setSelectedPeriod} />
              </div>
            </div>
          </section>

          {/* Buttons Showcase */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Button Variations</h3>
              <p className="text-xs text-foreground-secondary">
                Action items featuring precise active scale transformations and distinct brand coloring.
              </p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-md space-y-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary Intel</Button>
                <Button variant="ai">AI Prescribe</Button>
                <Button variant="forecast">Forecast Inflow</Button>
                <Button variant="secondary">Secondary Box</Button>
                <Button variant="outline">Outline Boundary</Button>
                <Button variant="ghost">Ghost Trigger</Button>
                <Button variant="destructive">Critical Terminate</Button>
              </div>

              <div className="flex flex-wrap gap-4 items-center border-t border-border/30 pt-4">
                <span className="text-xs font-sans text-foreground-secondary mr-2">Control Sizes:</span>
                <Button size="sm">Small Act (sm)</Button>
                <Button size="md">Medium Act (md)</Button>
                <Button size="lg">Large Act (lg)</Button>
              </div>

              <div className="flex flex-wrap gap-4 items-center border-t border-border/30 pt-4">
                <span className="text-xs font-sans text-foreground-secondary mr-2">State Indicators:</span>
                <Button variant="primary" loading>Synchronizing</Button>
                <Button variant="outline" disabled>Disabled Action</Button>
                <IconButton variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </IconButton>
                <IconButton variant="ai" size="md" rounded>
                  <Activity className="h-4.5 w-4.5" />
                </IconButton>
              </div>
            </div>
          </section>

          {/* Metric Cards Shells */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Metric Cells & Numerical Values</h3>
              <p className="text-xs text-foreground-secondary">
                High-priority metrics utilizing Geist Mono numerals and percentage offset trends.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCardShell
                title="Consolidated Net Assets"
                value={12450000}
                currency="USD"
                trend={3.45}
                description="Cash buffers and physical reserves active"
              />
              <MetricCardShell
                title="AI Underwritten Risk"
                value={94.8}
                currency=""
                notation="standard"
                trend={-1.2}
                aiPowered
                description="Model validation runs daily"
              />
              <div className="bg-surface border border-border rounded-md p-5 flex flex-col gap-4 justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-muted">Formatted Values</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-secondary">Compact Currency</span>
                    <FinancialValue value={45200000} notation="compact" className="font-semibold" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-secondary">Standard Currency</span>
                    <FinancialValue value={1420.5} className="font-semibold" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-secondary">Concept Drift Delta</span>
                    <TrendIndicator value={0.245} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-secondary">ML confidence</span>
                    <ModelConfidence value={98.2} showLabel={false} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB CONTENT: OVERLAYS & MODALS */}
      {activeTab === "overlays" && (
        <div className="space-y-12">
          {/* Overlay triggers */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Overlay Panels & Triggers</h3>
              <p className="text-xs text-foreground-secondary">
                Modals, drawers, tooltips, and popovers driven by Framer Motion.
              </p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-md grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6 justify-center">
              {/* Modal Trigger */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-foreground-secondary">Dialog</span>
                <Button variant="outline" size="sm" onClick={() => setModalOpen(true)} className="cursor-pointer">
                  Open Modal
                </Button>
              </div>

              {/* Drawer Sheet Trigger */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-foreground-secondary">Slideout Sheet</span>
                <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="cursor-pointer">
                  Open Sheet
                </Button>
              </div>

              {/* Hover Tooltip */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-foreground-secondary">Tooltip (Hover)</span>
                <Tooltip content="Underwriting records are bank-grade secured.">
                  <div className="flex items-center gap-1 text-xs text-primary font-medium cursor-help border border-primary/20 px-3 py-2 bg-primary/5 rounded-sm">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    <span>Hover Me</span>
                  </div>
                </Tooltip>
              </div>

              {/* Popover click */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-foreground-secondary">Popover</span>
                <Popover
                  trigger={
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      Click Info
                    </Button>
                  }
                >
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-foreground text-xs">Compliance Verification</h5>
                    <p className="text-[11px] leading-normal text-foreground-secondary">
                      This diagnostic runs historical data across 14 independent threat engines.
                    </p>
                  </div>
                </Popover>
              </div>

              {/* Action Dropdown */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-foreground-secondary">Dropdown Menu</span>
                <Dropdown
                  trigger={
                    <Button variant="outline" size="sm" className="gap-1 cursor-pointer">
                      Options
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  }
                  items={menuItems}
                  align="right"
                />
              </div>
            </div>
          </section>

          {/* Feedback states */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">Feedback States (Skeletons & Messages)</h3>
              <p className="text-xs text-foreground-secondary">
                Unified messaging panels for loading states, missing ledger values, or backend connection fallbacks.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skeleton loading display */}
              <Card>
                <CardHeader>
                  <CardTitle>Skeleton Placeholders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circle" className="h-10 w-10 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-28 w-full" />
                </CardContent>
              </Card>

              {/* Empty State */}
              <EmptyState
                title="Ledger Ledger Empty"
                description="Connect an external CSV statement or linking bank pipeline to ingest transaction parameters."
                icon={Inbox}
              />

              {/* Error State */}
              <ErrorState
                title="Compliance API Timed Out"
                description="Unable to reach the credit validation endpoints. Make sure proxy firewall allows outbound ports."
                onRetry={() => toast.promise(new Promise(r => setTimeout(r, 800)), {
                  loading: "Re-evaluating compliance connection...",
                  success: "Compliance connection established.",
                  error: "Retry failed."
                })}
              />
            </div>
          </section>
        </div>
      )}

      {/* OVERLAY ELEMENTS RENDER IN PORTAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Audit Trail Verification">
        <div className="space-y-4">
          <p className="leading-relaxed">
            You are auditing loan applicant <strong>Sarah Jenkins (Sarah Jenkins Holdings Ltd)</strong>.
          </p>
          <div className="p-3 bg-surface-elevated border border-border rounded-sm space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground-secondary">Underwriting Decision</span>
              <span className="text-positive font-semibold">Low Default Probability</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-foreground-secondary">Validation Confidence</span>
              <span className="font-mono text-ai font-semibold">94.8%</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Dismiss audit
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setModalOpen(false);
              toast.success("Audit records verified.");
            }}>
              Verify Ledger
            </Button>
          </div>
        </div>
      </Modal>

      <Sheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Securities & Ingestion Keys">
        <div className="space-y-4">
          <p className="text-xs leading-normal">
            Configure integration tokens below. These tokens authorize ArthDrishti credit assessment bots to scan ledger items.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block">
                Plaid API Key (Sandbox)
              </label>
              <input 
                type="password"
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-surface-elevated border border-border text-foreground px-3 py-2 text-xs rounded-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-sans font-bold text-foreground-secondary uppercase tracking-wider block">
                Model API Endpoint
              </label>
              <input 
                type="text"
                value="https://api.arthdrishti.com/v2/predict"
                readOnly
                className="w-full bg-surface-elevated border border-border text-foreground px-3 py-2 text-xs rounded-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-6 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setSheetOpen(false)}>
              Save parameters
            </Button>
          </div>
        </div>
      </Sheet>
    </PageContainer>
  );
}
