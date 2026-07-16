"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { 
  Search, 
  Calendar, 
  RotateCcw, 
  X, 
  ShieldAlert, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  CreditCard, 
  ChevronsUpDown, 
  Home, 
  Zap, 
  Briefcase, 
  Coffee, 
  HelpCircle, 
  SlidersHorizontal, 
  Settings2,
  TrendingUp, 
  FileText
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Popover } from "@/components/ui/Overlays";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { MetricCardShell } from "@/components/ui/ValueDisplay";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui/FeedbackState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { mockExtendedTransactions, ExtendedTransaction } from "@/lib/transactions_data";

// Helper to determine Risk Rating from Score
function getRiskRating(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score >= 90) return "Critical";
  if (score >= 70) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

// Format date in Indian style
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + " " + d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get standard Category Icon
function getCategoryIcon(category: string) {
  switch (category) {
    case "income":
      return <TrendingUp className="h-3 w-3 text-positive" />;
    case "housing":
      return <Home className="h-3 w-3 text-primary" />;
    case "utilities":
      return <Zap className="h-3 w-3 text-forecast" />;
    case "debt_repayment":
      return <CreditCard className="h-3 w-3 text-warning" />;
    case "business":
      return <Briefcase className="h-3 w-3 text-ai" />;
    case "leisure":
      return <Coffee className="h-3 w-3 text-purple-500" />;
    default:
      return <HelpCircle className="h-3 w-3 text-foreground-muted" />;
  }
}

