"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  RefreshCw,
  Download,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Check,
  MoreVertical,
  Play,
  RotateCcw,
  Archive,
  Trash2,
  Copy,
  Info,
  Layers,
  Activity,
  Calendar,
  User,
  ExternalLink,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  GitBranch,
  Terminal,
  Clock,
  Settings,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  INITIAL_MODELS,
  MOCK_KPIS,
  KPI_SPARKLINES,
  MOCK_FRAMEWORKS,
  MOCK_ENVIRONMENTS,
  MOCK_STATUSES,
  MOCK_HEALTHS,
  MOCK_OWNERS,
  MOCK_TAGS,
  AIModel,
  ModelStatus,
  ModelHealth,
  ModelFramework,
  ModelEnvironment,
  VersionLog,
  EnvironmentStatus,
  ModelActivity,
  MetricSnapshot
} from "@/lib/models_data";

// Custom color values matching theme variables
const COLORS = {
  primary: "#4F7CFF",
  ai: "#8B5CF6",
  forecast: "#06B6D4",
  positive: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  secondary: "#64748B",
  muted: "#94A3B8"
};

export default function AIModelRegistryPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Data States
  const [models, setModels] = useState<AIModel[]>([]);

  // Directory layout selection (Table View vs. Card View)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Sorting & Selections
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"compact" | "comfortable" | "loose">("comfortable");

  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterEnvironment, setFilterEnvironment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFramework, setFilterFramework] = useState("All");
  const [filterVersion, setFilterVersion] = useState("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState("All"); // All, 30 Days, 90 Days, 1 Year
  const [filterOwner, setFilterOwner] = useState("All");
  const [filterTag, setFilterTag] = useState("All");

  // Drawer details & Dialog states
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState("overview");

  // Dialog triggers
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [targetDeployEnvironment, setTargetDeployEnvironment] = useState<ModelEnvironment>("Staging");

  // Create Model wizard steps state
  const [createStep, setCreateStep] = useState(1);
  const [newModelData, setNewModelData] = useState({
    name: "",
    type: "Credit Risk Prediction",
    description: "",
    owner: "Credit Ops",
    version: "v1.0.0",
    framework: "XGBoost" as ModelFramework,
    datasetName: "",
    featureCount: 10,
    repositoryLink: "",
    tags: [] as string[],
    targetEnvironment: "Development" as ModelEnvironment
  });

  // Sync data safely on mount
  useEffect(() => {
    setMounted(true);
    setModels(INITIAL_MODELS);
    setLastSyncTime(new Date().toLocaleTimeString());

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Sync / Refresh trigger
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setRowSelection({});
    
    setTimeout(() => {
      setModels(INITIAL_MODELS);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("AI Model Registry listings re-synchronized.");
    }, 600);
  }, []);

  // Update specific model in state wrapper
  const updateModelInState = useCallback((updated: AIModel) => {
    setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (selectedModel && selectedModel.id === updated.id) {
      setSelectedModel(updated);
    }
  }, [selectedModel]);

  // Dispatch model audit log
  const dispatchModelAudit = useCallback((model: AIModel, type: ModelActivity["type"], detail: string) => {
    const activity: ModelActivity = {
      id: `act-m-${Date.now()}`,
      type,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      operator: "Rahul Chahar (AI Engineer)",
      detail
    };
    const updatedModel = {
      ...model,
      activities: [activity, ...model.activities]
    };
    updateModelInState(updatedModel);
  }, [updateModelInState]);

  // Reset Filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType("All");
    setFilterEnvironment("All");
    setFilterStatus("All");
    setFilterFramework("All");
    setFilterVersion("All");
    setFilterCreatedDate("All");
    setFilterOwner("All");
    setFilterTag("All");
    toast.info("Models registry filter parameters cleared.");
  }, []);

  // Save Views preferences
  const handleSaveFilterView = useCallback(() => {
    toast.success("Default model directory visibility view saved.");
  }, []);

  // Filters logic mapping
  const filteredModelsList = useMemo(() => {
    return models.filter((model) => {
      // 1. Text Search
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Type filter
      const matchesType = filterType === "All" || model.type === filterType;

      // 3. Environment filter
      const matchesEnv = filterEnvironment === "All" || model.environment === filterEnvironment;

      // 4. Status filter
      const matchesStatus = filterStatus === "All" || model.status === filterStatus;

      // 5. Framework filter
      const matchesFramework = filterFramework === "All" || model.framework === filterFramework;

      // 6. Owner filter
      const matchesOwner = filterOwner === "All" || model.owner === filterOwner;

      // 7. Version filter
      const matchesVersion = filterVersion === "All" || model.version.startsWith(filterVersion);

      // 8. Created Date filter
      let matchesCreatedDate = true;
      if (filterCreatedDate !== "All") {
        const created = new Date(model.createdDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - created) / (1000 * 3600 * 24);
        if (filterCreatedDate === "30Days") matchesCreatedDate = diffDays <= 30;
        else if (filterCreatedDate === "90Days") matchesCreatedDate = diffDays <= 90;
        else if (filterCreatedDate === "1Year") matchesCreatedDate = diffDays <= 365;
      }

      // 9. Tag filter
      const matchesTag = filterTag === "All" || model.tags.includes(filterTag);

      return (
        matchesSearch &&
        matchesType &&
        matchesEnv &&
        matchesStatus &&
        matchesFramework &&
        matchesOwner &&
        matchesVersion &&
        matchesCreatedDate &&
        matchesTag
      );
    });
  }, [
    models,
    searchQuery,
    filterType,
    filterEnvironment,
    filterStatus,
    filterFramework,
    filterOwner,
    filterVersion,
    filterCreatedDate,
    filterTag
  ]);

  // Derived KPI ribbon statistics
  const kpis = useMemo(() => {
    const total = models.length;
    const production = models.filter(m => m.status === "Production").length;
    const staging = models.filter(m => m.status === "Staging").length;
    const archived = models.filter(m => m.status === "Archived").length;
    const healthy = models.filter(m => m.health === "Healthy").length;
    const attention = models.filter(m => m.health === "Degraded" || m.health === "Offline").length;
    
    // Average accuracy (excluding archived baseline if possible or across all active)
    const activeModels = models.filter(m => m.status !== "Archived");
    const avgAccuracy = activeModels.length > 0
      ? Math.round((activeModels.reduce((acc, curr) => acc + curr.accuracy, 0) / activeModels.length) * 10) / 10
      : 0;

    const predictionsToday = models.reduce((acc, curr) => acc + (curr.status === "Production" ? 85000 : 0), 0); // simulated volume

    return {
      total,
      production,
      staging,
      archived,
      healthy,
      attention,
      avgAccuracy,
      predictionsToday
    };
  }, [models]);

  // Model actions triggers
  const handleOpenDrawer = useCallback((model: AIModel, tab = "overview") => {
    setSelectedModel(model);
    setDrawerActiveTab(tab);
    setIsDrawerOpen(true);
  }, []);

  // Deploy simulation
  const handleDeployClick = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setTargetDeployEnvironment("Staging");
    setIsDeployOpen(true);
  }, []);

  const handleDeploySubmit = () => {
    if (!selectedModel) return;

    // Simulate promotion logic
    const statusMap: Record<string, ModelStatus> = {
      Development: "Development",
      Testing: "Staging",
      Staging: "Staging",
      Production: "Production"
    };

    const targetStatus = statusMap[targetDeployEnvironment] || "Staging";
    const updatedEnvironments = selectedModel.environments.map(env => {
      if (env.name === targetDeployEnvironment) {
        return {
          ...env,
          version: selectedModel.version,
          health: "Healthy" as ModelHealth,
          deployedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          status: "Active" as const
        };
      }
      return env;
    });

    const updatedModel: AIModel = {
      ...selectedModel,
      environment: targetDeployEnvironment,
      status: targetStatus,
      health: "Healthy",
      environments: updatedEnvironments
    };

    updateModelInState(updatedModel);
    dispatchModelAudit(updatedModel, "Deployment Completed", `Model version ${selectedModel.version} successfully deployed to [${targetDeployEnvironment}] cluster.`);
    setIsDeployOpen(false);
    toast.success(`Successfully deployed ${selectedModel.name} ${selectedModel.version} to ${targetDeployEnvironment}.`);
  };

  // Rollback simulation
  const handleRollbackClick = useCallback((model: AIModel) => {
    if (model.versions.length < 2) {
      toast.error("No previous stable versions discovered in directory. Rollback denied.");
      return;
    }

    const previous = model.versions[1]; // older version
    if (confirm(`Roll back model '${model.name}' from active ${model.version} to previous stable release ${previous.version}?`)) {
      const rollbackVersion = previous.version;
      const updatedVersions = model.versions.filter(v => v.version !== rollbackVersion);

      const updatedModel: AIModel = {
        ...model,
        version: rollbackVersion,
        accuracy: previous.accuracy * 100, // format back
        latency: previous.latency,
        health: "Healthy",
        versions: updatedVersions
      };

      updateModelInState(updatedModel);
      dispatchModelAudit(updatedModel, "Rollback", `Rolled back production version weights to stable baseline release ${rollbackVersion}.`);
      toast.success(`Rolled back ${model.name} to ${rollbackVersion}.`);
    }
  }, [updateModelInState, dispatchModelAudit]);

  // Archive model simulation
  const handleArchiveClick = useCallback((model: AIModel) => {
    if (confirm(`Archive active risk predictor '${model.name}'? This will terminate live endpoint routing.`)) {
      const updatedModel: AIModel = {
        ...model,
        status: "Archived",
        environment: "Archived",
        health: "Healthy"
      };

      updateModelInState(updatedModel);
      dispatchModelAudit(updatedModel, "Archive", "Archived model weights. Live server router paths dismantled.");
      toast.info(`Model '${model.name}' archived.`);
    }
  }, [updateModelInState, dispatchModelAudit]);

  // Delete model simulation
  const handleDeleteClick = useCallback((model: AIModel) => {
    if (model.status === "Production") {
      toast.error("Production models cannot be deleted. Rollback or archive first.");
      return;
    }

    if (confirm(`Expunge ML model '${model.name}' metadata profiles and binaries? This cannot be undone.`)) {
      setModels(prev => prev.filter(m => m.id !== model.id));
      if (selectedModel?.id === model.id) {
        setIsDrawerOpen(false);
      }
      toast.success(`Model expunged from the active registry.`);
    }
  }, [selectedModel]);

  // Clone Model Profile
  const handleCloneClick = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setNewModelData(prev => ({
      ...prev,
      name: `${model.name} Clone`,
      type: model.type,
      description: `Cloned profile of ${model.name}. ${model.description}`,
      owner: model.owner,
      version: "v1.0.0",
      framework: model.framework,
      datasetName: model.datasetName,
      featureCount: model.featureCount,
      repositoryLink: model.repositoryLink,
      tags: [...model.tags],
      targetEnvironment: "Development"
    }));
    setIsCloneOpen(true);
  }, []);

  const handleCloneSubmit = () => {
    if (!selectedModel) return;
    const newId = `model-${newModelData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const cloned: AIModel = {
      ...selectedModel,
      id: newId,
      name: newModelData.name,
      description: newModelData.description,
      version: newModelData.version,
      framework: newModelData.framework,
      environment: newModelData.targetEnvironment,
      status: newModelData.targetEnvironment === "Production" ? "Production" : newModelData.targetEnvironment === "Staging" ? "Staging" : "Development",
      health: "Healthy",
      owner: newModelData.owner,
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      predictions: 0,
      tags: [...newModelData.tags],
      activities: [
        { id: `act-cl-${Date.now()}`, type: "Model Registered", timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), operator: "Rahul Chahar", detail: `Cloned model registered from baseline ${selectedModel.name}.` }
      ]
    };

    setModels(prev => [cloned, ...prev]);
    setIsCloneOpen(false);
    toast.success(`Cloned model profile '${newModelData.name}' created.`);
  };

  // Register New Model Steps validation & submit
  const handleRegisterStepNext = () => {
    if (createStep === 1 && !newModelData.name) {
      toast.error("Model Name is a required parameter.");
      return;
    }
    if (createStep === 2 && (!newModelData.version || !newModelData.datasetName)) {
      toast.error("Version tags and Dataset configurations are required.");
      return;
    }
    setCreateStep(prev => prev + 1);
  };

  const handleRegisterSubmit = () => {
    const newId = `model-${newModelData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const targetStatus: ModelStatus = 
      newModelData.targetEnvironment === "Production" ? "Production" :
      newModelData.targetEnvironment === "Staging" ? "Staging" : "Development";

    const createdModel: AIModel = {
      id: newId,
      name: newModelData.name,
      type: newModelData.type,
      version: newModelData.version,
      framework: newModelData.framework,
      environment: newModelData.targetEnvironment,
      status: targetStatus,
      health: "Healthy",
      accuracy: 90.0, // default baseline accuracy
      latency: 20.0,
      predictions: 0,
      owner: newModelData.owner,
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      description: newModelData.description || "Machine learning model powering decision structures.",
      datasetName: newModelData.datasetName,
      featureCount: newModelData.featureCount,
      repositoryLink: newModelData.repositoryLink || "github.com/arthdrishti/models",
      tags: newModelData.tags.length > 0 ? newModelData.tags : ["Experimental"],
      sparkline: [90.0, 90.0, 90.0, 90.0, 90.0, 90.0],
      metrics: {
        accuracy: 0.900,
        latency: 20.0,
        predictions: 0,
        confidence: 90.0,
        errorRate: 10.0,
        precision: 0.890,
        recall: 0.910,
        f1Score: 0.900,
        rocAuc: 0.920
      },
      environments: [
        { name: "Development", version: newModelData.version, health: "Healthy", deployedAt: new Date().toISOString().replace("T", " ").substring(0, 16), status: "Active" }
      ],
      versions: [
        { id: `v-${newId}-1`, version: newModelData.version, status: targetStatus, health: "Healthy", accuracy: 0.900, latency: 20.0, predictions: 0, updatedDate: new Date().toISOString().split("T")[0], description: "Baseline model release." }
      ],
      activities: [
        { id: `act-${newId}-1`, type: "Model Registered", timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), operator: "Rahul Chahar", detail: `Baseline model provisioned on framework ${newModelData.framework}.` }
      ]
    };

    setModels(prev => [createdModel, ...prev]);
    setIsRegisterOpen(false);
    setCreateStep(1);
    // Reset wizard
    setNewModelData({
      name: "",
      type: "Credit Risk Prediction",
      description: "",
      owner: "Credit Ops",
      version: "v1.0.0",
      framework: "XGBoost",
      datasetName: "",
      featureCount: 10,
      repositoryLink: "",
      tags: [],
      targetEnvironment: "Development"
    });
    toast.success(`Model '${createdModel.name}' registered successfully in active directory.`);
  };

  // Toggle model tags in wizard
  const handleTagToggle = (tag: string) => {
    const isSelected = newModelData.tags.includes(tag);
    setNewModelData(prev => ({
      ...prev,
      tags: isSelected ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  // Columns definition for TanStack Table
  const tableColumns = useMemo<ColumnDef<AIModel>[]>(() => [
    {
      accessorKey: "name",
      header: "Model Name",
      cell: ({ row }) => {
        const model = row.original;
        return (
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleOpenDrawer(model, "overview")}
                  className="font-semibold text-foreground hover:text-primary outline-none text-left cursor-pointer"
                >
                  {model.name}
                </button>
                <span className="text-[10px] text-foreground-muted font-mono font-normal">({model.version})</span>
              </div>
              <span className="text-[10px] text-foreground-secondary line-clamp-1 max-w-[240px] font-sans mt-0.5" title={model.description}>{model.description}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ cell }) => <span className="font-sans font-medium text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "framework",
      header: "Framework",
      cell: ({ cell }) => <span className="font-mono text-foreground-secondary font-semibold">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "environment",
      header: "Environment",
      cell: ({ cell }) => {
        const env = cell.getValue() as string;
        const variants: Record<string, any> = {
          Production: "success",
          Staging: "forecast",
          Development: "ai",
          Testing: "warning",
          Archived: "outline"
        };
        return <Badge variant={variants[env] || "outline"}>{env}</Badge>;
      }
    },
    {
      accessorKey: "accuracy",
      header: "Accuracy",
      cell: ({ cell }) => <span className="font-mono font-bold text-foreground">{cell.getValue() as number}%</span>
    },
    {
      accessorKey: "latency",
      header: "Latency",
      cell: ({ cell }) => <span className="font-mono text-foreground-secondary">{cell.getValue() as number}ms</span>
    },
    {
      accessorKey: "predictions",
      header: "Predictions",
      cell: ({ cell }) => <span className="font-mono font-bold text-foreground">{(cell.getValue() as number).toLocaleString()}</span>
    },
    {
      accessorKey: "health",
      header: "Health",
      cell: ({ cell }) => {
        const health = cell.getValue() as string;
        const healthMap: Record<string, any> = {
          Healthy: "active",
          Degraded: "pending",
          Offline: "failed"
        };
        return <StatusBadge status={healthMap[health] || "pending"} />;
      }
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ cell }) => <span className="font-sans text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ cell }) => <span className="font-mono text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const model = row.original;
        const items = [
          { id: "view", label: "View Details", icon: Info, onClick: () => handleOpenDrawer(model, "overview") },
          { id: "deploy", label: "Deploy Model", icon: Play, onClick: () => handleDeployClick(model) },
          { id: "clone", label: "Clone Profile", icon: Copy, onClick: () => handleCloneClick(model) },
          { id: "rollback", label: "Rollback Version", icon: RotateCcw, onClick: () => handleRollbackClick(model) },
          { id: "archive", label: "Archive Model", icon: Archive, onClick: () => handleArchiveClick(model) },
          { id: "delete", label: "Delete Model", icon: Trash2, destructive: true, onClick: () => handleDeleteClick(model) }
        ];

        return (
          <div className="flex justify-end select-none">
            <Dropdown
              trigger={
                <button className="p-1 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer focus-visible:outline-2 outline-none">
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={items}
              align="right"
            />
          </div>
        );
      }
    }
  ], [handleOpenDrawer, handleDeployClick, handleCloneClick, handleRollbackClick, handleArchiveClick, handleDeleteClick]);

  const tableInstance = useReactTable({
    data: filteredModelsList,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header */}
      <SectionHeader
        title="AI Model Registry"
        description="Manage, monitor and control every AI model deployed across the ArthDrishti platform including versioning, deployment status, health, performance and lifecycle."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer hidden md:flex" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh Registry
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Draft model manifest configuration template exported.")}>
              Import Model
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(models, null, 2));
              const anchor = document.createElement("a");
              anchor.setAttribute("href", dataStr);
              anchor.setAttribute("download", `models_registry_dump_${Date.now()}.json`);
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              toast.success("AI Model Registry database schema exported.");
            }}>
              <Download className="h-4 w-4 shrink-0" />
              Export Models
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setCreateStep(1); setIsRegisterOpen(true); }}>
              <Plus className="h-4 w-4 shrink-0" />
              Register Model
            </Button>
          </div>
        }
      />

      {/* 2. Top Summary stats count Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 font-sans select-none mb-6">
        {[
          { label: "Total Models", val: kpis.total, trend: 12.5, icon: Cpu, sparkline: KPI_SPARKLINES.totalModels, suffix: "" },
          { label: "Production Models", val: kpis.production, trend: 9.8, icon: Play, sparkline: KPI_SPARKLINES.productionModels, suffix: "" },
          { label: "Staging Models", val: kpis.staging, trend: -4.2, icon: Layers, sparkline: KPI_SPARKLINES.stagingModels, suffix: "" },
          { label: "Archived Models", val: kpis.archived, trend: 0.0, icon: Archive, sparkline: KPI_SPARKLINES.archivedModels, suffix: "" },
          { label: "Healthy Models", val: kpis.healthy, trend: 10.4, icon: CheckCircle2, sparkline: KPI_SPARKLINES.healthyModels, suffix: "" },
          { label: "Requires Attention", val: kpis.attention, trend: 20.0, icon: AlertCircle, sparkline: KPI_SPARKLINES.attentionModels, suffix: "" },
          { label: "Average Accuracy", val: kpis.avgAccuracy, trend: 2.1, icon: Sparkles, sparkline: KPI_SPARKLINES.avgAccuracy, suffix: "%" },
          { label: "Predictions Today", val: `${(kpis.predictionsToday/1000).toFixed(0)}k`, trend: 15.2, icon: Activity, sparkline: KPI_SPARKLINES.predictions, suffix: "" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card 
              key={idx} 
              interactive
              className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <CardContent className="pt-4 p-4 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider truncate max-w-[80px]" title={card.label}>
                    {card.label}
                  </span>
                  <Icon className="h-4 w-4 shrink-0 text-foreground-muted" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-5 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-mono tracking-tight text-foreground leading-none">
                      {card.val}{card.suffix}
                    </span>
                    <div className="flex items-center justify-between mt-1.5">
                      <TrendIndicator value={card.trend} className="text-[10px]" />
                      
                      <svg className="w-10 h-4 overflow-visible shrink-0" viewBox="0 0 10 4">
                        <polyline
                          fill="none"
                          stroke={card.trend > 0 ? COLORS.positive : card.trend < 0 ? COLORS.critical : COLORS.muted}
                          strokeWidth="0.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={card.sparkline
                            .map((val, i) => `${(i / (card.sparkline.length - 1)) * 10}, ${4 - ((val - Math.min(...card.sparkline)) / (Math.max(...card.sparkline) - Math.min(...card.sparkline) || 1)) * 4}`)
                            .join(" ")}
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync diagnostics lock panel */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs animate-fadeIn">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">Model Artifact Repository Disconnected</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                ArthDrishti could not synchronize the S3 or HuggingFace model directories configurations. Deployed binaries verification failed.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Reconnect Repository
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Bypass Errors
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8 animate-fadeIn">
          
          {/* 3. ADVANCED FILTER BAR */}
          <Card>
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
              
              {/* Primary Search bar */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Global search by model name, architecture description, framework tag, owner division..."
                  className="w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-xs text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted cursor-pointer outline-none">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Form filters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Model Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Credit Risk Prediction">Credit Risk</option>
                    <option value="Fraud Detection">Fraud NN</option>
                    <option value="Financial Health Score">Financial Health</option>
                    <option value="Cash Flow Forecast">Cash Flow Forecast</option>
                    <option value="Customer Segmentation">Segmentation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Environment</label>
                  <select
                    value={filterEnvironment}
                    onChange={(e) => setFilterEnvironment(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Envs</option>
                    {MOCK_ENVIRONMENTS.map(env => <option key={env} value={env}>{env}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    {MOCK_STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Framework</label>
                  <select
                    value={filterFramework}
                    onChange={(e) => setFilterFramework(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Frameworks</option>
                    {MOCK_FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Version Tag</label>
                  <select
                    value={filterVersion}
                    onChange={(e) => setFilterVersion(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Versions</option>
                    <option value="v4">v4.x (Ensembles)</option>
                    <option value="v3">v3.x (Regression)</option>
                    <option value="v2">v2.x (Anomalies)</option>
                    <option value="v1">v1.x (Clustering)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Model Owner</label>
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Owners</option>
                    {MOCK_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Created Date</label>
                  <select
                    value={filterCreatedDate}
                    onChange={(e) => setFilterCreatedDate(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All History</option>
                    <option value="30Days">Last 30 Days</option>
                    <option value="90Days">Last 90 Days</option>
                    <option value="1Year">Last 1 Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Model Tags</label>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Tags</option>
                    {MOCK_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Toolbar controls */}
              <div className="flex items-center justify-between border-t border-border/40 pt-3 gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveFilterView}>
                    Save Default View
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                  <span className="text-[10px] text-foreground-muted font-medium">
                    Filtered out <span className="font-mono font-bold text-foreground">{filteredModelsList.length}</span> active risk configurations out of {models.length}.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. LAYOUT SELECTOR & TANSTACK TABLE OR PREMIUM CARDS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 select-none">
              <div className="space-y-0.5">
                <h3 className="text-base font-heading font-semibold text-foreground">Registry Directories</h3>
                <p className="text-xs text-foreground-secondary">Monitor model version statuses, average latency flags and prediction allocations.</p>
              </div>
              
              {/* Table / Card toggle */}
              <div className="flex items-center gap-3">
                <div className="flex bg-surface-elevated border border-border p-0.5 rounded-xs">
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "p-1.5 rounded-xs transition-colors cursor-pointer outline-none focus-visible:outline-2",
                      viewMode === "table" ? "bg-surface border border-border text-primary shadow-xs" : "text-foreground-secondary hover:text-foreground"
                    )}
                    title="Grid table view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-xs transition-colors cursor-pointer outline-none focus-visible:outline-2",
                      viewMode === "grid" ? "bg-surface border border-border text-primary shadow-xs" : "text-foreground-secondary hover:text-foreground"
                    )}
                    title="Premium cards grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main view container */}
            {isLoading ? (
              <div className="space-y-4 animate-pulse p-4">
                <div className="h-10 bg-border/40 rounded-sm w-full" />
                {[1, 2, 3].map(s => <div key={s} className="h-14 bg-border/30 rounded-sm w-full" />)}
              </div>
            ) : filteredModelsList.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs max-w-sm mx-auto animate-fadeIn">
                <div className="h-14 w-14 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
                  <Cpu className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-base text-foreground">No Registered Models</h3>
                  <p className="text-xs text-foreground-secondary leading-normal">
                    No active model files mapped matches active queries filters. Change parameters to trace files.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2 select-none">
                  <Button variant="primary" size="sm" onClick={() => setIsRegisterOpen(true)}>Register Model</Button>
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>Reset Filters</Button>
                </div>
              </div>
            ) : viewMode === "table" ? (
              
              /* TABLE VIEW MODE (TANSTACK TABLE) */
              <Card className="overflow-visible animate-fadeIn">
                <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-semibold">Active Models Directories</CardTitle>
                  </div>
                  <div className="flex items-center gap-3 select-none">
                    <div className="flex items-center bg-surface border border-border p-0.5 rounded-xs text-[10px]">
                      {(["compact", "comfortable", "loose"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDensity(d)}
                          className={cn(
                            "px-2 py-1 rounded-xs transition-all cursor-pointer font-bold capitalize outline-none",
                            density === d ? "bg-surface-elevated border border-border text-foreground shadow-xs" : "text-foreground-secondary"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <Dropdown
                      trigger={
                        <button className="flex items-center gap-1.5 h-9 px-3 border border-border bg-surface rounded-xs text-xs font-semibold cursor-pointer outline-none focus-visible:outline-2">
                          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                          Columns
                        </button>
                      }
                      items={tableInstance.getAllLeafColumns().filter(col => col.id !== "actions").map(col => ({
                        id: col.id,
                        label: col.id === "name" ? "Model Name" : col.id === "type" ? "Type" : col.id === "framework" ? "Framework" : col.id === "environment" ? "Env" : col.id === "accuracy" ? "Accuracy" : col.id === "latency" ? "Latency" : col.id === "predictions" ? "Volume" : col.id === "health" ? "Health" : col.id === "owner" ? "Owner" : "Last Deployed",
                        icon: col.getIsVisible() ? Check : undefined,
                        onClick: () => col.toggleVisibility(!col.getIsVisible())
                      }))}
                      align="right"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto relative">
                  <table className="w-full text-left border-collapse text-xs select-text">
                    <thead>
                      {tableInstance.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-border bg-surface-elevated/60 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider select-none sticky top-0 z-10">
                          {headerGroup.headers.map((header) => (
                            <th 
                              key={header.id} 
                              onClick={header.column.getToggleSortingHandler()}
                              className={cn(
                                "p-4 font-sans font-bold select-none",
                                header.column.getCanSort() && "cursor-pointer hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === "asc" && <ArrowRight className="h-3 w-3 rotate-[-45deg]" />}
                                {header.column.getIsSorted() === "desc" && <ArrowRight className="h-3 w-3 rotate-[45deg]" />}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {tableInstance.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => handleOpenDrawer(row.original, "overview")}
                          className={cn(
                            "hover:bg-surface-hover/50 transition-colors cursor-pointer relative",
                            row.getIsSelected() && "bg-primary/5 hover:bg-primary/8"
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              onClick={(e) => {
                                if (cell.column.id === "actions") {
                                  e.stopPropagation();
                                }
                              }}
                              className={cn(
                                "font-sans transition-all",
                                density === "compact" ? "p-2" : density === "comfortable" ? "p-3.5" : "p-5"
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>

                {/* Table Pagination */}
                <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between flex-wrap gap-4 select-none font-sans text-xs bg-surface-elevated/20">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground-secondary font-medium">Rows per page:</span>
                    <select
                      value={tableInstance.getState().pagination.pageSize}
                      onChange={(e) => tableInstance.setPageSize(Number(e.target.value))}
                      className="bg-surface border border-border rounded-xs px-2 py-1 outline-none focus:border-primary cursor-pointer font-semibold"
                    >
                      {[5, 10, 20].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>{pageSize} rows</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-foreground-secondary">
                      Page <span className="font-mono font-bold text-foreground">{tableInstance.getState().pagination.pageIndex + 1}</span> of{" "}
                      <span className="font-mono font-bold text-foreground">{tableInstance.getPageCount()}</span>
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="px-2" onClick={() => tableInstance.previousPage()} disabled={!tableInstance.getCanPreviousPage()}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="px-2" onClick={() => tableInstance.nextPage()} disabled={!tableInstance.getCanNextPage()}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              
              /* CARD VIEW GRID MODE (PREMIUM MODEL CARDS) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn select-text">
                {filteredModelsList.map((model) => {
                  const statusVariants: Record<string, any> = {
                    Production: "success",
                    Staging: "forecast",
                    Development: "ai",
                    Archived: "outline",
                    Training: "warning",
                    Failed: "destructive"
                  };
                  return (
                    <Card key={model.id} interactive className="flex flex-col justify-between min-h-[220px] border border-border">
                      <CardHeader className="p-4 bg-surface-elevated/20 border-b border-border/40 flex flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5 text-left max-w-[150px]">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Cpu className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-semibold text-xs text-foreground truncate" title={model.name}>{model.name}</span>
                            <span className="text-[10px] text-foreground-muted font-mono">{model.version}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 select-none shrink-0">
                          <Badge variant={statusVariants[model.status] || "outline"} className="scale-90">{model.status}</Badge>
                          <StatusBadge status={model.health === "Healthy" ? "active" : model.health === "Degraded" ? "pending" : "failed"} className="scale-75" />
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 text-xs font-sans flex-1 flex flex-col justify-between gap-3 text-foreground-secondary">
                        <p className="line-clamp-2 leading-relaxed text-[11px] text-foreground-secondary/90">{model.description}</p>
                        
                        <div className="grid grid-cols-3 gap-2 border-t border-border/20 pt-2.5 text-[10px] font-medium select-none">
                          <div className="flex flex-col">
                            <span className="text-foreground-muted uppercase tracking-wider text-[8px] font-bold">Accuracy</span>
                            <span className="font-mono font-bold text-foreground text-xs mt-0.5">{model.accuracy}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground-muted uppercase tracking-wider text-[8px] font-bold">Latency</span>
                            <span className="font-mono font-bold text-foreground text-xs mt-0.5">{model.latency}ms</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground-muted uppercase tracking-wider text-[8px] font-bold">Predictions</span>
                            <span className="font-mono font-bold text-foreground text-xs mt-0.5">{model.predictions >= 1000000 ? `${(model.predictions/1000000).toFixed(1)}M` : model.predictions.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-3 bg-surface-elevated/20 border-t border-border/30 flex items-center justify-between select-none">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-foreground-muted" />
                          <span className="text-[10px] text-foreground-muted font-sans font-medium">{model.owner}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-bold" onClick={() => handleOpenDrawer(model, "overview")}>Details</Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-bold" onClick={() => handleDeployClick(model)}>Deploy</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. MODEL DETAILS DRAWER PANEL (SHEET OVERLAY) */}
      {/* ================================================== */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedModel?.name || "ML Model Metadata"}
        className="w-full max-w-xl md:max-w-2xl border-l border-border select-text"
      >
        {selectedModel && (
          <div className="flex flex-col h-full justify-between pr-1">
            
            {/* Header Identity */}
            <div className="flex items-center gap-4 pb-5 border-b border-border/40 mb-5">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-semibold text-lg text-foreground">{selectedModel.name}</h2>
                  <Badge variant="outline" className="text-[10px] py-0">{selectedModel.framework}</Badge>
                </div>
                <p className="text-xs text-foreground-secondary leading-normal pr-4 mt-0.5">{selectedModel.description}</p>
              </div>
            </div>

            {/* Inner Drawer Tabs */}
            <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-5 mb-5 select-none shrink-0">
              {[
                { id: "overview", label: "Overview details", icon: Info },
                { id: "deployments", label: "Environments Deployment", icon: Layers },
                { id: "analytics", label: "Performance Snapshots", icon: Activity },
                { id: "versions", label: `Version Ledger (${selectedModel.versions.length})`, icon: GitBranch },
                { id: "timeline", label: "Recent Activity", icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerActiveTab(tab.id)}
                  className={cn(
                    "pb-3.5 text-xs font-semibold cursor-pointer border-b-2 font-sans shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 outline-none",
                    drawerActiveTab === tab.id 
                      ? "border-primary text-primary" 
                      : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border-strong"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable body content */}
            <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-6 font-sans">
              
              {/* TAB 1: OVERVIEW & PERFORMANCE SNAPSHOTS */}
              {drawerActiveTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Metadata fields cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <Card>
                      <CardContent className="p-4 space-y-3.5">
                        <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider select-none border-b border-border/40 pb-1.5">Model Parameters</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-foreground-muted">Model ID:</span> <span className="font-semibold text-foreground font-mono">{selectedModel.id}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Framework Library:</span> <span className="font-semibold text-foreground">{selectedModel.framework}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Dataset Resource:</span> <span className="font-semibold text-foreground font-mono truncate max-w-[130px]" title={selectedModel.datasetName}>{selectedModel.datasetName}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Feature Space Count:</span> <span className="font-semibold text-foreground font-mono">{selectedModel.featureCount} dims</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Model Owner division:</span> <span className="font-semibold text-foreground">{selectedModel.owner}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Code Repository:</span> <a href={`https://${selectedModel.repositoryLink}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1">Git Repo <ExternalLink className="h-3 w-3" /></a></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3.5">
                        <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider select-none border-b border-border/40 pb-1.5">Active Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-foreground-muted">Version Tag:</span> <span className="font-semibold text-foreground font-mono">{selectedModel.version}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Active Environment:</span> <Badge variant="primary">{selectedModel.environment}</Badge></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Deployment Status:</span> <Badge variant="outline">{selectedModel.status}</Badge></div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Health:</span>
                            <StatusBadge status={selectedModel.health === "Healthy" ? "active" : selectedModel.health === "Degraded" ? "pending" : "failed"} className="scale-90" />
                          </div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Model Created Date:</span> <span className="font-semibold text-foreground font-mono">{selectedModel.createdDate}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Last Pipeline Run:</span> <span className="font-semibold text-foreground font-mono">{selectedModel.lastUpdated}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Core accuracy metrics snapshots */}
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-semibold text-foreground select-none">Performance Telemetry snapshot</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 border border-border rounded-sm bg-surface flex flex-col gap-1 text-left">
                        <span className="text-foreground-muted text-[10px] uppercase font-bold tracking-wider">ROC AUC</span>
                        <span className="font-mono text-base font-bold text-foreground">{selectedModel.metrics.rocAuc}</span>
                      </div>
                      <div className="p-3 border border-border rounded-sm bg-surface flex flex-col gap-1 text-left">
                        <span className="text-foreground-muted text-[10px] uppercase font-bold tracking-wider">Precision</span>
                        <span className="font-mono text-base font-bold text-foreground">{(selectedModel.metrics.precision * 100).toFixed(1)}%</span>
                      </div>
                      <div className="p-3 border border-border rounded-sm bg-surface flex flex-col gap-1 text-left">
                        <span className="text-foreground-muted text-[10px] uppercase font-bold tracking-wider">Recall Score</span>
                        <span className="font-mono text-base font-bold text-foreground">{(selectedModel.metrics.recall * 100).toFixed(1)}%</span>
                      </div>
                      <div className="p-3 border border-border rounded-sm bg-surface flex flex-col gap-1 text-left">
                        <span className="text-foreground-muted text-[10px] uppercase font-bold tracking-wider">F1-Score</span>
                        <span className="font-mono text-base font-bold text-foreground">{(selectedModel.metrics.f1Score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Model tag labels */}
                  <div className="space-y-2 select-none">
                    <h3 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Metadata tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModel.tags.map(t => <Badge key={t} variant="outline" className="font-mono text-[10px] font-normal">{t}</Badge>)}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEDEPLOYMENT PANEL */}
              {drawerActiveTab === "deployments" && (
                <div className="space-y-4 animate-fadeIn select-text">
                  <h3 className="text-sm font-semibold text-foreground select-none">Target Cluster Environments</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedModel.environments.map(env => (
                      <Card key={env.name} className="border border-border">
                        <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between select-none">
                          <CardTitle className="text-xs font-bold uppercase tracking-wider">{env.name} Env</CardTitle>
                          <Badge variant={env.status === "Active" ? "primary" : env.status === "Canary" ? "ai" : "outline"} className="scale-90">
                            {env.status}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 text-xs font-sans text-foreground-secondary space-y-2">
                          <div className="flex justify-between"><span className="text-foreground-muted">Binary Version:</span> <span className="font-mono font-bold text-foreground">{env.version}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Last Deployment:</span> <span className="font-mono text-foreground-secondary">{env.deployedAt}</span></div>
                          <div className="flex justify-between select-none">
                            <span className="text-foreground-muted">Health:</span>
                            <StatusBadge status={env.health === "Healthy" ? "active" : "failed"} className="scale-80" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PERFORMANCE GRAPH SNAPSHOTS */}
              {drawerActiveTab === "analytics" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans text-left">
                    <Card className="p-4 flex flex-col gap-1 border border-border">
                      <span className="text-foreground-muted uppercase text-[9px] font-bold tracking-widest">Average latency</span>
                      <span className="font-mono text-xl font-bold text-foreground">{selectedModel.metrics.latency}ms</span>
                    </Card>
                    <Card className="p-4 flex flex-col gap-1 border border-border">
                      <span className="text-foreground-muted uppercase text-[9px] font-bold tracking-widest">Error Rate Cap</span>
                      <span className="font-mono text-xl font-bold text-foreground">{selectedModel.metrics.errorRate}%</span>
                    </Card>
                  </div>

                  {/* Simulated accuracy / latency metrics graphs */}
                  <Card>
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-widest">Accuracy validation curve (MAPE/Loss %)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 h-48 select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedModel.sparkline.map((val, idx) => ({ epoch: `Ep-${idx+1}`, value: val }))} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                          <XAxis dataKey="epoch" tick={{ fontSize: 9 }} />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 9 }} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 4: VERSION HISTORY */}
              {drawerActiveTab === "versions" && (
                <div className="space-y-4 animate-fadeIn select-text">
                  <h3 className="text-sm font-semibold text-foreground select-none">De-allocated Version Register</h3>
                  
                  <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-1 text-xs select-text">
                    {selectedModel.versions.map(v => (
                      <div key={v.id} className="relative space-y-2">
                        <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-background bg-primary" />
                        
                        <div className="flex items-center justify-between text-[10px] text-foreground-muted select-none">
                          <span className="font-bold uppercase tracking-wider text-foreground">Version {v.version}</span>
                          <span className="font-mono">{v.updatedDate}</span>
                        </div>
                        <p className="text-foreground-secondary leading-relaxed font-sans">{v.description}</p>
                        
                        <div className="flex gap-4 font-mono font-bold text-[10px] text-foreground-secondary border-t border-border/20 pt-1 select-none">
                          <span>Accuracy: {v.accuracy*100}%</span>
                          <span>Latency: {v.latency}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: TIMELINE RECENT ACTIVITIES */}
              {drawerActiveTab === "timeline" && (
                <div className="space-y-4 animate-fadeIn select-text">
                  <h3 className="text-sm font-semibold text-foreground select-none">Event Action Log History</h3>
                  
                  <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-1 text-xs select-text">
                    {selectedModel.activities.map(log => {
                      const logColors = {
                        "Model Registered": "bg-secondary text-white border-secondary",
                        "Deployment Started": "bg-warning text-white border-warning",
                        "Deployment Completed": "bg-positive text-white border-positive",
                        "Rollback": "bg-critical text-white border-critical",
                        "Performance Drop": "bg-critical text-white border-critical",
                        "Drift Warning": "bg-warning text-white border-warning",
                        "Version Updated": "bg-primary text-white border-primary",
                        "Archive": "bg-secondary text-white border-secondary"
                      };
                      return (
                        <div key={log.id} className="relative space-y-1">
                          <div className={cn(
                            "absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-background",
                            logColors[log.type]?.split(" ")[0] || "bg-border"
                          )} />
                          
                          <div className="flex items-center justify-between text-[10px] text-foreground-muted select-none">
                            <span className="font-bold uppercase tracking-wider">{log.type}</span>
                            <span className="font-mono">{log.timestamp}</span>
                          </div>
                          <p className="text-foreground font-medium pr-2 leading-relaxed">{log.detail}</p>
                          <span className="text-[10px] text-foreground-muted block select-none">Operator ID: {log.operator}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-border/40 flex flex-wrap justify-between items-center select-none shrink-0 bg-surface-elevated/10 p-4 gap-3">
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(selectedModel)}>
                Delete Model
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success("Model metadata configuration downloaded.");
                  setIsDrawerOpen(false);
                }}>
                  Download Configuration
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleDeployClick(selectedModel)}>Deploy Version</Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* ================================================== */}
      {/* 6. REGISTER MODEL DIALOG (MULTI-STEP WIZARD) */}
      {/* ================================================== */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register ML Model Profile"
        className="max-w-xl animate-fadeIn"
      >
        <div className="space-y-6 font-sans text-xs">
          
          {/* Step Indicators */}
          <div className="flex justify-between items-center select-none border-b border-border/40 pb-4 mb-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all",
                  createStep === step 
                    ? "bg-primary border-primary text-white scale-110 shadow-xs" 
                    : createStep > step 
                      ? "bg-positive/10 border-positive text-positive" 
                      : "bg-surface border-border text-foreground-muted"
                )}>
                  {createStep > step ? <Check className="h-3 w-3" /> : step}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider hidden sm:inline",
                  createStep === step ? "text-primary" : "text-foreground-muted"
                )}>
                  {step === 1 ? "Identity" : step === 2 ? "Parameters" : step === 3 ? "Target Env" : "Verification"}
                </span>
                {step < 4 && <div className="h-px bg-border w-6 sm:w-10" />}
              </div>
            ))}
          </div>

          {/* STEP 1: IDENTITY */}
          {createStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 1: Model Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={newModelData.name}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Risk Scoring Ensemble"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Model Category Type</label>
                  <select
                    value={newModelData.type}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="Credit Risk Prediction">Credit Risk Engine</option>
                    <option value="Fraud Detection">Fraud NN Anomaly</option>
                    <option value="Financial Health Score">Financial Health Score</option>
                    <option value="Cash Flow Forecast">Cash Flow Forecast</option>
                    <option value="Customer Segmentation">Segmentation Clustering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Owner Division</label>
                  <select
                    value={newModelData.owner}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    {MOCK_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Registry Purpose Description</label>
                  <textarea
                    rows={2}
                    value={newModelData.description}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe evaluation objectives, features boundaries or data requirements..."
                    className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PARAMETERS */}
          {createStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 2: Model Configuration Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Initial Version Tag *</label>
                  <input
                    type="text"
                    required
                    value={newModelData.version}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g. v1.0.0"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Framework Library</label>
                  <select
                    value={newModelData.framework}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, framework: e.target.value as any }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    {MOCK_FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Training Dataset URI *</label>
                  <input
                    type="text"
                    required
                    value={newModelData.datasetName}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, datasetName: e.target.value }))}
                    placeholder="e.g. ds_risk_features_v1.parquet"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Feature Count (dimensions)</label>
                  <input
                    type="number"
                    value={newModelData.featureCount}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, featureCount: Number(e.target.value) }))}
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Binary Artifacts Repository Path</label>
                  <input
                    type="text"
                    value={newModelData.repositoryLink}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, repositoryLink: e.target.value }))}
                    placeholder="github.com/... or s3://..."
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ENVIRONMENT DEPLOYMENT */}
          {createStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 3: Initial Target Environment</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Target Environment</label>
                  <select
                    value={newModelData.targetEnvironment}
                    onChange={(e) => setNewModelData(prev => ({ ...prev, targetEnvironment: e.target.value as any }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="Development">Development Sandbox</option>
                    <option value="Testing">Testing QA</option>
                    <option value="Staging">Staging Canary</option>
                    <option value="Production">Production live</option>
                  </select>
                </div>

                <div className="space-y-2 select-none">
                  <label className="text-foreground-secondary font-bold block mb-1">Associate Registry Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_TAGS.map(tag => {
                      const isSelected = newModelData.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            "px-2.5 py-1 rounded-full border text-[10px] font-sans font-medium transition-all select-none cursor-pointer outline-none",
                            isSelected 
                              ? "bg-primary text-white border-primary" 
                              : "bg-surface text-foreground-secondary border-border hover:bg-surface-hover"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {createStep === 4 && (
            <div className="space-y-4 select-text">
              <h3 className="text-sm font-semibold text-foreground select-none">Step 4: Review Manifest Profiles</h3>
              
              <div className="bg-surface-elevated border border-border p-4 rounded-sm space-y-3.5">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-semibold text-foreground text-sm">{newModelData.name}</span>
                  <Badge variant="primary">{newModelData.framework}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-sans text-foreground-secondary">
                  <div><span className="text-foreground-muted">Category:</span> {newModelData.type}</div>
                  <div><span className="text-foreground-muted">Target Env:</span> {newModelData.targetEnvironment}</div>
                  <div><span className="text-foreground-muted">Version Tag:</span> <span className="font-mono">{newModelData.version}</span></div>
                  <div><span className="text-foreground-muted">Feature dims:</span> <span className="font-mono">{newModelData.featureCount} dimensions</span></div>
                  <div className="col-span-2"><span className="text-foreground-muted">Training dataset:</span> <span className="font-mono">{newModelData.datasetName}</span></div>
                </div>
              </div>

              <div className="p-3 bg-positive/10 border border-positive/20 text-positive rounded-sm flex items-start gap-2.5 leading-relaxed font-sans select-none">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Confirming registry will index the ML metadata. Deployed environments pipelines can be managed directly from the registry console.
                </span>
              </div>
            </div>
          )}

          {/* Wizard Footer controls */}
          <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-6 select-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (createStep === 1) setIsRegisterOpen(false);
                else setCreateStep(prev => prev - 1);
              }}
            >
              {createStep === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={createStep === 4 ? handleRegisterSubmit : handleRegisterStepNext}
            >
              {createStep === 4 ? "Register Model" : "Next"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================================================== */}
      {/* 7. DEPLOY MODEL DIALOG MODAL */}
      {/* ================================================== */}
      <Modal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        title={`Deploy model: ${selectedModel?.name}`}
        className="max-w-sm animate-fadeIn"
      >
        {selectedModel && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Select Target Environment</label>
              <select
                value={targetDeployEnvironment}
                onChange={(e) => setTargetDeployEnvironment(e.target.value as ModelEnvironment)}
                className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
              >
                <option value="Development">Development Sandbox</option>
                <option value="Testing">Testing QA</option>
                <option value="Staging">Staging Canary</option>
                <option value="Production">Production live</option>
              </select>
            </div>

            <div className="p-3 bg-surface-elevated/40 border border-border rounded-sm space-y-2 select-text">
              <div className="flex justify-between"><span className="text-foreground-muted">Model ID:</span> <span className="font-mono font-semibold text-foreground">{selectedModel.id}</span></div>
              <div className="flex justify-between"><span className="text-foreground-muted">Deploy Version:</span> <span className="font-mono font-semibold text-foreground">{selectedModel.version}</span></div>
              <div className="flex justify-between"><span className="text-foreground-muted">Primary Accuracy:</span> <span className="font-mono font-semibold text-foreground">{selectedModel.accuracy}%</span></div>
            </div>

            <p className="text-[10px] text-foreground-muted leading-relaxed">
              Deploying will update endpoint traffic configurations on target clusters. Traffic routing triggers canary validations checks before promotion.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsDeployOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleDeploySubmit}>Deploy version</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================== */}
      {/* 8. CLONE / DUPLICATE MODEL MODAL */}
      {/* ================================================== */}
      <Modal
        isOpen={isCloneOpen}
        onClose={() => setIsCloneOpen(false)}
        title={`Clone Model Profile: ${selectedModel?.name}`}
        className="max-w-md animate-fadeIn"
      >
        {selectedModel && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">New Model Name *</label>
              <input
                type="text"
                required
                value={newModelData.name}
                onChange={(e) => setNewModelData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Cloned Description</label>
              <textarea
                rows={2}
                value={newModelData.description}
                onChange={(e) => setNewModelData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Target Environment</label>
                <select
                  value={newModelData.targetEnvironment}
                  onChange={(e) => setNewModelData(prev => ({ ...prev, targetEnvironment: e.target.value as any }))}
                  className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                >
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">New Version tag</label>
                <input
                  type="text"
                  value={newModelData.version}
                  onChange={(e) => setNewModelData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsCloneOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCloneSubmit}>Clone Model</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
