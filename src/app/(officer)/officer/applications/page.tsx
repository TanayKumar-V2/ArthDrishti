"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  ChevronDown,
  User,
  RefreshCw,
  Download,
  UserCheck,
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Octagon,
  AlertCircle,
  Eye,
  MoreVertical,
  ShieldCheck,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Check,
  AlertOctagon,
  RotateCcw,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS, ApplicantDetail } from "@/lib/officer_data";

// Mini Sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 80;
  const height = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="w-20 h-6 shrink-0 opacity-80" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function OfficerApplicationsPage() {
  const router = useRouter();

  // Primary data states
  const [apps, setApps] = useState<ApplicantDetail[]>(OFFICER_APPLICANTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // UI view states
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [selectedDrawerApp, setSelectedDrawerApp] = useState<ApplicantDetail | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [density, setDensity] = useState<"compact" | "comfortable" | "loose">("comfortable");
  
  // Bulk Actions Confirm states
  const [activeBulkModal, setActiveBulkModal] = useState<{
    type: "assign" | "approve" | "reject" | "manual" | "archive";
    isOpen: boolean;
  } | null>(null);
  const [bulkAssignOfficer, setBulkAssignOfficer] = useState<string>("Officer Rahul");

  // Advanced Filters State
  const [filters, setFilters] = useState({
    globalSearch: "",
    appId: "",
    applicantName: "",
    loanType: "All",
    amountMin: "",
    amountMax: "",
    dateMin: "",
    dateMax: "",
    assignedOfficer: "All",
    aiRec: "All",
    riskLevel: "All",
    healthMin: "",
    healthMax: "",
    fraudRisk: "All",
    status: "All",
    employmentType: "All",
    incomeMin: "",
    incomeMax: "",
  });

  // Table sorting, visibility, selection states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    income: false,
    date: true,
    fraudRisk: true,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Simulate ingestion time and skeleton loading initially
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setActiveRowIndex(null);
    setRowSelection({});
    
    // Simulate loading completion and update time
    setTimeout(() => {
      setIsLoading(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      toast.success("Applications data reloaded and synchronized.");
    }, 600);
  }, []);

  // Filter logic
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // 1. Global Search
      if (filters.globalSearch) {
        const query = filters.globalSearch.toLowerCase();
        const matches =
          app.id.toLowerCase().includes(query) ||
          app.name.toLowerCase().includes(query) ||
          app.purpose.toLowerCase().includes(query) ||
          app.loanType.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // 2. Individual filters
      if (filters.appId && !app.id.toLowerCase().includes(filters.appId.toLowerCase())) return false;
      if (filters.applicantName && !app.name.toLowerCase().includes(filters.applicantName.toLowerCase())) return false;
      if (filters.loanType !== "All" && app.loanType !== filters.loanType) return false;
      
      // Amount range
      if (filters.amountMin && app.amount < Number(filters.amountMin)) return false;
      if (filters.amountMax && app.amount > Number(filters.amountMax)) return false;

      // Dates
      if (filters.dateMin && app.date < filters.dateMin) return false;
      if (filters.dateMax && app.date > filters.dateMax) return false;

      // Badges/Categorical
      if (filters.assignedOfficer !== "All" && app.officer !== filters.assignedOfficer) return false;
      if (filters.aiRec !== "All" && app.aiRec !== filters.aiRec) return false;
      if (filters.riskLevel !== "All" && app.priority !== filters.riskLevel) return false; // Map risk to priority
      
      // Health range
      if (filters.healthMin && app.healthScore < Number(filters.healthMin)) return false;
      if (filters.healthMax && app.healthScore > Number(filters.healthMax)) return false;

      if (filters.fraudRisk !== "All" && app.fraudRisk !== filters.fraudRisk) return false;
      if (filters.status !== "All" && app.status !== filters.status) return false;
      if (filters.employmentType !== "All" && app.employmentType !== filters.employmentType) return false;

      // Income range
      if (filters.incomeMin && app.income < Number(filters.incomeMin)) return false;
      if (filters.incomeMax && app.income > Number(filters.incomeMax)) return false;

      return true;
    });
  }, [apps, filters]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      globalSearch: "",
      appId: "",
      applicantName: "",
      loanType: "All",
      amountMin: "",
      amountMax: "",
      dateMin: "",
      dateMax: "",
      assignedOfficer: "All",
      aiRec: "All",
      riskLevel: "All",
      healthMin: "",
      healthMax: "",
      fraudRisk: "All",
      status: "All",
      employmentType: "All",
      incomeMin: "",
      incomeMax: "",
    });
    toast.info("All filter parameters have been reset.");
  }, []);

  const handleSaveFilterView = useCallback(() => {
    toast.success("Current filter workspace configuration saved locally.");
  }, []);

  const handleExportCSV = useCallback((dataToExport: ApplicantDetail[]) => {
    if (dataToExport.length === 0) {
      toast.warning("No applications matching current filter state to export.");
      return;
    }
    
    // Simulate generation
    const headers = "ID,Name,Type,Amount,Income,HealthScore,DefaultProb,FraudRisk,AIRecommendation,Officer,Date,Status,Priority\n";
    const rows = dataToExport.map(a => 
      `"${a.id}","${a.name}","${a.loanType}",${a.amount},${a.income},${a.healthScore},${a.defaultProb},"${a.fraudRisk}","${a.aiRec}","${a.officer}","${a.date}","${a.status}","${a.priority}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `arth_applications_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${dataToExport.length} applications to CSV file.`);
  }, []);

  // Creation State handler
  interface NewAppForm {
    name: string;
    purpose: string;
    loanType: ApplicantDetail["loanType"];
    amount: number;
    income: number;
    employmentType: ApplicantDetail["employmentType"];
  }

  const [newAppForm, setNewAppForm] = useState<NewAppForm>({
    name: "",
    purpose: "",
    loanType: "Home Loan",
    amount: 500000,
    income: 80000,
    employmentType: "Salaried",
  });

  const handleCreateApplication = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.name || !newAppForm.purpose) {
      toast.error("Please fill in the applicant name and purpose fields.");
      return;
    }

    const newId = `app${apps.length + 1}`;
    const newRecord: ApplicantDetail = {
      id: newId,
      name: newAppForm.name,
      avatar: newAppForm.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      age: 32,
      amount: Number(newAppForm.amount),
      purpose: newAppForm.purpose,
      loanType: newAppForm.loanType,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      defaultProb: Math.round(15 + Math.random() * 50),
      healthScore: Math.round(50 + Math.random() * 40),
      fraudRisk: "Low",
      aiRec: "Manual Review",
      confidence: 90.5,
      waitTime: "Just Ingested",
      income: Number(newAppForm.income),
      expenses: Math.round(newAppForm.income * 0.4),
      debt: Math.round(newAppForm.amount * 0.5),
      savings: Math.round(newAppForm.income * 3),
      existingLoans: [],
      riskFactors: ["New applicant review required"],
      protectiveFactors: ["Clean account ingestion record"],
      shapAttributions: [
        { feature: "Requested Amount", value: newAppForm.amount, impact: 8 },
        { feature: "Income Base", value: newAppForm.income, impact: -6 }
      ],
      documents: [
        { name: "Identity Proof (Ingested)", status: "Verified", type: "PDF" }
      ],
      auditHistory: [
        { date: new Date().toLocaleString(), action: "Application Created", user: "Officer Rahul", notes: "Manually registered in CRM workspace." }
      ],
      employmentType: newAppForm.employmentType,
      officer: "Officer Rahul",
      priority: "Medium"
    };

    setApps(prev => [newRecord, ...prev]);
    setIsCreateModalOpen(false);
    setNewAppForm({
      name: "",
      purpose: "",
      loanType: "Home Loan",
      amount: 500000,
      income: 80000,
      employmentType: "Salaried",
    });
    toast.success(`Successfully registered application ${newId} for ${newRecord.name}.`);
  }, [apps, newAppForm]);

  // Bulk operation triggers
  const handleBulkActionExecute = useCallback(() => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]).map(indexIdx => filteredApps[Number(indexIdx)]?.id).filter(Boolean);
    if (selectedIds.length === 0) {
      toast.warning("No rows selected for bulk actions.");
      return;
    }

    if (activeBulkModal?.type === "assign") {
      setApps(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, officer: bulkAssignOfficer } : a));
      toast.success(`Assigned ${selectedIds.length} applications to ${bulkAssignOfficer}.`);
    } else if (activeBulkModal?.type === "approve") {
      setApps(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: "AI Approved", aiRec: "Approve" } : a));
      toast.success(`Bulk approved decisions logged for ${selectedIds.length} cases.`);
    } else if (activeBulkModal?.type === "reject") {
      setApps(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: "AI Rejected", aiRec: "Deny" } : a));
      toast.error(`Denial actions finalized for ${selectedIds.length} selected profiles.`);
    } else if (activeBulkModal?.type === "manual") {
      setApps(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: "Manual Review", aiRec: "Manual Review" } : a));
      toast.success(`Rerouted ${selectedIds.length} files to Manual Underwriter queues.`);
    } else if (activeBulkModal?.type === "archive") {
      setApps(prev => prev.filter(a => !selectedIds.includes(a.id)));
      toast.warning(`Archived and removed ${selectedIds.length} records from current view.`);
    }

    setRowSelection({});
    setActiveBulkModal(null);
  }, [rowSelection, filteredApps, activeBulkModal, bulkAssignOfficer]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside form inputs
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (filteredApps.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveRowIndex((prev) => {
          if (prev === null) return 0;
          return Math.min(prev + 1, filteredApps.length - 1);
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveRowIndex((prev) => {
          if (prev === null) return 0;
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === "Enter") {
        if (activeRowIndex !== null && filteredApps[activeRowIndex]) {
          e.preventDefault();
          setSelectedDrawerApp(filteredApps[activeRowIndex]);
        }
      } else if (e.key === " ") {
        if (activeRowIndex !== null && filteredApps[activeRowIndex]) {
          e.preventDefault();
          // Toggle selection
          setRowSelection(prev => {
            const currentSelected = !!prev[activeRowIndex];
            return {
              ...prev,
              [activeRowIndex]: !currentSelected
            };
          });
          toast.info(`Toggled selection of applicant "${filteredApps[activeRowIndex].name}".`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredApps, activeRowIndex]);

  // Compute stats for KPI section dynamically based on current list
  const kpiStats = useMemo(() => {
    const total = apps.length;
    const pending = apps.filter(a => a.status === "Pending" || a.status === "Under Review" || a.status === "Manual Review" || a.status === "Documents Requested").length;
    const critical = apps.filter(a => a.priority === "Critical" || a.priority === "High").length;
    const approved = apps.filter(a => a.status === "AI Approved" || a.status === "Completed").length;
    const rejected = apps.filter(a => a.status === "AI Rejected").length;
    
    return {
      received: 1248 + (total - 20), // Scale from baseline
      pending: pending + 292,
      critical: critical + 110,
      approved: approved + 662,
      rejected: rejected + 124,
      reviewTime: "18 mins"
    };
  }, [apps]);

  // TanStack Table columns definitions
  const columns = useMemo<ColumnDef<ApplicantDetail>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center pl-1">
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary cursor-pointer accent-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center pl-1">
          <input
            type="checkbox"
            aria-label={`Select applicant row ${row.original.id}`}
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            onClick={(e) => e.stopPropagation()} // Stop drawer opening on checkbox click
            className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary cursor-pointer accent-primary"
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: "Application ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground-secondary uppercase tracking-wider select-text">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Applicant",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-[9.5px] select-none shrink-0">
            {row.original.avatar}
          </div>
          <span className="font-extrabold text-foreground group-hover/row:text-primary transition-colors truncate max-w-[120px]">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "loanType",
      header: "Loan Type",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-secondary truncate max-w-[100px] block">
          {row.original.loanType}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Requested Amount",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ₹{row.original.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "income",
      header: "Monthly Income",
      cell: ({ row }) => (
        <span className="font-mono text-foreground-secondary">
          ₹{row.original.income.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "healthScore",
      header: "Financial Health",
      cell: ({ row }) => {
        const score = row.original.healthScore;
        const color = score >= 75 ? "text-positive bg-positive/10 border-positive/15" : score >= 50 ? "text-warning bg-warning/10 border-warning/15" : "text-critical bg-critical/10 border-critical/15";
        return (
          <div className="flex items-center gap-2">
            <span className={cn("px-1.5 py-0.5 rounded-xs font-mono font-bold text-[9.5px] border", color)}>
              {score}
            </span>
            <div className="w-12 h-1 bg-border rounded-full overflow-hidden hidden lg:block shrink-0">
              <div
                className={cn(
                  "h-full rounded-full",
                  score >= 75 ? "bg-positive" : score >= 50 ? "bg-warning" : "bg-critical"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "defaultProb",
      header: "Credit Risk",
      cell: ({ row }) => {
        const prob = row.original.defaultProb;
        const style = prob >= 50 ? "text-critical" : prob >= 25 ? "text-warning" : "text-positive";
        return (
          <div className="flex flex-col gap-0.5">
            <span className={cn("font-mono font-bold", style)}>{prob}%</span>
            <span className="text-[8px] text-foreground-muted block leading-none">Default Prob</span>
          </div>
        );
      },
    },
    {
      accessorKey: "fraudRisk",
      header: "Fraud Risk",
      cell: ({ row }) => {
        const risk = row.original.fraudRisk;
        return (
          <span className={cn(
            "text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
            risk === "High" ? "text-critical bg-critical/10 border-critical/15" : risk === "Medium" ? "text-warning bg-warning/10 border-warning/15" : "text-positive bg-positive/10 border-positive/15"
          )}>
            {risk}
          </span>
        );
      },
    },
    {
      accessorKey: "aiRec",
      header: "AI Recommendation",
      cell: ({ row }) => {
        const rec = row.original.aiRec;
        const confidence = row.original.confidence;
        
        let color = "text-positive bg-positive/10 border-positive/15";
        let Icon = ShieldCheck;
        if (rec === "Deny") {
          color = "text-critical bg-critical/10 border-critical/15";
          Icon = XCircle;
        } else if (rec === "Manual Review") {
          color = "text-warning bg-warning/10 border-warning/15";
          Icon = AlertTriangle;
        } else if (rec === "Needs Documents") {
          color = "text-forecast bg-forecast/10 border-forecast/15";
          Icon = FileText;
        }

        return (
          <div className="flex flex-col gap-0.5 select-none">
            <span className={cn("inline-flex items-center gap-1 text-[9px] font-sans font-extrabold px-1.5 py-0.5 rounded-xs border uppercase", color)}>
              <Icon className="h-2.5 w-2.5 shrink-0" />
              {rec}
            </span>
            <span className="text-[8.5px] font-mono text-foreground-muted pl-0.5">{confidence}% confidence</span>
          </div>
        );
      },
    },
    {
      accessorKey: "officer",
      header: "Officer",
      cell: ({ row }) => {
        const off = row.original.officer;
        const unassigned = off === "Unassigned";
        return (
          <span className={cn(
            "px-1.5 py-0.5 rounded-xs text-[10px] font-semibold border truncate max-w-[100px] block w-fit",
            unassigned ? "bg-surface-elevated text-foreground-muted border-border" : "bg-primary/5 text-primary border-primary/15"
          )}>
            {off}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Created Date",
      cell: ({ row }) => (
        <span className="font-mono text-foreground-muted select-none">{row.original.date}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        
        const config = {
          "Pending": { icon: Clock, style: "text-warning bg-warning/10 border-warning/15" },
          "Under Review": { icon: Eye, style: "text-forecast bg-forecast/10 border-forecast/15" },
          "AI Approved": { icon: Sparkles, style: "text-positive bg-positive/10 border-positive/15" },
          "AI Rejected": { icon: XCircle, style: "text-critical bg-critical/10 border-critical/15" },
          "Manual Review": { icon: SlidersHorizontal, style: "text-warning bg-warning/10 border-warning/15" },
          "Documents Requested": { icon: FileText, style: "text-primary bg-primary/10 border-primary/15" },
          "Completed": { icon: CheckCircle2, style: "text-positive bg-positive/10 border-positive/15" },
        }[status] || { icon: Clock, style: "text-foreground-secondary bg-surface-elevated border-border" };

        const Icon = config.icon;
        return (
          <span className={cn("inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase font-sans select-none shrink-0", config.style)}>
            <Icon className="h-2.5 w-2.5 shrink-0" />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        const config = {
          "Critical": { icon: Octagon, style: "text-critical bg-critical/10 border-critical/15 font-black animate-pulse" },
          "High": { icon: AlertCircle, style: "text-critical bg-critical/5 border-critical/10" },
          "Medium": { icon: AlertTriangle, style: "text-warning bg-warning/5 border-warning/10" },
          "Low": { icon: CheckCircle2, style: "text-positive bg-positive/5 border-positive/10" },
        }[priority] || { icon: AlertTriangle, style: "text-foreground-secondary bg-surface border-border" };

        const Icon = config.icon;
        return (
          <span className={cn("inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs border uppercase tracking-wider select-none shrink-0", config.style)}>
            <Icon className="h-2.5 w-2.5 shrink-0" />
            {priority}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      cell: ({ row }) => {
        const app = row.original;
        
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Quick Inspect">
              <button
                onClick={() => setSelectedDrawerApp(app)}
                aria-label={`Inspect application ${app.id}`}
                className="p-1 rounded-xs border border-border bg-surface hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            
            <Tooltip content="Launch AI Underwriting">
              <button
                onClick={() => router.push(`/officer/underwriting/${app.id}`)}
                aria-label={`Open underwriting for application ${app.id}`}
                className="p-1 rounded-xs bg-primary text-white hover:opacity-95 cursor-pointer transition-all flex items-center justify-center"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </Tooltip>

            <Dropdown
              align="right"
              trigger={
                <button 
                  aria-label={`More actions for application ${app.id}`}
                  className="p-1 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary cursor-pointer"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              }
              items={[
                {
                  id: "profile",
                  label: "View Profile",
                  icon: User,
                  onClick: () => router.push(`/officer/applicants/${app.id}`)
                },
                {
                  id: "underwrite",
                  label: "Open Underwriting",
                  icon: SlidersHorizontal,
                  onClick: () => router.push(`/officer/underwriting/${app.id}`)
                },
                {
                  id: "assign",
                  label: "Assign Officer",
                  icon: UserCheck,
                  onClick: () => {
                    setRowSelection({ [row.id]: true });
                    setActiveBulkModal({ type: "assign", isOpen: true });
                  }
                },
                {
                  id: "report",
                  label: "Generate Report",
                  icon: FileText,
                  onClick: () => toast.info(`Report generated for applicant "${app.name}".`)
                },
                {
                  id: "docs",
                  label: "View Documents",
                  icon: FileText,
                  onClick: () => {
                    setSelectedDrawerApp(app);
                    toast.info(`Documents catalog loaded in side panel.`);
                  }
                }
              ]}
            />
          </div>
        );
      },
      enableSorting: false,
    }
  ], [router]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: filteredApps,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  const selectedCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;

  return (
    <PageContainer className="pb-28 text-xs select-none">
      
      {/* 1. PROFESSIONAL ERROR SCREEN */}
      {isError ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-border border-dashed p-8 rounded-md bg-surface mt-6 text-center max-w-xl mx-auto">
          <AlertOctagon className="h-12 w-12 text-critical mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-foreground">Workspace Synchronizer Failure</h2>
          <p className="text-xs text-foreground-secondary mt-2 mb-6 max-w-sm leading-relaxed">
            The database connection failed while attempting to query application tables. A firewall or session timeout may have interrupted active connections.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsError(false);
                handleRefresh();
              }}
              size="sm"
              className="text-[10px] uppercase font-sans font-bold cursor-pointer"
            >
              Retry Connection
            </Button>
            <Button
              onClick={() => setIsError(false)}
              variant="outline"
              size="sm"
              className="text-[10px] uppercase font-sans font-bold cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* ==========================================
              PAGE HEADER
             ========================================== */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-3.5 border-b border-border/60">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
                <ClipboardList className="h-6 w-6 text-primary shrink-0" />
                <span>Loan Applications</span>
              </h1>
              <p className="text-xs text-foreground-secondary font-sans max-w-2xl leading-relaxed">
                Review, prioritize, analyze and manage all incoming loan applications using AI-assisted underwriting intelligence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 sm:items-center">
              <div className="text-left sm:text-right text-[10px] text-foreground-muted pr-2 font-mono flex items-center gap-1.5 sm:block">
                <span>Last updated:</span>
                <span className="font-extrabold text-foreground-secondary">{lastUpdated || "Loading..."}</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <Tooltip content="Refresh Database">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    loading={isLoading}
                    className="p-2 cursor-pointer h-9 w-9 text-foreground-secondary"
                  >
                    {!isLoading && <RefreshCw className="h-4 w-4" />}
                  </Button>
                </Tooltip>

                <Button
                  onClick={() => handleExportCSV(filteredApps)}
                  variant="outline"
                  size="sm"
                  className="text-[10px] uppercase font-sans font-bold cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-foreground-secondary" /> Export
                </Button>

                <Button
                  onClick={() => {
                    if (selectedCount === 0) {
                      toast.warning("Select one or more applications in the table first.");
                      return;
                    }
                    setActiveBulkModal({ type: "assign", isOpen: true });
                  }}
                  variant="outline"
                  size="sm"
                  className="text-[10px] uppercase font-sans font-bold cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-foreground-secondary" /> Assign
                </Button>

                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="sm"
                  className="text-[10px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Application
                </Button>

                <Button
                  onClick={() => toast.info("Comprehensive loan analytics report queued for generation.")}
                  variant="secondary"
                  size="sm"
                  className="text-[10px] uppercase font-sans font-bold cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Report
                </Button>
              </div>
            </div>
          </div>

          {/* ==========================================
              SUMMARY KPI SECTION
             ========================================== */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-2">
            
            {/* KPI 1 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Apps Received</span>
                    <ClipboardList className="h-4.5 w-4.5 text-primary/70" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-foreground font-sans tracking-tight">
                      {kpiStats.received.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-positive font-bold flex items-center">↑ 8%</span>
                      <span className="text-foreground-muted truncate">vs last month</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[1150, 1180, 1170, 1200, 1220, 1248]} color="var(--primary)" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* KPI 2 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Pending Review</span>
                    <Clock className="h-4.5 w-4.5 text-warning/70" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-foreground font-sans tracking-tight">
                      {kpiStats.pending}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-warning font-bold">12 cases</span>
                      <span className="text-foreground-muted truncate">assigned to you</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[340, 330, 315, 320, 312, 312]} color="var(--warning)" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* KPI 3 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">High Risk</span>
                    <AlertTriangle className="h-4.5 w-4.5 text-critical/80 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-critical font-sans tracking-tight">
                      {kpiStats.critical}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-critical font-bold">Requires Action</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[140, 135, 128, 130, 124, 124]} color="var(--critical)" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* KPI 4 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">AI Approved</span>
                    <Sparkles className="h-4.5 w-4.5 text-positive/70" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-positive font-sans tracking-tight">
                      {kpiStats.approved}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-positive font-bold">54.6%</span>
                      <span className="text-foreground-muted truncate">of total decisions</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[600, 620, 640, 650, 670, 682]} color="var(--positive)" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* KPI 5 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">AI Rejected</span>
                    <XCircle className="h-4.5 w-4.5 text-foreground-secondary/70" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-foreground font-sans tracking-tight">
                      {kpiStats.rejected}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-foreground-secondary font-bold">10.4%</span>
                      <span className="text-foreground-muted truncate">of total applications</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[120, 122, 125, 126, 128, 130]} color="var(--foreground-secondary)" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* KPI 6 */}
            <Card className="hover:bg-surface-hover/30 hover:border-border-strong/60 transition-all border border-border bg-surface relative overflow-hidden group select-none">
              {isLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-7 w-20 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              ) : (
                <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Avg Review Time</span>
                    <Clock className="h-4.5 w-4.5 text-primary/70" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-foreground font-sans tracking-tight">
                      {kpiStats.reviewTime}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                      <span className="text-positive font-bold">↓ 4 mins</span>
                      <span className="text-foreground-muted truncate">vs yesterday</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between border-t border-border/40 mt-1">
                    <Sparkline data={[24, 22, 21, 20, 19, 18]} color="var(--primary)" />
                  </div>
                </CardContent>
              )}
            </Card>

          </div>

          {/* ==========================================
              ADVANCED FILTER BAR (STICKY)
             ========================================== */}
          <div className="sticky top-0 z-20 mt-6 bg-background/95 backdrop-blur border border-border rounded-xs p-3.5 space-y-3.5 select-none shadow-sm">
            
            {/* Header + Core controls */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="font-heading font-extrabold text-sm text-foreground">Advanced Query Console</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filters
                </Button>

                <Button
                  onClick={handleSaveFilterView}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                >
                  Save View
                </Button>

                <Button
                  onClick={() => setIsError(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[9.5px] uppercase font-sans font-bold text-critical/60 hover:text-critical cursor-pointer hover:bg-critical/5"
                >
                  Trigger Err State
                </Button>
              </div>
            </div>

            {/* In-depth filters grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              
              {/* Search */}
              <div className="col-span-2 relative">
                <span className="absolute left-2.5 top-2 text-foreground-muted">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Global search applicant, purpose..."
                  value={filters.globalSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, globalSearch: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 pl-8 pr-2.5 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* Application ID */}
              <div>
                <input
                  type="text"
                  placeholder="App ID (e.g. app1)"
                  value={filters.appId}
                  onChange={(e) => setFilters(prev => ({ ...prev, appId: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2.5 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* Applicant Name */}
              <div>
                <input
                  type="text"
                  placeholder="Applicant Name"
                  value={filters.applicantName}
                  onChange={(e) => setFilters(prev => ({ ...prev, applicantName: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2.5 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* Loan Type */}
              <div className="relative">
                <select
                  value={filters.loanType}
                  onChange={(e) => setFilters(prev => ({ ...prev, loanType: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Loan Types</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Commercial Loan">Commercial Loan</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Assigned Officer */}
              <div className="relative">
                <select
                  value={filters.assignedOfficer}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignedOfficer: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Officers</option>
                  <option value="Officer Rahul">Officer Rahul</option>
                  <option value="Officer Priya">Officer Priya</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Loan Amount Range */}
              <div className="col-span-2 flex gap-1 items-center">
                <input
                  type="number"
                  placeholder="Min Amount (₹)"
                  value={filters.amountMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
                <span className="text-foreground-muted text-[10px]">to</span>
                <input
                  type="number"
                  placeholder="Max Amount (₹)"
                  value={filters.amountMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* Date range */}
              <div className="col-span-2 flex gap-1 items-center">
                <input
                  type="date"
                  aria-label="Start creation date filter"
                  value={filters.dateMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateMin: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
                <span className="text-foreground-muted text-[10px]">to</span>
                <input
                  type="date"
                  aria-label="End creation date filter"
                  value={filters.dateMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateMax: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* AI Recommendation */}
              <div className="relative">
                <select
                  value={filters.aiRec}
                  onChange={(e) => setFilters(prev => ({ ...prev, aiRec: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All AI Recs</option>
                  <option value="Approve">Approve</option>
                  <option value="Deny">Deny</option>
                  <option value="Manual Review">Manual Review</option>
                  <option value="Needs Documents">Needs Documents</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Priority / Risk Level */}
              <div className="relative">
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Financial Health Score Range */}
              <div className="col-span-2 flex gap-1 items-center">
                <input
                  type="number"
                  placeholder="Min Health"
                  value={filters.healthMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, healthMin: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
                <span className="text-foreground-muted text-[10px]">to</span>
                <input
                  type="number"
                  placeholder="Max Health"
                  value={filters.healthMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, healthMax: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

              {/* Fraud Risk */}
              <div className="relative">
                <select
                  value={filters.fraudRisk}
                  onChange={(e) => setFilters(prev => ({ ...prev, fraudRisk: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Fraud Risks</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Clear status */}
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="AI Approved">AI Approved</option>
                  <option value="AI Rejected">AI Rejected</option>
                  <option value="Manual Review">Manual Review</option>
                  <option value="Documents Requested">Docs Requested</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Employment type */}
              <div className="relative">
                <select
                  value={filters.employmentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                >
                  <option value="All">All Employments</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Monthly Income Range */}
              <div className="col-span-2 flex gap-1 items-center">
                <input
                  type="number"
                  placeholder="Min Income (₹)"
                  value={filters.incomeMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, incomeMin: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
                <span className="text-foreground-muted text-[10px]">to</span>
                <input
                  type="number"
                  placeholder="Max Income (₹)"
                  value={filters.incomeMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, incomeMax: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1 px-2 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
                />
              </div>

            </div>

          </div>

          {/* ==========================================
              APPLICATION TABLE / GRID LAYOUT
             ========================================== */}
          <div className="mt-4 space-y-4">
            
            {/* Table Configuration Bar */}
            <div className="flex items-center justify-between bg-surface border border-border px-4 py-2 rounded-xs select-none">
              <div className="text-[11px] text-foreground-secondary">
                Showing <span className="font-bold text-foreground">{filteredApps.length}</span> of <span className="font-bold text-foreground">{apps.length}</span> loan applications
                {activeRowIndex !== null && (
                  <span className="ml-3 text-[10px] text-primary bg-primary/5 px-2 py-0.5 border border-primary/10 rounded-xs">
                    Row index <span className="font-bold font-mono">{activeRowIndex}</span> selected (Use ↑↓ arrows, Enter to inspect)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5">
                
                {/* Density toggle */}
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] font-bold text-foreground-muted uppercase">Density:</span>
                  <div className="flex border border-border rounded-sm bg-surface-elevated/40 overflow-hidden p-0.5 gap-0.5">
                    {(["compact", "comfortable", "loose"] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={cn(
                          "px-2 py-0.75 rounded-xs text-[9px] font-bold uppercase transition-all cursor-pointer",
                          density === d ? "bg-primary text-white" : "text-foreground-secondary hover:bg-surface-hover"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column visibility drop */}
                <Dropdown
                  align="right"
                  trigger={
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border hover:bg-surface-hover rounded-sm text-[10.5px] text-foreground-secondary font-bold cursor-pointer bg-surface">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Columns</span>
                    </button>
                  }
                  items={table.getAllLeafColumns().filter(col => col.id !== "select" && col.id !== "actions").map(col => ({
                    id: col.id,
                    label: col.id.charAt(0).toUpperCase() + col.id.slice(1),
                    icon: col.getIsVisible() ? Check : undefined,
                    onClick: () => col.toggleVisibility(!col.getIsVisible())
                  }))}
                />

              </div>
            </div>

            {/* TanStack Table Card */}
            <Card className="border border-border/80 bg-surface overflow-hidden">
              
              {isLoading ? (
                // Table Loading Skeletons
                <div className="divide-y divide-border animate-pulse select-none">
                  <div className="h-10 bg-surface-elevated/50 flex items-center px-4 gap-4">
                    <div className="h-3.5 w-3.5 bg-border rounded-xs" />
                    <div className="h-3 w-16 bg-border rounded-xs" />
                    <div className="h-3 w-32 bg-border rounded-xs" />
                    <div className="h-3 w-24 bg-border rounded-xs" />
                    <div className="h-3 w-28 bg-border rounded-xs" />
                    <div className="h-3 w-20 bg-border rounded-xs" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 flex items-center px-4 gap-4">
                      <div className="h-3.5 w-3.5 bg-border rounded-xs" />
                      <div className="h-3 w-12 bg-border rounded-xs" />
                      <div className="h-6.5 w-24 bg-border rounded-xs" />
                      <div className="h-3.5 w-20 bg-border rounded-xs" />
                      <div className="h-3.5 w-28 bg-border rounded-xs" />
                      <div className="h-3.5 w-16 bg-border rounded-xs" />
                    </div>
                  ))}
                </div>
              ) : filteredApps.length === 0 ? (
                // Elegant empty state
                <div className="text-center border-t border-border border-dashed p-12 bg-surface">
                  <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4 border border-border">
                    <ClipboardList className="h-6 w-6 text-foreground-muted" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground">No Applications Found</h3>
                  <p className="text-[10px] text-foreground-secondary mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                    We couldn&apos;t find any loan application records matching your active filters. Try clearing constraints or register a new client profile.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      size="sm"
                      className="text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                    >
                      Reset filters
                    </Button>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      size="sm"
                      className="text-[9.5px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
                    >
                      Create Application
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block overflow-x-auto select-none">
                    <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
                      <thead>
                        {table.getHeaderGroups().map((group) => (
                          <tr key={group.id} className="bg-surface-elevated/45 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border/40 select-none sticky top-0 z-10">
                            {group.headers.map((header) => (
                              <th
                                key={header.id}
                                className={cn(
                                  "py-3 px-3 relative font-extrabold select-none border-r border-border/10",
                                  header.column.getCanSort() && "cursor-pointer hover:bg-surface-hover/50 hover:text-foreground"
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                                style={{ width: header.getSize() }}
                              >
                                <div className="flex items-center gap-1.5">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && (
                                    <ArrowUpDown className="h-3 w-3 text-foreground-muted/60 shrink-0" />
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row, index) => {
                          const isActive = activeRowIndex === index;
                          const isSelected = row.getIsSelected();
                          
                          return (
                            <tr
                              key={row.id}
                              onClick={() => {
                                setActiveRowIndex(index);
                                setSelectedDrawerApp(row.original);
                              }}
                              className={cn(
                                "border-b border-border/30 last:border-b-0 group/row cursor-pointer transition-colors font-sans hover:bg-surface-hover/40",
                                isActive && "bg-primary/5 hover:bg-primary/5 border-l-2 border-l-primary",
                                isSelected && "bg-primary/5/30"
                              )}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className={cn(
                                    "px-3 align-middle transition-all border-r border-border/5",
                                    density === "compact" && "py-1.5",
                                    density === "comfortable" && "py-3",
                                    density === "loose" && "py-4.5"
                                  )}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS LIST VIEW */}
                  <div className="block md:hidden space-y-3.5 p-4 bg-surface-elevated/20 divide-y divide-border/20">
                    {table.getRowModel().rows.map((row, index) => {
                      const app = row.original;
                      const isSelected = row.getIsSelected();
                      const isActive = activeRowIndex === index;
                      
                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setActiveRowIndex(index);
                            setSelectedDrawerApp(app);
                          }}
                          className={cn(
                            "pt-3.5 first:pt-0 pb-1 cursor-pointer transition-all flex flex-col gap-2.5",
                            isActive && "border-l-2 border-l-primary pl-2 bg-primary/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                aria-label={`Select applicant card ${app.id}`}
                                checked={isSelected}
                                onChange={(e) => row.toggleSelected(!!e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 rounded-xs border-border text-primary"
                              />
                              <span className="font-mono font-bold text-foreground-secondary text-[10px] uppercase">
                                {app.id}
                              </span>
                              <span className="font-extrabold text-foreground">{app.name}</span>
                            </div>
                            
                            <span className={cn(
                              "text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                              app.priority === "Critical" ? "text-critical bg-critical/10 border-critical/15" : "text-foreground-secondary bg-surface border-border"
                            )}>
                              {app.priority}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10.5px] pl-5">
                            <div>
                              <span className="text-foreground-muted block text-[8px] uppercase font-bold">Requested Size</span>
                              <span className="font-mono font-bold text-foreground">₹{app.amount.toLocaleString("en-IN")}</span>
                            </div>
                            <div>
                              <span className="text-foreground-muted block text-[8px] uppercase font-bold">Type</span>
                              <span className="font-semibold text-foreground-secondary">{app.loanType}</span>
                            </div>
                            <div>
                              <span className="text-foreground-muted block text-[8px] uppercase font-bold">Credit Risk</span>
                              <span className="font-mono font-semibold text-foreground">{app.defaultProb}% Default Prob</span>
                            </div>
                            <div>
                              <span className="text-foreground-muted block text-[8px] uppercase font-bold">AI Rec</span>
                              <span className="font-bold text-foreground-secondary uppercase text-[9px]">{app.aiRec}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pl-5 pt-1">
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase font-sans",
                              app.status === "Completed" ? "text-positive bg-positive/10 border-positive/15" : "text-warning bg-warning/10 border-warning/15"
                            )}>
                              {app.status}
                            </span>

                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => router.push(`/officer/underwriting/${app.id}`)}
                                className="text-[9px] font-bold bg-primary text-white px-2 py-1 rounded-xs uppercase"
                              >
                                Underwrite
                              </button>
                              <button
                                onClick={() => setSelectedDrawerApp(app)}
                                className="text-[9px] font-bold border border-border bg-surface px-2 py-1 rounded-xs uppercase text-foreground-secondary"
                              >
                                Inspect
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Table Pagination Controls Footer */}
              {!isLoading && filteredApps.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-surface-elevated/45 border-t border-border/40 gap-3 select-none text-[11px]">
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground-secondary">Rows per page:</span>
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => table.setPageSize(Number(e.target.value))}
                      className="bg-surface border border-border rounded-sm py-1 px-1.5 font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-foreground-secondary">
                    Page <span className="font-bold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-bold text-foreground">{table.getPageCount()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="p-1 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                      className="p-1 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              )}

            </Card>

          </div>

          {/* ==========================================
              APPLICATION PREVIEW DRAWER (RIGHT-SIDE)
             ========================================== */}
          <Sheet
            isOpen={selectedDrawerApp !== null}
            onClose={() => setSelectedDrawerApp(null)}
            title="Application Intelligence"
            className="max-w-md w-full select-none"
          >
            {selectedDrawerApp && (
              <div className="space-y-6 text-xs pb-12 font-sans select-none">
                
                {/* Header summary info */}
                <div className="bg-surface-elevated/50 p-4 border border-border rounded-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-foreground-muted uppercase bg-surface border border-border px-2 py-0.5 rounded-xs">
                      ID: {selectedDrawerApp.id}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                      selectedDrawerApp.priority === "Critical" ? "text-critical bg-critical/10 border-critical/15 animate-pulse" : "text-foreground-secondary bg-surface border-border"
                    )}>
                      {selectedDrawerApp.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-sm shrink-0">
                      {selectedDrawerApp.avatar}
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-foreground leading-tight">{selectedDrawerApp.name}</h4>
                      <span className="text-[10px] text-foreground-secondary block mt-0.5 truncate max-w-[240px]">
                        Purpose: <b className="text-foreground">{selectedDrawerApp.purpose}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requested Loan Section */}
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <h5 className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest">Requested Loan Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface border border-border p-2.5 rounded-xs text-center">
                      <span className="text-[8px] text-foreground-muted block uppercase">Amount Requested</span>
                      <span className="font-mono font-bold text-sm text-foreground">₹{selectedDrawerApp.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-surface border border-border p-2.5 rounded-xs text-center">
                      <span className="text-[8px] text-foreground-muted block uppercase">Loan Class</span>
                      <span className="font-bold text-sm text-foreground-secondary">{selectedDrawerApp.loanType}</span>
                    </div>
                  </div>
                </div>

                {/* Income & Employment */}
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <h5 className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest">Incomes & Employment</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center border border-border/40 p-2 rounded-xs">
                      <span className="text-[8px] text-foreground-muted block uppercase">Monthly Income</span>
                      <span className="font-mono font-bold text-foreground">₹{selectedDrawerApp.income.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-center border border-border/40 p-2 rounded-xs">
                      <span className="text-[8px] text-foreground-muted block uppercase">Debt Load</span>
                      <span className="font-mono font-bold text-foreground">₹{selectedDrawerApp.debt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-center border border-border/40 p-2 rounded-xs">
                      <span className="text-[8px] text-foreground-muted block uppercase">Employment</span>
                      <span className="font-bold text-foreground-secondary truncate block">{selectedDrawerApp.employmentType}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Health, Credit Risk, Fraud Risk */}
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <h5 className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest">Risk Telemetry</h5>
                  <div className="space-y-2">
                    
                    <div className="flex justify-between items-center bg-surface border border-border p-2.5 rounded-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">Financial Health Score</span>
                        <span className="text-[9px] text-foreground-muted">Index built on liquidity and debt service</span>
                      </div>
                      <span className="font-mono font-extrabold text-foreground text-sm">{selectedDrawerApp.healthScore} / 100</span>
                    </div>

                    <div className="flex justify-between items-center bg-surface border border-border p-2.5 rounded-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">Credit default probability</span>
                        <span className="text-[9px] text-foreground-muted">Estimated default rate on credit lines</span>
                      </div>
                      <span className={cn(
                        "font-mono font-extrabold text-sm",
                        selectedDrawerApp.defaultProb >= 50 ? "text-critical" : selectedDrawerApp.defaultProb >= 25 ? "text-warning" : "text-positive"
                      )}>{selectedDrawerApp.defaultProb}%</span>
                    </div>

                    <div className="flex justify-between items-center bg-surface border border-border p-2.5 rounded-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">Identity Telemetry (Fraud Risk)</span>
                        <span className="text-[9px] text-foreground-muted">Device IP coordinates match checks</span>
                      </div>
                      <span className={cn(
                        "font-bold text-xs uppercase px-2 py-0.5 rounded-full border",
                        selectedDrawerApp.fraudRisk === "High" ? "text-critical bg-critical/5 border-critical/10 animate-pulse" : "text-positive bg-positive/5 border-positive/10"
                      )}>{selectedDrawerApp.fraudRisk}</span>
                    </div>

                  </div>
                </div>

                {/* AI Recommendation Explanation */}
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <h5 className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest">AI Recommendation Details</h5>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Recommendation:</span>
                      </span>
                      <span className="font-mono font-extrabold text-primary uppercase text-xs">
                        {selectedDrawerApp.aiRec} ({selectedDrawerApp.confidence}% confidence)
                      </span>
                    </div>
                    <p className="text-foreground-secondary leading-relaxed font-sans">
                      Applicant is classified as <b className="text-foreground">{selectedDrawerApp.aiRec}</b>. The primary factor influencing this prediction is the Debt-to-Income (DTI) ratio of {Math.round((selectedDrawerApp.expenses / selectedDrawerApp.income) * 100)}% combined with Experian bureau score logs.
                    </p>
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="space-y-2 pb-4 border-b border-border/40">
                  <h5 className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest">Recent Cash Flow Logs</h5>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {[
                      { desc: "Payroll Deposit / TCS Co.", amount: 85000, type: "credit" },
                      { desc: "Credit Card Payment / HDFC", amount: -12000, type: "debit" },
                      { desc: "Mortgage Auto-Debit / SBI", amount: -24000, type: "debit" }
                    ].map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-surface-elevated/40 p-2 border border-border/30 rounded-xs">
                        <span className="text-foreground-secondary truncate max-w-[200px]">{tx.desc}</span>
                        <span className={tx.type === "credit" ? "text-positive font-bold" : "text-foreground-secondary"}>
                          {tx.type === "credit" ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Row at bottom */}
                <div className="pt-2 flex flex-col gap-2 select-none">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedDrawerApp(null);
                        router.push(`/officer/underwriting/${selectedDrawerApp.id}`);
                      }}
                      className="w-full text-[10px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
                    >
                      Open Underwriting Workspace
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setSelectedDrawerApp(null);
                        router.push(`/officer/applicants/${selectedDrawerApp.id}`);
                      }}
                      variant="outline"
                      className="w-full text-[10px] uppercase font-sans font-bold cursor-pointer text-foreground"
                    >
                      Open Profile
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => toast.info(`Report generated for applicant "${selectedDrawerApp.name}".`)}
                      variant="secondary"
                      className="w-full text-[10px] uppercase font-sans font-bold cursor-pointer"
                    >
                      Generate PDF Report
                    </Button>

                    <Button
                      onClick={() => toast.success(`Document upload request message transmitted to applicant.`)}
                      variant="secondary"
                      className="w-full text-[10px] uppercase font-sans font-bold cursor-pointer"
                    >
                      Request Documents
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </Sheet>

          {/* ==========================================
              BULK ACTIONS FLOATING FOOTER PANEL
             ========================================== */}
          {selectedCount > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-elevated border border-border-strong rounded-md shadow-2xl p-4 flex items-center justify-between gap-6 max-w-2xl w-11/12 animate-slide-up select-none">
              
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-[10px]">
                  {selectedCount}
                </div>
                <div className="text-left font-sans">
                  <span className="font-extrabold text-foreground block text-[11px] leading-tight">Applications Selected</span>
                  <span className="text-[9px] text-foreground-muted block">Bulk decisions ready to log</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-end">
                <Button
                  onClick={() => setActiveBulkModal({ type: "assign", isOpen: true })}
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-3.5 text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                >
                  Assign Officer
                </Button>

                <Button
                  onClick={() => setActiveBulkModal({ type: "approve", isOpen: true })}
                  size="sm"
                  className="h-8.5 px-3.5 text-[9.5px] uppercase font-sans font-bold cursor-pointer bg-positive text-white hover:bg-positive/95"
                >
                  Bulk Approve
                </Button>

                <Button
                  onClick={() => setActiveBulkModal({ type: "reject", isOpen: true })}
                  size="sm"
                  className="h-8.5 px-3.5 text-[9.5px] uppercase font-sans font-bold cursor-pointer bg-critical text-white hover:bg-critical/95"
                >
                  Bulk Reject
                </Button>

                <Button
                  onClick={() => setActiveBulkModal({ type: "manual", isOpen: true })}
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-3.5 text-[9.5px] uppercase font-sans font-bold cursor-pointer text-warning hover:bg-warning/5"
                >
                  Manual Queue
                </Button>

                <Button
                  onClick={() => setActiveBulkModal({ type: "archive", isOpen: true })}
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-3.5 text-[9.5px] uppercase font-sans font-bold cursor-pointer text-critical hover:bg-critical/5 border-critical/20"
                >
                  Archive
                </Button>

                <button
                  onClick={() => setRowSelection({})}
                  className="p-2 rounded-sm text-foreground-muted hover:text-foreground hover:bg-surface-hover cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

            </div>
          )}

          {/* ==========================================
              CREATE APPLICATION MODAL
             ========================================== */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Register New Credit Application"
            className="max-w-md select-none font-sans"
          >
            <form onSubmit={handleCreateApplication} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Applicant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alok Sen"
                  value={newAppForm.name}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none placeholder-foreground-muted font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Loan Purpose / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Office Downpayment"
                  value={newAppForm.purpose}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-sm py-1.5 px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none placeholder-foreground-muted font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Loan Category</label>
                  <div className="relative">
                    <select
                      value={newAppForm.loanType}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, loanType: e.target.value as ApplicantDetail["loanType"] }))}
                      className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                    >
                      <option value="Home Loan">Home Loan</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Education Loan">Education Loan</option>
                      <option value="Car Loan">Car Loan</option>
                      <option value="Commercial Loan">Commercial Loan</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Employment Type</label>
                  <div className="relative">
                    <select
                      value={newAppForm.employmentType}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, employmentType: e.target.value as ApplicantDetail["employmentType"] }))}
                      className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                    >
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Credit Request Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newAppForm.amount}
                    onChange={(e) => setNewAppForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full bg-surface border border-border rounded-sm py-1.5 px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Monthly Net Income (₹)</label>
                  <input
                    type="number"
                    required
                    value={newAppForm.income}
                    onChange={(e) => setNewAppForm(prev => ({ ...prev, income: Number(e.target.value) }))}
                    className="w-full bg-surface border border-border rounded-sm py-1.5 px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-border/45">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
                >
                  Submit Application
                </Button>
              </div>

            </form>
          </Modal>

          {/* ==========================================
              BULK CONFIRMATION MODALS
             ========================================== */}
          <Modal
            isOpen={activeBulkModal !== null && activeBulkModal.isOpen}
            onClose={() => setActiveBulkModal(null)}
            title={
              activeBulkModal?.type === "assign" ? "Bulk Assign Credit Officer" :
              activeBulkModal?.type === "approve" ? "Confirm Bulk Decisions Approval" :
              activeBulkModal?.type === "reject" ? "Confirm Bulk Denial Decisions" :
              activeBulkModal?.type === "manual" ? "Re-route to Manual Underwriting" :
              "Confirm Bulk Archive Action"
            }
            className="max-w-md font-sans select-none"
          >
            <div className="space-y-4">
              
              <div className="text-xs text-foreground-secondary leading-relaxed">
                {activeBulkModal?.type === "assign" ? (
                  <div className="space-y-3">
                    <p>Select the loan officer to manage the {selectedCount} selected applications.</p>
                    <div className="relative">
                      <select
                        value={bulkAssignOfficer}
                        onChange={(e) => setBulkAssignOfficer(e.target.value)}
                        className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                      >
                        <option value="Officer Rahul">Officer Rahul (Senior Underwriter)</option>
                        <option value="Officer Priya">Officer Priya (Risk Auditor)</option>
                        <option value="Unassigned">Unassigned (Queue Pool)</option>
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-2 text-foreground-muted pointer-events-none" />
                    </div>
                  </div>
                ) : activeBulkModal?.type === "approve" ? (
                  <p>You are about to issue bulk auto-approvals for the <span className="font-extrabold text-foreground">{selectedCount}</span> selected files. This will dispatch notifications and transition statuses immediately.</p>
                ) : activeBulkModal?.type === "reject" ? (
                  <p>Confirm denying financing credit limits to the <span className="font-extrabold text-foreground">{selectedCount}</span> selected applicant files. Decision logs will record active auto-denials.</p>
                ) : activeBulkModal?.type === "manual" ? (
                  <p>Move the <span className="font-extrabold text-foreground">{selectedCount}</span> selected applications to Manual Underwriter queues, overriding auto-decision runs.</p>
                ) : (
                  <p>Are you sure you want to archive the <span className="font-extrabold text-foreground">{selectedCount}</span> selected cases? This moves them to storage tables and removes them from active queues.</p>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-border/40 mt-6">
                <Button
                  onClick={() => setActiveBulkModal(null)}
                  variant="outline"
                  size="sm"
                  className="text-[9.5px] uppercase font-sans font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkActionExecute}
                  size="sm"
                  className={cn(
                    "text-[9.5px] uppercase font-sans font-bold cursor-pointer text-white",
                    activeBulkModal?.type === "reject" || activeBulkModal?.type === "archive" ? "bg-critical" : "bg-primary"
                  )}
                >
                  Confirm Action
                </Button>
              </div>

            </div>
          </Modal>

        </>
      )}

    </PageContainer>
  );
}