export default function TransactionsExplorerPage() {
  // Database state (to allow inline updates like changing category, marking safe)
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>(mockExtendedTransactions);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRisk, setSelectedRisk] = useState("All Risks");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  
  // Controls & UX states
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [density, setDensity] = useState<"compact" | "comfort">("comfort");
  const [smartSearchText, setSmartSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Selected transaction for drawer detail view
  const [selectedTransaction, setSelectedTransaction] = useState<ExtendedTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [selectedCategoryInDrawer, setSelectedCategoryInDrawer] = useState("");

  // Initial load skeleton simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Brief loading trigger when filter settings change
  const triggerFilterLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  };

  // Sync edit states when a transaction is loaded into the drawer
  useEffect(() => {
    if (selectedTransaction) {
      setEditedNotes(selectedTransaction.notes);
      setSelectedCategoryInDrawer(selectedTransaction.category);
    }
  }, [selectedTransaction]);

  // NLP Smart Search Parsing Logic
  const handleSmartSearch = (text: string) => {
    setSmartSearchText(text);
    triggerFilterLoading();

    const lower = text.toLowerCase();
    
    // Reset standard filters first
    setSearchTerm("");
    setSelectedRisk("All Risks");
    setAmountRange({ min: "", max: "" });
    setDateRange("Custom Range");
    setSelectedCategory("All Categories");

    if (!text.trim()) {
      return;
    }

    // 1. Check for amount conditions (e.g. "above 10,000", "over 50000")
    const aboveMatch = lower.match(/(?:above|over|more than|greater than)\s*(?:₹|inr)?\s*([0-9,]+)/i);
    if (aboveMatch) {
      const parsedNum = aboveMatch[1].replace(/,/g, "");
      setAmountRange(prev => ({ ...prev, min: parsedNum }));
    }

    // 2. Check for risk level conditions (e.g. "high-risk", "critical")
    if (lower.includes("high-risk") || lower.includes("high risk")) {
      setSelectedRisk("High");
    } else if (lower.includes("critical")) {
      setSelectedRisk("Critical");
    }

    // 3. Check for specific food query or category keywords
    if (lower.includes("food") || lower.includes("restaurant") || lower.includes("dining")) {
      setSelectedCategory("leisure");
      setSearchTerm("Swiggy"); // Target food delivery mock items
    }

    // 4. Check for date conditions (e.g. "last month", "june")
    if (lower.includes("last month") || lower.includes("june")) {
      setDateRange("Last Quarter"); // Will include June 2026 data
    } else if (lower.includes("today") || lower.includes("recent")) {
      setDateRange("Last 30 Days");
    }

    // If no explicit pattern match, treat the whole string as normal merchant search term
    if (!aboveMatch && !lower.includes("risk") && !lower.includes("food") && !lower.includes("month")) {
      setSearchTerm(text);
    }
  };

  // Preset smart search chips definitions
  const searchChips = [
    { label: "transactions above ₹10,000", value: "transactions above ₹10,000" },
    { label: "food expenses last month", value: "food expenses last month" },
    { label: "high-risk transactions", value: "high-risk transactions" }
  ];

  // Helper colors for category types
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "income": return "bg-positive/10 text-positive border-positive/20";
      case "housing": return "bg-primary/10 text-primary border-primary/20";
      case "utilities": return "bg-forecast/10 text-forecast border-forecast/20";
      case "debt_repayment": return "bg-warning/10 text-warning border-warning/20";
      case "business": return "bg-ai/10 text-ai border-ai/20";
      case "leisure": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-surface-elevated text-foreground-secondary border-border";
    }
  };

  // Filter computation loop
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search text match
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesMerchant = tx.merchant.toLowerCase().includes(term);
        const matchesId = tx.id.toLowerCase().includes(term);
        const matchesNotes = tx.notes.toLowerCase().includes(term);
        if (!matchesMerchant && !matchesId && !matchesNotes) return false;
      }

      // 2. Account match
      if (selectedAccount !== "All Accounts" && tx.account !== selectedAccount) {
        return false;
      }

      // 3. Category match
      if (selectedCategory !== "All Categories" && tx.category !== selectedCategory) {
        return false;
      }

      // 4. Risk Rating match
      if (selectedRisk !== "All Risks") {
        const rating = getRiskRating(tx.riskScore);
        if (rating !== selectedRisk) return false;
      }

      // 5. Transaction Type match
      if (selectedType !== "All Types" && tx.type !== selectedType.toLowerCase()) {
        return false;
      }

      // 6. Status match
      if (selectedStatus !== "All Statuses" && tx.status !== selectedStatus.toLowerCase()) {
        return false;
      }

      // 7. Amount Range match
      if (amountRange.min && tx.amount < parseFloat(amountRange.min)) {
        return false;
      }
      if (amountRange.max && tx.amount > parseFloat(amountRange.max)) {
        return false;
      }

      // 8. Date Range filter
      const txDate = new Date(tx.date);
      const today = new Date("2026-07-09T11:17:21+05:30");
      if (dateRange === "Last 30 Days") {
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (txDate < thirtyDaysAgo) return false;
      } else if (dateRange === "Last Quarter") {
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (txDate < ninetyDaysAgo) return false;
      } else if (dateRange === "Year to Date") {
        const ytd = new Date("2026-01-01T00:00:00Z");
        if (txDate < ytd) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedAccount, selectedCategory, selectedRisk, selectedType, selectedStatus, dateRange, amountRange]);

  // Metric summaries calculations
  const summaries = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let flaggedCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === "credit") {
        inflow += tx.amount;
      } else {
        outflow += tx.amount;
      }
      if (tx.riskScore >= 70) {
        flaggedCount++;
      }
    });

    return {
      totalCount: filteredTransactions.length,
      inflow,
      outflow,
      flaggedCount
    };
  }, [filteredTransactions]);

  // Bulk operation actions handlers
  const handleBulkMarkSafe = (ids: string[]) => {
    setTransactions(prev =>
      prev.map(tx => ids.includes(tx.id) ? { ...tx, riskScore: 0 } : tx)
    );
    toast.success(`Successfully marked ${ids.length} transactions as verified safe.`);
  };

  const handleSingleMarkSafe = (id: string) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, riskScore: 0 } : tx)
    );
    // Sync current drawer if open
    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction(prev => prev ? { ...prev, riskScore: 0 } : null);
    }
    toast.success(`Transaction ${id} marked verified safe. Risk score reset to 0.`);
  };

  const handleCategoryChange = (newCat: string) => {
    if (!selectedTransaction) return;
    const catValue = newCat as ExtendedTransaction["category"];
    
    setTransactions(prev =>
      prev.map(tx => tx.id === selectedTransaction.id ? { ...tx, category: catValue } : tx)
    );
    setSelectedTransaction(prev => prev ? { ...prev, category: catValue } : null);
    setSelectedCategoryInDrawer(newCat);
    toast.success(`Transaction category modified to: ${newCat.replace("_", " ")}`);
  };

  const handleSaveNotes = () => {
    if (!selectedTransaction) return;
    setTransactions(prev =>
      prev.map(tx => tx.id === selectedTransaction.id ? { ...tx, notes: editedNotes } : tx)
    );
    setSelectedTransaction(prev => prev ? { ...prev, notes: editedNotes } : null);
    toast.success("Notes log updated successfully.");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedAccount("All Accounts");
    setSelectedCategory("All Categories");
    setSelectedRisk("All Risks");
    setSelectedType("All Types");
    setSelectedStatus("All Statuses");
    setDateRange("Last 30 Days");
    setAmountRange({ min: "", max: "" });
    setSmartSearchText("");
    triggerFilterLoading();
    toast.info("All search filter parameters cleared.");
  };

  // Table Column Definitions
  const columns = useMemo<ColumnDef<ExtendedTransaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded-xs border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded-xs border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "merchant",
        header: ({ column }) => (
          <button 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-sans font-bold hover:text-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            Merchant
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground truncate max-w-[180px]">{tx.merchant}</span>
              <span className="text-[10px] text-foreground-muted font-mono tracking-tight">{tx.id}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <button 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-sans font-bold hover:text-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            Category
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const cat = row.original.category;
          return (
            <span className={cn("inline-flex items-center gap-1.5 capitalize border text-[10px] px-2.5 py-0.5 rounded-xs select-none font-medium", getCategoryStyles(cat))}>
              {getCategoryIcon(cat)}
              {cat.replace("_", " ")}
            </span>
          );
        },
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-sans font-bold hover:text-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            Date
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-foreground-secondary whitespace-nowrap text-xs font-medium">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: "account",
        header: "Account",
        cell: ({ row }) => (
          <span className="text-foreground-secondary truncate max-w-[125px] block text-xs">
            {row.original.account}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-sans font-bold hover:text-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            Amount
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const tx = row.original;
          const isCredit = tx.type === "credit";
          return (
            <span className={cn("font-mono font-bold whitespace-nowrap text-sm tracking-tight", isCredit ? "text-positive" : "text-foreground")}>
              {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <span className={cn(
              "text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border select-none",
              type === "credit" 
                ? "bg-positive/10 text-positive border-positive/20" 
                : "bg-surface-elevated text-foreground-secondary border-border"
            )}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "riskScore",
        header: ({ column }) => (
          <button 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-sans font-bold hover:text-foreground cursor-pointer select-none text-[10px] uppercase tracking-wider text-foreground-muted"
          >
            Risk
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const rating = getRiskRating(row.original.riskScore);
          return <RiskBadge rating={rating} />;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return <StatusBadge status={status} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedTransaction(tx);
                  setIsDrawerOpen(true);
                }}
                className="h-8 w-8 p-0 hover:bg-surface-hover"
                title="View details drawer"
              >
                <Eye className="h-4.5 w-4.5 text-foreground-secondary" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  // TanStack table configs
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: filteredTransactions,
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
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Derived related transactions list in drawer
  const relatedTransactions = useMemo(() => {
    if (!selectedTransaction) return [];
    return transactions.filter(
      (tx) => tx.category === selectedTransaction.category && tx.id !== selectedTransaction.id
    ).slice(0, 3);
  }, [selectedTransaction, transactions]);

  // Export mock trigger
  const triggerExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Compiling financial ledger records...",
        success: () => {
          return "Ledger database downloaded successfully as CSV.";
        },
        error: "Export failed."
      }
    );
  };

  return (
    <PageContainer className="pb-24">
      {/* Page Header */}
      <SectionHeader 
        title="Secure Audited Ledger" 
        description="Audit, evaluate, search, and verify all transactions running through your banking and credit accounts."
        actions={
          <div className="flex items-center gap-3">
            {/* Quick simulated error state trigger */}
            <div className="flex items-center gap-2 border border-border p-1.5 px-2.5 rounded-sm bg-surface-elevated/45 text-xs font-sans font-medium">
              <label htmlFor="errorToggle" className="text-foreground-secondary cursor-pointer select-none">
                Simulate Sync Failure
              </label>
              <input
                id="errorToggle"
                type="checkbox"
                checked={hasError}
                onChange={(e) => setHasError(e.target.checked)}
                className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={triggerExport}
              className="gap-2 cursor-pointer font-semibold"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* ERROR SIMULATION BOARD */}
      {hasError ? (
        <ErrorState 
          title="Secure Sync Connection Failure"
          description="Failed to sync active ledger transactions due to socket timeouts inside your local bank sweeps node. Click retry to reconnect secure channels."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500);
            toast.success("Successfully re-established bank sweep connections.");
          }}
        />
      ) : (
        <>
          {/* 1. METRICS DASHBOARD STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCardShell 
              title="Total Transactions"
              value={summaries.totalCount}
              currency=""
              description="Matching current filter rules"
              notation="standard"
            />
            <MetricCardShell 
              title="Total Inflow"
              value={summaries.inflow}
              currency="INR"
              description="Credits received this period"
              notation="standard"
              className="border-l-2 border-l-positive"
            />
            <MetricCardShell 
              title="Total Outflow"
              value={summaries.outflow}
              currency="INR"
              description="Debits processed this period"
              notation="standard"
              className="border-l-2 border-l-critical"
            />
            <MetricCardShell 
              title="Flagged Transactions"
              value={summaries.flaggedCount}
              currency=""
              description="AI Risk Index >= 70"
              notation="standard"
              aiPowered
              className={cn("border-l-2 border-l-critical", summaries.flaggedCount > 0 && "bg-critical/5 border-critical/20")}
            />
          </div>

          {/* 2. SMART SEARCH CARD */}
          <Card className="bg-surface border border-border/80 p-5 md:p-6 flex flex-col gap-4">
            <div className="space-y-1 select-none">
              <h2 className="text-xs uppercase tracking-widest text-ai font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-ai animate-pulse" /> AI Smart Search
              </h2>
              <p className="text-[11px] text-foreground-secondary">
                Search using natural parameters. Examples: search value thresholds, merchant keywords, or risk flags.
              </p>
            </div>
            
            <div className="flex flex-col gap-3.5">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 h-4.5 w-4.5 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={smartSearchText}
                  onChange={(e) => handleSmartSearch(e.target.value)}
                  placeholder="Ask AI: e.g. 'transactions above ₹10,000' or 'food expenses last month'..."
                  className="w-full h-11 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-sm text-sm font-sans placeholder-foreground-muted focus:border-ai focus:outline-none transition-all shadow-sm"
                />
                {smartSearchText && (
                  <button
                    onClick={() => {
                      setSmartSearchText("");
                      clearAllFilters();
                    }}
                    className="absolute right-3.5 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Preset search query suggestion chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-foreground-muted select-none">Suggestions:</span>
                {searchChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSmartSearch(chip.value)}
                    className={cn(
                      "px-3 py-1 rounded-full border text-[11px] font-sans font-medium transition-all cursor-pointer select-none",
                      smartSearchText === chip.value
                        ? "bg-ai text-white border-ai shadow-xs"
                        : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover hover:border-border-strong"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* 3. MULTI-FILTER BAR */}
          <div className="flex flex-col gap-4 bg-surface p-5 border border-border/80 rounded-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Standard text search */}
              <div className="relative flex items-center min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    triggerFilterLoading();
                  }}
                  placeholder="Filter by merchant or ID..."
                  className="w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-sm text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filtering Select controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date range picker */}
                <div className="flex items-center gap-1.5 bg-surface-elevated border border-border rounded-sm h-10 px-3">
                  <Calendar className="h-4 w-4 text-foreground-muted" />
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      triggerFilterLoading();
                    }}
                    className="bg-transparent text-xs font-sans text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last Quarter">Last Quarter (90D)</option>
                    <option value="Year to Date">Year to Date (YTD)</option>
                    <option value="Custom Range">All Transactions</option>
                  </select>
                </div>

                {/* Account selector */}
                <select
                  value={selectedAccount}
                  onChange={(e) => {
                    setSelectedAccount(e.target.value);
                    triggerFilterLoading();
                  }}
                  className="bg-surface-elevated text-xs font-sans text-foreground font-semibold border border-border rounded-sm h-10 px-3 cursor-pointer outline-none focus:border-primary"
                >
                  <option value="All Accounts">All Accounts</option>
                  <option value="HDFC Current (A/C 1145)">HDFC Current</option>
                  <option value="Yes Bank Savings (A/C 9812)">Yes Bank Savings</option>
                  <option value="Corporate Credit Card (CCN-2983)">Corporate Card</option>
                </select>

                {/* Category selector */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    triggerFilterLoading();
                  }}
                  className="bg-surface-elevated text-xs font-sans text-foreground font-semibold border border-border rounded-sm h-10 px-3 cursor-pointer outline-none focus:border-primary capitalize"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="income">Income</option>
                  <option value="housing">Housing</option>
                  <option value="utilities">Utilities</option>
                  <option value="debt_repayment">Debt Repayment</option>
                  <option value="business">Business</option>
                  <option value="leisure">Leisure / Entertainment</option>
                  <option value="other">Other Outflows</option>
                </select>

                {/* Risk Selector */}
                <select
                  value={selectedRisk}
                  onChange={(e) => {
                    setSelectedRisk(e.target.value);
                    triggerFilterLoading();
                  }}
                  className="bg-surface-elevated text-xs font-sans text-foreground font-semibold border border-border rounded-sm h-10 px-3 cursor-pointer outline-none focus:border-primary"
                >
                  <option value="All Risks">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Critical">Critical Risk</option>
                </select>

                {/* Toggle Show More Filter drawer options */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className="h-10 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showMoreFilters ? "Hide Filters" : "More Filters"}
                </Button>

                {/* Clear filters button */}
                {(searchTerm || selectedAccount !== "All Accounts" || selectedCategory !== "All Categories" || selectedRisk !== "All Risks" || selectedType !== "All Types" || selectedStatus !== "All Statuses" || dateRange !== "Last 30 Days" || amountRange.min || amountRange.max) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-10 text-xs font-semibold text-critical hover:bg-critical/5 gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* EXPANDABLE EXTRA FILTERS STRIP */}
            {showMoreFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/60 animate-slideDown text-xs text-foreground-secondary select-none">
                {/* Transaction Type */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-foreground-muted uppercase tracking-wider text-[10px]">Transaction Type</span>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      triggerFilterLoading();
                    }}
                    className="bg-surface-elevated border border-border rounded-sm h-9 px-2.5 outline-none focus:border-primary"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Credit">Credit (Inflow)</option>
                    <option value="Debit">Debit (Outflow)</option>
                  </select>
                </div>

                {/* Transaction Status */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-foreground-muted uppercase tracking-wider text-[10px]">Status</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      triggerFilterLoading();
                    }}
                    className="bg-surface-elevated border border-border rounded-sm h-9 px-2.5 outline-none focus:border-primary"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {/* Amount ranges filters */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="font-bold text-foreground-muted uppercase tracking-wider text-[10px]">Amount Range (INR)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min amount"
                      value={amountRange.min}
                      onChange={(e) => {
                        setAmountRange(prev => ({ ...prev, min: e.target.value }));
                        triggerFilterLoading();
                      }}
                      className="w-full h-9 px-2.5 bg-surface-elevated border border-border text-xs rounded-sm outline-none focus:border-primary"
                    />
                    <span className="text-foreground-muted">-</span>
                    <input
                      type="number"
                      placeholder="Max amount"
                      value={amountRange.max}
                      onChange={(e) => {
                        setAmountRange(prev => ({ ...prev, max: e.target.value }));
                        triggerFilterLoading();
                      }}
                      className="w-full h-9 px-2.5 bg-surface-elevated border border-border text-xs rounded-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. TABLE CONTROLS TOOLBAR & TABLE PANEL */}
          <div className="space-y-4">
            
            {/* Table Settings control strip */}
            <div className="flex items-center justify-between flex-wrap gap-4 select-none">
              <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                <span className="font-semibold text-foreground">{summaries.totalCount}</span>
                <span>transaction records matched</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Density adjustment button */}
                <div className="flex items-center border border-border p-1 rounded-sm bg-surface-elevated/45 text-xs">
                  <button
                    onClick={() => setDensity("compact")}
                    className={cn(
                      "px-2.5 py-1 rounded-xs transition-colors font-bold cursor-pointer",
                      density === "compact" ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                    )}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => setDensity("comfort")}
                    className={cn(
                      "px-2.5 py-1 rounded-xs transition-colors font-bold cursor-pointer",
                      density === "comfort" ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                    )}
                  >
                    Comfort
                  </button>
                </div>

                {/* Column Visibility Customize Popover */}
                <Popover
                  trigger={
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 font-semibold text-xs cursor-pointer">
                      <Settings2 className="h-4 w-4" />
                      Columns
                    </Button>
                  }
                  className="w-48 bg-surface-elevated border border-border rounded-sm shadow-xl p-3 text-xs select-none"
                >
                  <div className="space-y-2.5">
                    <span className="font-bold text-foreground block border-b border-border/60 pb-1.5 mb-1.5">Toggle Visibility</span>
                    {table.getAllLeafColumns().map((column) => {
                      if (column.id === "select" || column.id === "actions") return null;
                      return (
                        <label key={column.id} className="flex items-center gap-2 cursor-pointer font-medium text-foreground-secondary hover:text-foreground py-0.5">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="rounded-xs text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer border-border"
                          />
                          <span className="capitalize">{column.id.replace("riskScore", "Risk Rating")}</span>
                        </label>
                      );
                    })}
                  </div>
                </Popover>
              </div>
            </div>

            {/* BULK ACTIONS BOX */}
            {table.getSelectedRowModel().rows.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm flex items-center justify-between flex-wrap gap-4 animate-fadeIn">
                <span className="text-xs font-semibold text-primary font-sans select-none">
                  {table.getSelectedRowModel().rows.length} transaction record(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success(`Exported ${table.getSelectedRowModel().rows.length} selected ledger rows as CSV.`);
                      table.resetRowSelection();
                    }}
                    className="text-xs py-1.5 font-semibold cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleBulkMarkSafe(table.getSelectedRowModel().rows.map(r => r.original.id));
                      table.resetRowSelection();
                    }}
                    className="text-xs py-1.5 font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-positive" />
                    Mark Safe
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast.info(`Bulk compliance logging triggered for ${table.getSelectedRowModel().rows.length} transactions. Auditing files dispatched.`);
                      table.resetRowSelection();
                    }}
                    className="text-xs py-1.5 font-semibold cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Bulk Investigate
                  </Button>
                </div>
              </div>
            )}

            {/* RENDER BODY STATES */}
            {isLoading ? (
              // Loading Skeleton State
              <Card className="border border-border/80 overflow-hidden bg-surface">
                <div className="p-4 space-y-4">
                  <div className="flex gap-4 border-b border-border/40 pb-4">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : filteredTransactions.length === 0 ? (
              // Empty State
              <EmptyState 
                title="Zero Matching Ledger Entries"
                description="No transaction items match the selected filters or smart search query parameters. Try modifying values or resetting."
                actionLabel="Reset Explorer Filters"
                onAction={clearAllFilters}
                icon={Search}
              />
            ) : (
              <>
                {/* 5A. DESKTOP VIEWPORT TABLE */}
                <div className="hidden md:block">
                  <Card className="border border-border/80 overflow-hidden bg-surface">
                    <div className="overflow-x-auto relative">
                      <table className="w-full text-left border-collapse font-sans text-foreground-secondary select-none">
                        <thead>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-surface-elevated/45 border-b border-border/85 sticky top-0 z-10">
                              {headerGroup.headers.map((header) => (
                                <th 
                                  key={header.id} 
                                  className="p-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody className="divide-y divide-border/45">
                          {table.getRowModel().rows.map((row) => (
                            <tr 
                              key={row.id} 
                              onClick={() => {
                                setSelectedTransaction(row.original);
                                setIsDrawerOpen(true);
                              }}
                              className={cn(
                                "hover:bg-surface-hover/60 transition-colors cursor-pointer group focus-within:bg-surface-hover/80 outline-none",
                                row.getIsSelected() && "bg-primary/5 hover:bg-primary/10"
                              )}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td 
                                  key={cell.id} 
                                  className={cn(
                                    "transition-all border-none font-medium",
                                    density === "compact" ? "p-2.5 px-4" : "p-4"
                                  )}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* 5B. MOBILE VIEWPORT CARDS (Viewport under 'md') */}
                <div className="block md:hidden space-y-4">
                  {table.getRowModel().rows.map((row) => {
                    const tx = row.original;
                    const isCredit = tx.type === "credit";
                    const rating = getRiskRating(tx.riskScore);
                    return (
                      <Card 
                        key={tx.id} 
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsDrawerOpen(true);
                        }}
                        className={cn(
                          "border border-border/80 bg-surface active:scale-[0.99] transition-transform cursor-pointer",
                          row.getIsSelected() && "border-primary bg-primary/5"
                        )}
                      >
                        <CardContent className="p-4 space-y-3.5">
                          {/* Merchant Title & Checkbox */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div onClick={(e) => e.stopPropagation()} className="mt-1">
                                <input
                                  type="checkbox"
                                  checked={row.getIsSelected()}
                                  onChange={row.getToggleSelectedHandler()}
                                  className="rounded-xs border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-foreground truncate block text-sm">
                                  {tx.merchant}
                                </span>
                                <span className="text-[10px] text-foreground-muted font-mono tracking-tight block mt-0.5">
                                  {tx.id} | {tx.account.split(" ")[0]}
                                </span>
                              </div>
                            </div>
                            
                            {/* Amount tag */}
                            <span className={cn("font-mono font-bold whitespace-nowrap text-sm tracking-tight", isCredit ? "text-positive" : "text-foreground")}>
                              {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Categories & Type indicators */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
                            <span className="text-[10px] text-foreground-muted font-sans font-medium">
                              {formatDate(tx.date).split(" ")[0]} {formatDate(tx.date).split(" ")[1]}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("inline-flex items-center gap-1 capitalize text-[9px] px-2 py-0.5 rounded-xs select-none border font-bold", getCategoryStyles(tx.category))}>
                                {tx.category.replace("_", " ")}
                              </span>
                              <RiskBadge rating={rating} className="scale-90" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 6. TABLE PAGINATION CONTROLS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none pt-2 border-t border-border/40">
                  <div className="flex items-center gap-4 text-xs text-foreground-secondary font-medium">
                    <div className="flex items-center gap-2">
                      <span>Rows per page:</span>
                      <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="bg-surface-elevated border border-border rounded-sm h-8 px-2 outline-none cursor-pointer focus:border-primary"
                      >
                        {[5, 10, 20, 25].map(pageSize => (
                          <option key={pageSize} value={pageSize}>{pageSize}</option>
                        ))}
                      </select>
                    </div>
                    <span>
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="text-xs h-8 cursor-pointer font-semibold"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="text-xs h-8 cursor-pointer font-semibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* 7. SECURE TRANSACTION AUDIT DETAILS DRAWER */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTransaction(null);
        }}
        title="Ledger Compliance Audit"
        className="w-full max-w-md"
      >
        {selectedTransaction && (
          <div className="space-y-6 font-sans text-xs text-foreground-secondary select-none">
            
            {/* Header Value card block */}
            <div className="p-4 rounded-sm bg-surface-elevated border border-border flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] text-foreground-muted font-mono font-bold tracking-widest uppercase">Transaction ID: {selectedTransaction.id}</span>
                <StatusBadge status={selectedTransaction.status} />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading truncate mt-1">{selectedTransaction.merchant}</h3>
              
              <div className="flex justify-between items-baseline mt-2 border-t border-border/60 pt-3">
                <span className="text-[11px] text-foreground-muted">Amount</span>
                <span className={cn("font-mono text-xl font-extrabold tracking-tight", selectedTransaction.type === "credit" ? "text-positive" : "text-foreground")}>
                  {selectedTransaction.type === "credit" ? "+" : "-"}₹{selectedTransaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CATEGORY & ACCOUNT UPDATES */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-foreground-muted uppercase tracking-wider text-[9px]">Account Tag</span>
                <div className="h-9 px-3 bg-surface-elevated/40 border border-border/80 rounded-xs flex items-center gap-2 text-foreground font-medium">
                  <CreditCard className="h-4 w-4 text-foreground-muted" />
                  <span className="truncate">{selectedTransaction.account.split(" ")[0]}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-foreground-muted uppercase tracking-wider text-[9px]">Category Class</span>
                <select
                  value={selectedCategoryInDrawer}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="bg-surface-elevated border border-border rounded-xs h-9 px-2.5 font-medium outline-none focus:border-primary cursor-pointer capitalize"
                >
                  <option value="income">Income</option>
                  <option value="housing">Housing</option>
                  <option value="utilities">Utilities</option>
                  <option value="debt_repayment">Debt Repayment</option>
                  <option value="business">Business</option>
                  <option value="leisure">Leisure</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* AI RISK PROFILE ANALYSIS & ATTRIBUTION */}
            <div className="space-y-3.5 border-t border-border/60 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-ai" /> AI Risk Profile Audit
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground-muted">Risk Score:</span>
                  <span className={cn("font-bold font-mono text-sm", selectedTransaction.riskScore >= 70 ? "text-critical" : selectedTransaction.riskScore >= 30 ? "text-warning" : "text-positive")}>
                    {selectedTransaction.riskScore}%
                  </span>
                </div>
              </div>

              {/* Progress SHAP Feature weights visualization */}
              <div className="space-y-3 p-3.5 bg-surface-elevated/40 border border-border/80 rounded-sm">
                <span className="text-[10px] font-semibold text-foreground block">SHAP Explainer Feature Impact:</span>
                
                {selectedTransaction.riskScore >= 70 ? (
                  // High Risk Attributions
                  <div className="space-y-2.5 text-[11px]">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Unusual Transfer Destination</span>
                        <span className="text-critical font-bold">+45%</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-critical w-[45%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Deviation from Monthly Size Average</span>
                        <span className="text-critical font-bold">+30%</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-critical w-[30%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Account Geography/VPN Mismatch</span>
                        <span className="text-critical font-bold">+17%</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-critical w-[17%]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Low Risk Attributions
                  <div className="space-y-2.5 text-[11px]">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Trusted Counterparty History</span>
                        <span className="text-positive font-bold">-60%</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-positive w-[60%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Consistent Account Cohort Coherence</span>
                        <span className="text-positive font-bold">-25%</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-positive w-[25%]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI DIAGNOSTICS & EXPLANATION */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-ai animate-pulse" /> Generative AI Advisor Analysis
              </h4>
              <p className="p-3 bg-ai/5 border border-ai/20 rounded-sm italic leading-relaxed text-[11px] border-l-2 border-l-ai text-foreground-secondary">
                “{selectedTransaction.aiExplanation}”
              </p>
            </div>

            {/* BEHAVIOR & AVERAGE COMPARISON */}
            <div className="space-y-3.5 border-t border-border/60 pt-4">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" /> Behavior Comparison
              </h4>
              <div className="space-y-2">
                <p className="text-[11px] leading-relaxed text-foreground-secondary">
                  {selectedTransaction.behaviorComparison}
                </p>
                {/* Visual comparative bar */}
                <div className="space-y-2.5 p-3 bg-surface-elevated/40 border border-border/80 rounded-sm text-[10px] font-mono">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Category Monthly Average</span>
                      <span className="font-bold">₹12,400.00</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-foreground-muted w-[50%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Current Transaction Value</span>
                      <span className="font-bold text-foreground">₹{selectedTransaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", selectedTransaction.amount > 12400 ? "bg-critical" : "bg-positive")} style={{ width: `${Math.min(100, (selectedTransaction.amount / 24800) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RELATED TRANSACTIONS */}
            {relatedTransactions.length > 0 && (
              <div className="space-y-2.5 border-t border-border/60 pt-4">
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Related Period Transactions</h4>
                <div className="space-y-2">
                  {relatedTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-2 bg-surface border border-border/40 rounded-xs flex items-center justify-between gap-3 text-[11px]"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-foreground truncate block">{tx.merchant}</span>
                        <span className="text-[9px] text-foreground-muted font-mono">{formatDate(tx.date).split(" ")[0]}</span>
                      </div>
                      <span className="font-mono font-semibold">
                        ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT NOTE LOG EDITOR */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <label htmlFor="drawerNotes" className="font-bold text-foreground-muted uppercase tracking-wider text-[9px] block">Audit Logs & Notes</label>
              <textarea
                id="drawerNotes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Log internal comments, check dates, or reference invoices here..."
                rows={3}
                className="w-full p-2.5 bg-surface-elevated border border-border text-xs rounded-sm outline-none focus:border-primary resize-none font-sans text-foreground"
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="text-[10px] h-8 font-semibold cursor-pointer"
                >
                  Save Note
                </Button>
              </div>
            </div>

            {/* DRAWER ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-border mt-6">
              {selectedTransaction.riskScore > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleSingleMarkSafe(selectedTransaction.id);
                  }}
                  className="flex-1 text-[11px] py-2 h-9 font-semibold text-positive border-positive/30 hover:bg-positive/5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Safe
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                onClick={() => {
                  toast.info(`Compliance ticket created for: ${selectedTransaction.id}. Compliance office notified.`);
                  setIsDrawerOpen(false);
                }}
                className="flex-1 text-[11px] py-2 h-9 font-semibold cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4" />
                Investigate
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => {
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 1200)),
                    {
                      loading: "Compiling file audit summaries...",
                      success: "Audit report generated and ready. PDF download started.",
                      error: "Compilation failed."
                    }
                  );
                }}
                className="flex-1 text-[11px] py-2 h-9 font-semibold cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Report
              </Button>
            </div>

          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}
