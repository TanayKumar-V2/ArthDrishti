"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Cpu,
  Activity,
  Database,
  Key,
  Settings,
  ShieldCheck,
  Check,
  MoreVertical,
  AlertCircle,
  Trash2,
  Edit,
  PlusCircle,
  Globe,
  Calendar,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldAlert,
  Network,
  Server,
  HardDrive,
  Mail,
  Fingerprint,
  FileText,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Download,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Briefcase,
  UserCheck,
  Info,
  Shield,
  Palette
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
  CartesianGrid,
  Legend
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
  INITIAL_ORGANIZATIONS,
  Organization,
  Branch,
  Member,
  ActivityLog,
  MOCK_INDUSTRIES,
  MOCK_COUNTRIES,
  MOCK_STATES,
  KPI_SPARKLINES
} from "@/lib/organizations_data";

// Custom HSL Colors Matching Admin Theme
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

export default function EnterpriseOrganizationsPage() {
  // Page Lifecycle & Global States
  const [mounted, setMounted] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  
  // Table sorting, pagination & selections
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"compact" | "comfortable" | "loose">("comfortable");

  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterSize, setFilterSize] = useState("All"); // All, Small (<50), Medium (50-500), Large (>500)
  const [filterCreatedDate, setFilterCreatedDate] = useState("All"); // All, 30 Days, 90 Days, 1 Year

  // Selected Item Drawer & Modal Wizards
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState("overview");

  // Dialog triggers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  // Bulk Actions
  const [bulkPlanTarget, setBulkPlanTarget] = useState<"Starter" | "Professional" | "Enterprise" | "Custom">("Enterprise");

  // Create Org Multi-Step wizard states
  const [createStep, setCreateStep] = useState(1);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    logo: "",
    description: "",
    industry: "Banking" as Organization["industry"],
    website: "",
    address: "",
    country: "India",
    state: "Delhi",
    registrationNumber: "",
    taxId: "",
    subscription: "Professional" as Organization["subscription"],
    billingCycle: "Annual" as Organization["billingCycle"],
    storageLimit: 2000,
    predictionLimit: 2000000,
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  // Drawer branch / member creation forms states
  const [newBranchData, setNewBranchData] = useState({
    name: "",
    city: "",
    state: "Delhi",
    manager: "",
    employees: 10,
    status: "Active" as Branch["status"]
  });

  const [newMemberData, setNewMemberData] = useState({
    name: "",
    email: "",
    role: "Staff" as Member["role"],
    department: "",
    branch: "",
    status: "Active" as Member["status"]
  });

  // Safe mount initialization to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    setOrganizations(INITIAL_ORGANIZATIONS);
    setLastSyncTime(new Date().toLocaleTimeString());
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  // System Sync Trigger
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setRowSelection({});
    
    setTimeout(() => {
      setOrganizations(INITIAL_ORGANIZATIONS);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("Enterprise registry data re-synchronized with core servers.");
    }, 600);
  }, []);

  // Sync state update wrapper to push updates back into dataset
  const updateOrgInState = useCallback((updated: Organization) => {
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
    if (selectedOrg && selectedOrg.id === updated.id) {
      setSelectedOrg(updated);
    }
  }, [selectedOrg]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterIndustry("All");
    setFilterPlan("All");
    setFilterStatus("All");
    setFilterCountry("All");
    setFilterState("All");
    setFilterSize("All");
    setFilterCreatedDate("All");
    toast.info("Organization filter parameters cleared.");
  }, []);

  // Save Filter View simulation
  const handleSaveFilterView = useCallback(() => {
    toast.success("Current filter view configured as default administrator preference.");
  }, []);

  // Filtered dataset mapping
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      // 1. Text Search matching name, website, country
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.country.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Industry filter
      const matchesIndustry = filterIndustry === "All" || org.industry === filterIndustry;

      // 3. Plan filter
      const matchesPlan = filterPlan === "All" || org.subscription === filterPlan;

      // 4. Status filter
      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "Active" && org.subscriptionStatus === "Active") ||
        (filterStatus === "Trial" && org.subscriptionStatus === "Trial") ||
        (filterStatus === "Expired" && org.subscriptionStatus === "Expired") ||
        (filterStatus === "Suspended" && org.subscriptionStatus === "Suspended");

      // 5. Country filter
      const matchesCountry = filterCountry === "All" || org.country === filterCountry;

      // 6. State filter
      const matchesState = filterState === "All" || org.state === filterState;

      // 7. Size filter (Members Count)
      let matchesSize = true;
      if (filterSize !== "All") {
        const size = org.members.length;
        if (filterSize === "Small") matchesSize = size < 5;
        else if (filterSize === "Medium") matchesSize = size >= 5 && size <= 10;
        else if (filterSize === "Large") matchesSize = size > 10;
      }

      // 8. Created Date filter
      let matchesCreatedDate = true;
      if (filterCreatedDate !== "All") {
        const createdTime = new Date(org.createdDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - createdTime) / (1000 * 3600 * 24);
        if (filterCreatedDate === "30Days") matchesCreatedDate = diffDays <= 30;
        else if (filterCreatedDate === "90Days") matchesCreatedDate = diffDays <= 90;
        else if (filterCreatedDate === "1Year") matchesCreatedDate = diffDays <= 365;
      }

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesPlan &&
        matchesStatus &&
        matchesCountry &&
        matchesState &&
        matchesSize &&
        matchesCreatedDate
      );
    });
  }, [
    organizations,
    searchQuery,
    filterIndustry,
    filterPlan,
    filterStatus,
    filterCountry,
    filterState,
    filterSize,
    filterCreatedDate
  ]);

  // Derived KPI ribbon totals
  const kpis = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter(o => o.subscriptionStatus === "Active").length;
    const trial = organizations.filter(o => o.subscriptionStatus === "Trial").length;
    const enterprise = organizations.filter(o => o.subscription === "Enterprise").length;
    const branches = organizations.reduce((acc, curr) => acc + curr.branches.length, 0);
    const members = organizations.reduce((acc, curr) => acc + curr.members.length, 0);
    const storageUsed = Math.round(organizations.reduce((acc, curr) => acc + curr.storageUsed, 0) / 102.4) / 10; // in TB
    const predictions = organizations.reduce((acc, curr) => acc + curr.predictionVolume, 0);
    const revenue = organizations.reduce((acc, curr) => acc + curr.revenue, 0);

    return {
      total,
      active,
      trial,
      enterprise,
      branches,
      members,
      storageUsed,
      predictions,
      revenue
    };
  }, [organizations]);

  // Row Action - Edit Org Handler
  const handleEditClick = useCallback((org: Organization) => {
    setOrgToEdit(org);
    setNewOrgData({
      name: org.name,
      logo: org.logo,
      description: org.description,
      industry: org.industry,
      website: org.website,
      address: org.address,
      country: org.country,
      state: org.state,
      registrationNumber: org.registrationNumber,
      taxId: org.taxId,
      subscription: org.subscription,
      billingCycle: org.billingCycle,
      storageLimit: org.storageLimit,
      predictionLimit: org.predictionLimit,
      adminName: "",
      adminEmail: "",
      adminPassword: ""
    });
    setIsEditOpen(true);
  }, []);

  const handleEditSubmit = useCallback(() => {
    if (!orgToEdit) return;
    
    const updated: Organization = {
      ...orgToEdit,
      name: newOrgData.name,
      logo: newOrgData.logo || newOrgData.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      description: newOrgData.description,
      industry: newOrgData.industry,
      website: newOrgData.website,
      address: newOrgData.address,
      country: newOrgData.country,
      state: newOrgData.state,
      registrationNumber: newOrgData.registrationNumber,
      taxId: newOrgData.taxId,
      subscription: newOrgData.subscription,
      billingCycle: newOrgData.billingCycle,
      storageLimit: newOrgData.storageLimit,
      predictionLimit: newOrgData.predictionLimit,
    };

    // Appending audit log
    const editLog: ActivityLog = {
      id: `act-edit-${Date.now()}`,
      type: "Settings Updated",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: "Organization credentials and settings updated by Administrator."
    };
    updated.activities = [editLog, ...updated.activities];

    updateOrgInState(updated);
    setIsEditOpen(false);
    toast.success(`Organization '${newOrgData.name}' updated successfully.`);
  }, [orgToEdit, newOrgData, updateOrgInState]);

  // Row Action - Delete Org Handler
  const handleDeleteClick = useCallback((org: Organization) => {
    if (confirm(`Are you absolutely sure you want to permanently delete '${org.name}' and all associated departments, branches, and member records?`)) {
      setOrganizations(prev => prev.filter(o => o.id !== org.id));
      if (selectedOrg?.id === org.id) {
        setIsDrawerOpen(false);
      }
      toast.success(`Organization '${org.name}' has been expunged from the registry.`);
    }
  }, [selectedOrg]);

  // Drawer Opening Helper with target tab routing
  const handleOpenDrawer = useCallback((org: Organization, tab = "overview") => {
    setSelectedOrg(org);
    setDrawerActiveTab(tab);
    setIsDrawerOpen(true);
  }, []);

  // Multi-step creation validation & submission
  const handleCreateStepNext = () => {
    if (createStep === 1 && !newOrgData.name) {
      toast.error("Organization Name is a required field.");
      return;
    }
    if (createStep === 2 && (!newOrgData.registrationNumber || !newOrgData.taxId)) {
      toast.error("Government Registration and Tax IDs are required for entity verification.");
      return;
    }
    if (createStep === 4 && (!newOrgData.adminName || !newOrgData.adminEmail || !newOrgData.adminPassword)) {
      toast.error("Initial Root Administrator credentials are required.");
      return;
    }
    setCreateStep(prev => prev + 1);
  };

  const handleCreateSubmit = () => {
    const newId = `org-${newOrgData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const generatedLogo = newOrgData.logo || newOrgData.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const initialMember: Member = {
      id: `mem-${newId}-1`,
      name: newOrgData.adminName,
      email: newOrgData.adminEmail,
      role: "Administrator",
      department: "Platform Operations",
      branch: "Headquarters",
      status: "Active",
      lastLogin: "Never"
    };

    const initialBranch: Branch = {
      id: `br-${newId}-1`,
      name: "Headquarters",
      city: newOrgData.state,
      state: newOrgData.state,
      manager: newOrgData.adminName,
      employees: 1,
      status: "Active"
    };

    const initialActivity: ActivityLog = {
      id: `act-${newId}-1`,
      type: "Organization Created",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: `Enterprise tenant initialized. Plan: ${newOrgData.subscription}, Reg: ${newOrgData.registrationNumber}.`
    };

    const createdOrg: Organization = {
      id: newId,
      name: newOrgData.name,
      logo: generatedLogo,
      description: newOrgData.description || "Enterprise cloud client running ArthDrishti credit assessment engine.",
      industry: newOrgData.industry,
      website: newOrgData.website || `https://www.${newId}.com`,
      address: newOrgData.address || "Main Corporate Avenue, Zone 1",
      country: newOrgData.country,
      state: newOrgData.state,
      registrationNumber: newOrgData.registrationNumber,
      taxId: newOrgData.taxId,
      createdDate: new Date().toISOString().split("T")[0],
      subscription: newOrgData.subscription,
      subscriptionStatus: newOrgData.subscription === "Starter" ? "Trial" : "Active",
      billingCycle: newOrgData.billingCycle,
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      apiKey: `ad_live_${newId.replace("org-", "")}_${Math.random().toString(36).substring(2, 10)}`,
      storageUsed: 2,
      storageLimit: newOrgData.storageLimit,
      predictionVolume: 0,
      predictionLimit: newOrgData.predictionLimit,
      apiRequests: 0,
      apiRequestLimit: newOrgData.subscription === "Enterprise" ? 50000000 : 15000000,
      activeUsers: 1,
      userLimit: newOrgData.subscription === "Enterprise" ? 2000 : 300,
      bandwidthUsed: 0,
      bandwidthLimit: newOrgData.subscription === "Enterprise" ? 10000 : 3000,
      dbUsage: 1,
      dbLimit: newOrgData.subscription === "Enterprise" ? 2048 : 512,
      revenue: newOrgData.subscription === "Enterprise" ? 48000 : newOrgData.subscription === "Professional" ? 15000 : 3500,
      departments: ["Platform Operations", "Retail Risk Assessment"],
      branches: [initialBranch],
      members: [initialMember],
      activities: [initialActivity],
      metrics: {
        memberGrowth: [{ date: "Jul", value: 1 }],
        predictionUsage: [{ date: "Jul", value: 0 }],
        monthlyActiveUsers: [{ date: "Jul", value: 1 }],
        storageGrowth: [{ date: "Jul", value: 2 }],
        apiUsage: [{ date: "Jul", value: 0 }],
        revenueTrend: [{ date: "Jul", value: 0 }]
      }
    };

    setOrganizations(prev => [createdOrg, ...prev]);
    setIsCreateOpen(false);
    setCreateStep(1);
    // Reset wizard object
    setNewOrgData({
      name: "",
      logo: "",
      description: "",
      industry: "Banking",
      website: "",
      address: "",
      country: "India",
      state: "Delhi",
      registrationNumber: "",
      taxId: "",
      subscription: "Professional",
      billingCycle: "Annual",
      storageLimit: 2000,
      predictionLimit: 2000000,
      adminName: "",
      adminEmail: "",
      adminPassword: ""
    });
    toast.success(`Organization '${createdOrg.name}' has been provisioned successfully.`);
  };

  // Branch CRUD Simulator
  const handleAddBranchSubmit = () => {
    if (!selectedOrg) return;
    if (!newBranchData.name) {
      toast.error("Branch name is required.");
      return;
    }

    const newBranch: Branch = {
      id: `br-${selectedOrg.id}-${Date.now()}`,
      name: newBranchData.name,
      city: newBranchData.city || selectedOrg.state,
      state: newBranchData.state,
      manager: newBranchData.manager || "Unassigned Manager",
      employees: newBranchData.employees,
      status: newBranchData.status
    };

    const actionLog: ActivityLog = {
      id: `act-br-${Date.now()}`,
      type: "Branch Added",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: `Branch '${newBranchData.name}' created in ${newBranchData.city}, ${newBranchData.state}.`
    };

    const updatedOrg: Organization = {
      ...selectedOrg,
      branches: [...selectedOrg.branches, newBranch],
      activities: [actionLog, ...selectedOrg.activities]
    };

    updateOrgInState(updatedOrg);
    setIsAddBranchOpen(false);
    setNewBranchData({ name: "", city: "", state: selectedOrg.state, manager: "", employees: 10, status: "Active" });
    toast.success(`Branch '${newBranch.name}' added successfully.`);
  };

  const handleDeactivateBranch = (branchId: string) => {
    if (!selectedOrg) return;
    const branch = selectedOrg.branches.find(b => b.id === branchId);
    if (!branch) return;

    const newStatus = branch.status === "Active" ? "Inactive" : "Active";
    
    const updatedBranches = selectedOrg.branches.map(b => 
      b.id === branchId ? { ...b, status: newStatus as "Active" | "Inactive" } : b
    );

    const actionLog: ActivityLog = {
      id: `act-br-${Date.now()}`,
      type: "Settings Updated",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: `Branch '${branch.name}' status set to ${newStatus}.`
    };

    const updatedOrg = {
      ...selectedOrg,
      branches: updatedBranches,
      activities: [actionLog, ...selectedOrg.activities]
    };

    updateOrgInState(updatedOrg);
    toast.info(`Branch '${branch.name}' status set to ${newStatus}.`);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (!selectedOrg) return;
    const branch = selectedOrg.branches.find(b => b.id === branchId);
    if (!branch) return;

    if (confirm(`Delete branch '${branch.name}'? This cannot be undone.`)) {
      const updatedBranches = selectedOrg.branches.filter(b => b.id !== branchId);

      const actionLog: ActivityLog = {
        id: `act-br-${Date.now()}`,
        type: "Settings Updated",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        detail: `Branch '${branch.name}' deleted.`
      };

      const updatedOrg = {
        ...selectedOrg,
        branches: updatedBranches,
        activities: [actionLog, ...selectedOrg.activities]
      };

      updateOrgInState(updatedOrg);
      toast.success(`Branch '${branch.name}' deleted.`);
    }
  };

  // Member CRUD Simulator
  const handleInviteMemberSubmit = () => {
    if (!selectedOrg) return;
    if (!newMemberData.name || !newMemberData.email) {
      toast.error("Name and Email addresses are required fields.");
      return;
    }

    const newMember: Member = {
      id: `mem-${selectedOrg.id}-${Date.now()}`,
      name: newMemberData.name,
      email: newMemberData.email,
      role: newMemberData.role,
      department: newMemberData.department || "General Risk",
      branch: newMemberData.branch || selectedOrg.branches[0]?.name || "Main HQ",
      status: "Pending", // defaults to pending invitation
      lastLogin: "Never"
    };

    const actionLog: ActivityLog = {
      id: `act-mem-${Date.now()}`,
      type: "Member Invited",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: `Invitation key dispatched to ${newMemberData.email} with role: ${newMemberData.role}.`
    };

    const updatedOrg: Organization = {
      ...selectedOrg,
      members: [...selectedOrg.members, newMember],
      activities: [actionLog, ...selectedOrg.activities]
    };

    updateOrgInState(updatedOrg);
    setIsInviteMemberOpen(false);
    setNewMemberData({ name: "", email: "", role: "Staff", department: "", branch: "", status: "Active" });
    toast.success(`Invitation sent to '${newMember.name}' (${newMember.email}).`);
  };

  const handleDeactivateMember = (memberId: string) => {
    if (!selectedOrg) return;
    const member = selectedOrg.members.find(m => m.id === memberId);
    if (!member) return;

    const newStatus = member.status === "Active" ? "Inactive" : "Active";
    
    const updatedMembers = selectedOrg.members.map(m => 
      m.id === memberId ? { ...m, status: newStatus as any } : m
    );

    const updatedOrg = {
      ...selectedOrg,
      members: updatedMembers
    };

    updateOrgInState(updatedOrg);
    toast.info(`User status toggled to ${newStatus} for ${member.name}.`);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!selectedOrg) return;
    const member = selectedOrg.members.find(m => m.id === memberId);
    if (!member) return;

    if (confirm(`Remove member '${member.name}' from organization?`)) {
      const updatedMembers = selectedOrg.members.filter(m => m.id !== memberId);
      
      const actionLog: ActivityLog = {
        id: `act-mem-${Date.now()}`,
        type: "Settings Updated",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        detail: `Member '${member.name}' accounts and tokens deleted.`
      };

      const updatedOrg = {
        ...selectedOrg,
        members: updatedMembers,
        activities: [actionLog, ...selectedOrg.activities]
      };

      updateOrgInState(updatedOrg);
      toast.success(`Member record removed.`);
    }
  };

  // Subscription adjustment simulators
  const handleUpgradeSubscription = (target: "Starter" | "Professional" | "Enterprise" | "Custom") => {
    if (!selectedOrg) return;
    
    const limits = {
      Starter: { storage: 500, preds: 500000, rev: 3500 },
      Professional: { storage: 2000, preds: 2000000, rev: 15000 },
      Enterprise: { storage: 10000, preds: 10000000, rev: 48000 },
      Custom: { storage: 50000, preds: 100000000, rev: 120000 }
    };

    const actionLog: ActivityLog = {
      id: `act-sub-${Date.now()}`,
      type: "Plan Changed",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      detail: `Plan tier altered from ${selectedOrg.subscription} to ${target}. Quota caps revised.`
    };

    const updatedOrg: Organization = {
      ...selectedOrg,
      subscription: target,
      subscriptionStatus: "Active",
      storageLimit: limits[target].storage,
      predictionLimit: limits[target].preds,
      revenue: limits[target].rev,
      activities: [actionLog, ...selectedOrg.activities]
    };

    updateOrgInState(updatedOrg);
    toast.success(`Subscription updated to '${target}' for ${selectedOrg.name}.`);
  };

  // API key regeneration simulator
  const handleRegenApiKey = () => {
    if (!selectedOrg) return;
    if (confirm("Regenerate primary organization client API key? Current integrations will break until client configuration updates.")) {
      const generated = `ad_live_${selectedOrg.id.replace("org-", "")}_${Math.random().toString(36).substring(2, 10)}`;
      
      const actionLog: ActivityLog = {
        id: `act-api-${Date.now()}`,
        type: "API Key Generated",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        detail: "Client gateway integration API credential key regenerated."
      };

      const updatedOrg = {
        ...selectedOrg,
        apiKey: generated,
        activities: [actionLog, ...selectedOrg.activities]
      };

      updateOrgInState(updatedOrg);
      toast.success("API key regenerated. New key copied to visual clipboard.");
    }
  };

  // Mock settings submit
  const handleSaveSettings = (category: string) => {
    toast.success(`Organization settings for category [${category}] committed successfully.`);
  };

  // Bulk operation actions
  const handleBulkAction = (action: "activate" | "suspend" | "delete" | "export" | "plan") => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    if (selectedIds.length === 0) return;

    if (action === "delete") {
      if (confirm(`Expunge all ${selectedIds.length} selected organizations?`)) {
        setOrganizations(prev => prev.filter(o => !rowSelection[o.id]));
        setRowSelection({});
        toast.success(`Selected organizations expunged.`);
      }
    } else if (action === "activate") {
      setOrganizations(prev => prev.map(o => 
        rowSelection[o.id] ? { ...o, subscriptionStatus: "Active" } : o
      ));
      setRowSelection({});
      toast.success(`Updated status of selected organizations to Active.`);
    } else if (action === "suspend") {
      setOrganizations(prev => prev.map(o => 
        rowSelection[o.id] ? { ...o, subscriptionStatus: "Suspended" } : o
      ));
      setRowSelection({});
      toast.success(`Selected organizations suspended.`);
    } else if (action === "plan") {
      setOrganizations(prev => prev.map(o => 
        rowSelection[o.id] ? { ...o, subscription: bulkPlanTarget } : o
      ));
      setRowSelection({});
      toast.success(`Adjusted subscriptions for selected organizations to '${bulkPlanTarget}'.`);
    } else if (action === "export") {
      // Create JSON mock file download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(organizations.filter(o => rowSelection[o.id]), null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `org_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Registry schemas exported.`);
    }
  };

  // Column definitions for TanStack Table
  const columns = useMemo<ColumnDef<Organization>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded-xs accent-primary border-border cursor-pointer h-3.5 w-3.5"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all organizations"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded-xs accent-primary border-border cursor-pointer h-3.5 w-3.5"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select organization ${row.original.name}`}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Organization",
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-primary/10 border border-primary/20 text-primary font-heading font-bold text-xs flex items-center justify-center select-none flex-shrink-0">
              {org.logo}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-foreground hover:text-primary transition-colors">{org.name}</span>
              <span className="text-[10px] text-foreground-muted truncate max-w-[150px] font-sans">{org.website}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "industry",
      header: "Industry",
      cell: ({ cell }) => <span className="font-sans font-medium text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div className="flex items-center gap-1.5 text-foreground-secondary">
            <Globe className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="font-sans">{org.state}, {org.country}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "branches",
      header: "Branches",
      cell: ({ cell }) => {
        const branches = cell.getValue() as Branch[];
        return <span className="font-mono font-bold text-foreground">{branches.length}</span>;
      }
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ cell }) => {
        const members = cell.getValue() as Member[];
        return <span className="font-mono font-bold text-foreground">{members.length}</span>;
      }
    },
    {
      accessorKey: "subscription",
      header: "Subscription",
      cell: ({ row }) => {
        const org = row.original;
        const subColors: Record<string, string> = {
          Starter: "default",
          Professional: "forecast",
          Enterprise: "primary",
          Custom: "ai"
        };
        return <Badge variant={subColors[org.subscription] as any}>{org.subscription}</Badge>;
      }
    },
    {
      accessorKey: "storageUsed",
      header: "Storage",
      cell: ({ row }) => {
        const org = row.original;
        const pct = Math.round((org.storageUsed / org.storageLimit) * 100);
        return (
          <div className="flex flex-col gap-1 w-20">
            <span className="font-mono text-foreground font-semibold text-[10px]">
              {org.storageUsed >= 1000 ? `${(org.storageUsed/1000).toFixed(1)}TB` : `${org.storageUsed}GB`}
            </span>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  pct > 90 ? "bg-critical" : pct > 75 ? "bg-warning" : "bg-positive"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Status",
      cell: ({ cell }) => {
        const status = cell.getValue() as string;
        const statusMap: Record<string, any> = {
          Active: "active",
          Trial: "pending",
          Expired: "failed",
          Suspended: "retired"
        };
        return <StatusBadge status={statusMap[status] || "pending"} />;
      }
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: ({ cell }) => <span className="font-mono text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const org = row.original;
        const menuItems = [
          { id: "view", label: "View Details", icon: Info, onClick: () => handleOpenDrawer(org, "overview") },
          { id: "edit", label: "Edit Credentials", icon: Edit, onClick: () => handleEditClick(org) },
          { id: "members", label: "Members Directory", icon: Users, onClick: () => handleOpenDrawer(org, "members") },
          { id: "branches", label: "Branch Offices", icon: Building2, onClick: () => handleOpenDrawer(org, "branches") },
          { id: "subscription", label: "Subscription Billing", icon: CreditCard, onClick: () => handleOpenDrawer(org, "subscription") },
          { id: "usage", label: "Resource Usage", icon: Database, onClick: () => handleOpenDrawer(org, "usage") },
          { id: "activity", label: "Activity Logs", icon: Clock, onClick: () => handleOpenDrawer(org, "activity") },
          { id: "delete", label: "Delete Tenant", icon: Trash2, destructive: true, onClick: () => handleDeleteClick(org) }
        ];
        return (
          <div className="flex justify-end select-none">
            <Dropdown
              trigger={
                <button className="p-1 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer focus-visible:outline-2 outline-none">
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={menuItems}
              align="right"
            />
          </div>
        );
      }
    }
  ], [handleOpenDrawer, handleEditClick, handleDeleteClick]);

  // Table Setup
  const table = useReactTable({
    data: filteredOrganizations,
    columns,
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

  const selectedRowsCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header & Toolbar Action Ribbon */}
      <SectionHeader
        title="Organization Management"
        description="Manage organizations, branches, subscriptions, members, storage usage, platform access and enterprise settings."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick simulator error boundary link */}
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer hidden md:flex" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Draft organizations template downloaded. Import using CSV/XLSX.")}>
              Import Organizations
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(organizations, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `all_organizations_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              toast.success("Expedited full registry export completed.");
            }}>
              <Download className="h-4 w-4 shrink-0" />
              Export Registry
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setCreateStep(1); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 shrink-0" />
              Create Organization
            </Button>
          </div>
        }
      />

      {/* 2. Top Metric Counts Ribbon */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-surface border border-border px-4 py-3 rounded-sm text-xs font-sans select-none mb-6">
        <div className="flex flex-wrap items-center gap-6 text-foreground-secondary font-medium">
          <span className="flex items-center gap-1.5">
            Total Tenants: <span className="font-mono font-bold text-foreground">{kpis.total}</span>
          </span>
          <span className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            Active Status: <span className="font-mono font-bold text-positive">{kpis.active}</span>
          </span>
          <span className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            Sandbox Trials: <span className="font-mono font-bold text-warning">{kpis.trial}</span>
          </span>
          <span className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            Enterprise tier: <span className="font-mono font-bold text-primary">{kpis.enterprise}</span>
          </span>
        </div>
        {lastSyncTime && (
          <span className="text-[10px] text-foreground-muted">
            Last Registry Sync: <span className="font-mono font-bold">{lastSyncTime}</span>
          </span>
        )}
      </div>

      {/* ERROR STATE VIEW */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs animate-fadeIn">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical animate-pulse" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">Database Transaction Lock</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                ArthDrishti could not synchronize the multitenant access registries. Tenant instances list may be stale. Check internal infrastructure network configurations.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Retry Compliance Lock
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Bypass Diagnostics
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8">
          
          {/* 3. PREMIUM KPI CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 font-sans select-none">
            {[
              { label: "Total Orgs", val: kpis.total, trend: 12.5, icon: Building2, sparkline: KPI_SPARKLINES.totalOrgs, suffix: "" },
              { label: "Enterprise Customers", val: kpis.enterprise, trend: 9.8, icon: Sparkles, sparkline: KPI_SPARKLINES.enterpriseOrgs, suffix: "" },
              { label: "Branches", val: kpis.branches, trend: 15.4, icon: MapPin, sparkline: KPI_SPARKLINES.branches, suffix: "" },
              { label: "Active Members", val: kpis.members, trend: 8.2, icon: Users, sparkline: KPI_SPARKLINES.activeMembers, suffix: "" },
              { label: "Storage Used", val: kpis.storageUsed, trend: 11.2, icon: HardDrive, sparkline: KPI_SPARKLINES.storage, suffix: " TB" },
              { label: "API Usage", val: "142M", trend: 14.5, icon: Network, sparkline: KPI_SPARKLINES.apiUsage, suffix: "" },
              { label: "Prediction Vol", val: "7.4M", trend: 18.2, icon: Cpu, sparkline: KPI_SPARKLINES.predictions, suffix: "" },
              { label: "Revenue ARR", val: `$${(kpis.revenue/1000).toFixed(0)}k`, trend: 10.5, icon: TrendingUp, sparkline: KPI_SPARKLINES.revenue, suffix: "" }
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
                        <div className="flex items-center justify-between mt-1">
                          <TrendIndicator value={card.trend} className="text-[10px]" />
                          
                          {/* Mini Sparkline Inline SVG */}
                          <svg className="w-10 h-4 overflow-visible shrink-0" viewBox="0 0 10 4">
                            <polyline
                              fill="none"
                              stroke={card.trend > 0 ? COLORS.positive : COLORS.critical}
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

          {/* 4. FILTER TOOLBAR */}
          <Card>
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
              {/* Primary Search bar */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Global search by organization name, industry niche, state coordinates, website url..."
                  className="w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-xs text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Form Grid Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Industry</label>
                  <select
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Industries</option>
                    {MOCK_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Subscription Plan</label>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Plans</option>
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom">Custom</option>
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
                    <option value="Active">Active</option>
                    <option value="Trial">Trial Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Country</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => {
                      setFilterCountry(e.target.value);
                      setFilterState("All");
                    }}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Countries</option>
                    {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">State/Region</label>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    disabled={filterCountry === "All"}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="All">All Regions</option>
                    {filterCountry !== "All" && MOCK_STATES[filterCountry]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Tenant Size</label>
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Sizes</option>
                    <option value="Small">Small (&lt;5 users)</option>
                    <option value="Medium">Medium (5-10 users)</option>
                    <option value="Large">Large (&gt;10 users)</option>
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

                <div className="flex items-end gap-2 justify-end pt-3 sm:pt-0">
                  <Button variant="secondary" size="sm" className="w-full h-9 font-semibold shrink-0" onClick={handleResetFilters}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* Reset + Matching Counts */}
              <div className="flex items-center justify-between border-t border-border/40 pt-3 gap-3">
                <Button variant="outline" size="sm" onClick={handleSaveFilterView}>
                  Save View Preferences
                </Button>
                <span className="text-[10px] text-foreground-muted font-medium">
                  Filtered out <span className="font-mono font-bold text-foreground">{filteredOrganizations.length}</span> active client networks out of {organizations.length}.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 5. STICKY BULK ACTIONS BANNER */}
          <AnimatePresence>
            {selectedRowsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="sticky top-0 bg-surface-elevated border border-primary/20 p-3 rounded-sm flex flex-wrap items-center justify-between shadow-md z-30 select-none animate-fadeIn gap-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="primary" className="font-bold text-xs">{selectedRowsCount} Selected</Badge>
                  <span className="text-xs font-sans font-medium text-foreground-secondary hidden lg:inline">
                    Perform batch configuration actions across the selected active client nodes.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("export")}>
                    Bulk Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("activate")}>
                    Bulk Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("suspend")}>
                    Bulk Suspend
                  </Button>
                  
                  {/* Plan change */}
                  <div className="flex items-center gap-1.5 border border-border bg-surface px-2 rounded-xs h-9">
                    <span className="text-[10px] text-foreground-secondary font-bold font-sans uppercase">Plan:</span>
                    <select
                      value={bulkPlanTarget}
                      onChange={(e) => setBulkPlanTarget(e.target.value as any)}
                      className="bg-transparent text-[11px] font-sans font-semibold border-none outline-none cursor-pointer text-foreground pr-1"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("plan")}>
                    Apply Plan
                  </Button>

                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
                    Bulk Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. PRIMARY TANSTACK TABLE OR EMPTY/LOADING STATES */}
          <Card className="overflow-visible">
            <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <CardTitle>Tenant Directory</CardTitle>
                <CardDescription>Administrative routing controls and telemetry bounds for client financial interfaces.</CardDescription>
              </div>
              
              <div className="flex items-center gap-3 select-none">
                {/* Density Selector */}
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

                {/* Column Visibility */}
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-1.5 h-9 px-3 border border-border bg-surface rounded-xs text-xs font-semibold cursor-pointer outline-none focus-visible:outline-2">
                      <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                      Columns
                    </button>
                  }
                  items={table.getAllLeafColumns().filter(col => col.id !== "select" && col.id !== "actions").map(col => ({
                    id: col.id,
                    label: col.id === "name" ? "Organization" : col.id === "industry" ? "Industry" : col.id === "country" ? "Country" : col.id === "branches" ? "Branches" : col.id === "members" ? "Members" : col.id === "subscription" ? "Subscription" : col.id === "storageUsed" ? "Storage" : col.id === "subscriptionStatus" ? "Status" : "Created Date",
                    icon: col.getIsVisible() ? Check : undefined,
                    onClick: () => col.toggleVisibility(!col.getIsVisible())
                  }))}
                  align="right"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto relative min-h-[300px]">
              {isLoading ? (
                /* Skeleton table */
                <div className="space-y-4 p-5 animate-pulse">
                  <div className="h-9 bg-border/40 rounded-sm w-full" />
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-14 bg-border/30 rounded-sm w-full" />
                  ))}
                </div>
              ) : filteredOrganizations.length === 0 ? (
                /* Empty state */
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs max-w-sm mx-auto">
                  <div className="h-14 w-14 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold text-base text-foreground">No Organizations Found</h3>
                    <p className="text-xs text-foreground-secondary leading-normal">
                      No registered client bank credentials match current query filters. Restructure terms or initialize a tenant.
                    </p>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <Button variant="primary" size="sm" onClick={() => { setCreateStep(1); setIsCreateOpen(true); }}>
                      Create Organization
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              ) : (
                /* Actual TanStack Table */
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
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
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" && <ArrowUpRight className="h-3 w-3" />}
                              {header.column.getIsSorted() === "desc" && <ArrowDownRight className="h-3 w-3" />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {table.getRowModel().rows.map((row) => (
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
                              // Stop bubbling drawer clicks on checkbox & row action dropdowns
                              if (cell.column.id === "select" || cell.column.id === "actions") {
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
              )}
            </CardContent>

            {/* Pagination */}
            {!isLoading && filteredOrganizations.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between flex-wrap gap-4 select-none font-sans text-xs bg-surface-elevated/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground-secondary">Rows per page:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="bg-surface border border-border rounded-xs px-2 py-1 outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    {[5, 10, 20].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize} rows
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-foreground-secondary">
                    Page <span className="font-mono font-bold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-mono font-bold text-foreground">{table.getPageCount()}</span>
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. ORGANIZATIONS PROFILE DRAWER (SHEET OVERLAY) */}
      {/* ================================================== */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedOrg?.name || "Client Metadata"}
        className="w-full max-w-xl md:max-w-2xl border-l border-border"
      >
        {selectedOrg && (
          <div className="flex flex-col h-full justify-between pr-1 select-text">
            
            {/* Header Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-border/40 mb-5">
              <div className="h-12 w-12 rounded-sm bg-primary/10 border border-primary/20 text-primary font-heading font-bold text-lg flex items-center justify-center select-none flex-shrink-0">
                {selectedOrg.logo}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-semibold text-lg text-foreground">{selectedOrg.name}</h2>
                  <Badge variant="outline" className="text-[10px] py-0">{selectedOrg.industry}</Badge>
                </div>
                <p className="text-xs text-foreground-secondary leading-normal pr-4 mt-0.5">{selectedOrg.description}</p>
              </div>
            </div>

            {/* Inner Subtabs Definition */}
            <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-5 mb-5 select-none shrink-0">
              {[
                { id: "overview", label: "Overview", icon: Info },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "branches", label: `Branches (${selectedOrg.branches.length})`, icon: Building2 },
                { id: "members", label: `Members (${selectedOrg.members.length})`, icon: Users },
                { id: "subscription", label: "Subscription", icon: CreditCard },
                { id: "usage", label: "Usage Limits", icon: Database },
                { id: "settings", label: "Settings", icon: Settings },
                { id: "activity", label: "Timeline", icon: Clock }
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

            {/* Drawer Body Scroll Content */}
            <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-6 font-sans">
              
              {/* TAB 1: OVERVIEW */}
              {drawerActiveTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Entity detail list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 space-y-3.5">
                        <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider select-none border-b border-border/40 pb-1.5">Tenant Parameters</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-foreground-muted">Registration Num:</span> <span className="font-semibold text-foreground">{selectedOrg.registrationNumber}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Tax Identification:</span> <span className="font-semibold text-foreground">{selectedOrg.taxId}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Corporate URL:</span> <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{selectedOrg.website}</a></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Regional HQ:</span> <span className="font-semibold text-foreground">{selectedOrg.state}, {selectedOrg.country}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Registry Date:</span> <span className="font-semibold text-foreground">{selectedOrg.createdDate}</span></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3.5">
                        <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider select-none border-b border-border/40 pb-1.5">Subscription Overview</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-foreground-muted">Active Plan:</span> <Badge variant="primary">{selectedOrg.subscription}</Badge></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Billing Cycle:</span> <span className="font-semibold text-foreground">{selectedOrg.billingCycle}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Renewal Date:</span> <span className="font-semibold text-foreground font-mono">{selectedOrg.renewalDate}</span></div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Status:</span> 
                            <StatusBadge status={selectedOrg.subscriptionStatus === "Active" ? "active" : selectedOrg.subscriptionStatus === "Trial" ? "pending" : "retired"} />
                          </div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Annual Revenue:</span> <span className="font-semibold text-foreground font-mono">${selectedOrg.revenue.toLocaleString()}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* API Key Panel */}
                  <Card>
                    <CardHeader className="p-4 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Key className="h-4 w-4 text-foreground-muted" />API Credentials</CardTitle>
                        <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 font-bold cursor-pointer" onClick={handleRegenApiKey}>Regenerate Key</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex gap-2 items-center">
                        <input
                          type="password"
                          value={selectedOrg.apiKey}
                          readOnly
                          className="flex-1 h-9 px-3 bg-surface border border-border rounded-xs outline-none text-xs font-mono select-all"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 shrink-0 font-semibold"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrg.apiKey);
                            toast.success("API token key copied to system clipboard.");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-[10px] text-foreground-muted mt-2 leading-relaxed">
                        API key enables this organization to trigger risk prediction pipelines programmatically from external accounting nodes. Secure this key carefully.
                      </p>
                    </CardContent>
                  </Card>

                  {/* High level resource meters */}
                  <Card>
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Database className="h-4 w-4 text-foreground-muted" />Active Storage & Predictions Quota</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Storage */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-foreground-secondary">Storage Space ({Math.round((selectedOrg.storageUsed/selectedOrg.storageLimit)*100)}% used)</span>
                          <span className="font-mono text-foreground font-semibold">
                            {selectedOrg.storageUsed}GB / {selectedOrg.storageLimit}GB
                          </span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(selectedOrg.storageUsed/selectedOrg.storageLimit)*100}%` }} />
                        </div>
                      </div>

                      {/* Predictions */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-foreground-secondary">Prediction Models Volume ({Math.round((selectedOrg.predictionVolume/selectedOrg.predictionLimit)*100)}% consumed)</span>
                          <span className="font-mono text-foreground font-semibold">
                            {selectedOrg.predictionVolume.toLocaleString()} / {selectedOrg.predictionLimit.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-ai rounded-full" style={{ width: `${(selectedOrg.predictionVolume/selectedOrg.predictionLimit)*100}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {drawerActiveTab === "analytics" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Prediction Usage curve */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Prediction Requests</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedOrg.metrics.predictionUsage} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorPreds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.ai} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.ai} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="value" stroke={COLORS.ai} fillOpacity={1} fill="url(#colorPreds)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Member growth */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Member Seat Growth</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedOrg.metrics.memberGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Monthly active users */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Monthly Active Users (MAU)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedOrg.metrics.monthlyActiveUsers} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill={COLORS.forecast} radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Storage Growth */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Storage Growth (GB)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedOrg.metrics.storageGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="value" stroke={COLORS.positive} fillOpacity={1} fill="url(#colorStorage)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* API usage */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">API Consumptions (Million)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedOrg.metrics.apiUsage} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="value" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Revenue trend */}
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Revenue Stream Contribution (USD/k)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 pt-0 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedOrg.metrics.revenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 3: BRANCH MANAGEMENT */}
              {drawerActiveTab === "branches" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Registered Branch Offices</h3>
                    <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setIsAddBranchOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add Branch
                    </Button>
                  </div>

                  <Card className="overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/40 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                          <th className="p-3">Branch Name</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Manager</th>
                          <th className="p-3 text-center">Staff</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {selectedOrg.branches.map(b => (
                          <tr key={b.id} className="hover:bg-surface-hover/30">
                            <td className="p-3 font-semibold">{b.name}</td>
                            <td className="p-3 text-foreground-secondary">{b.city}, {b.state}</td>
                            <td className="p-3 text-foreground-secondary">{b.manager}</td>
                            <td className="p-3 font-mono font-bold text-center">{b.employees}</td>
                            <td className="p-3">
                              <StatusBadge status={b.status === "Active" ? "active" : "retired"} />
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button 
                                className="text-foreground-secondary hover:text-primary p-0.5 rounded-sm hover:bg-surface cursor-pointer outline-none"
                                onClick={() => handleDeactivateBranch(b.id)}
                                title="Toggle branch status"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-foreground-secondary hover:text-critical p-0.5 rounded-sm hover:bg-surface cursor-pointer outline-none"
                                onClick={() => handleDeleteBranch(b.id)}
                                title="Delete branch"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}

              {/* TAB 4: MEMBER MANAGEMENT */}
              {drawerActiveTab === "members" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Assigned User Accounts</h3>
                    <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setIsInviteMemberOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Invite Member
                    </Button>
                  </div>

                  <Card className="overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/40 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Affiliation</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Last Access</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {selectedOrg.members.map(m => (
                          <tr key={m.id} className="hover:bg-surface-hover/30">
                            <td className="p-3">
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-foreground">{m.name}</span>
                                <span className="text-[10px] text-foreground-muted font-sans font-mono">{m.email}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={m.role === "Administrator" ? "primary" : m.role === "Manager" ? "forecast" : "outline"}>
                                {m.role}
                              </Badge>
                            </td>
                            <td className="p-3 text-foreground-secondary">
                              <div className="flex flex-col">
                                <span>{m.department}</span>
                                <span className="text-[10px] text-foreground-muted">{m.branch}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <StatusBadge status={m.status === "Active" ? "active" : m.status === "Pending" ? "pending" : "retired"} />
                            </td>
                            <td className="p-3 font-mono font-medium text-foreground-secondary">{m.lastLogin}</td>
                            <td className="p-3 text-right space-x-2">
                              <button 
                                className="text-foreground-secondary hover:text-primary p-0.5 rounded-sm hover:bg-surface cursor-pointer outline-none"
                                onClick={() => handleDeactivateMember(m.id)}
                                title="Toggle member status"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-foreground-secondary hover:text-critical p-0.5 rounded-sm hover:bg-surface cursor-pointer outline-none"
                                onClick={() => handleDeleteMember(m.id)}
                                title="Delete member account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}

              {/* TAB 5: SUBSCRIPTION PANEL */}
              {drawerActiveTab === "subscription" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Current Active Plan Detail card */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5 flex justify-between items-center flex-wrap gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Plan Model</span>
                        <h3 className="font-heading font-semibold text-2xl text-foreground">{selectedOrg.subscription} Tier</h3>
                        <p className="text-xs text-foreground-secondary">
                          Current cycle renews automatically on <span className="font-bold text-foreground font-mono">{selectedOrg.renewalDate}</span> ({selectedOrg.billingCycle} contract).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info("Contacting compliance department to issue renewal contracts...")}>Renew Plan</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resource quotas checklist */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Quota Allowances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="p-4 rounded-sm border border-border bg-surface flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-foreground-muted font-medium">Storage Quota Cap:</span>
                          <p className="font-mono text-sm font-bold text-foreground">{selectedOrg.storageLimit} GB</p>
                        </div>
                        <HardDrive className="h-6 w-6 text-foreground-muted shrink-0" />
                      </div>

                      <div className="p-4 rounded-sm border border-border bg-surface flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-foreground-muted font-medium">Monthly Predictions Limit:</span>
                          <p className="font-mono text-sm font-bold text-foreground">{selectedOrg.predictionLimit.toLocaleString()}</p>
                        </div>
                        <Cpu className="h-6 w-6 text-foreground-muted shrink-0" />
                      </div>

                      <div className="p-4 rounded-sm border border-border bg-surface flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-foreground-muted font-medium">Monthly API Requests:</span>
                          <p className="font-mono text-sm font-bold text-foreground">{selectedOrg.apiRequestLimit.toLocaleString()}</p>
                        </div>
                        <Network className="h-6 w-6 text-foreground-muted shrink-0" />
                      </div>

                      <div className="p-4 rounded-sm border border-border bg-surface flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-foreground-muted font-medium">Seat Limit Allocation:</span>
                          <p className="font-mono text-sm font-bold text-foreground">{selectedOrg.userLimit} Users</p>
                        </div>
                        <Users className="h-6 w-6 text-foreground-muted shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Upgrade plans grids */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Upgrade / Downgrade Tiers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                      {[
                        { tier: "Starter", desc: "For digital micro lending labs", limit: "500 GB Storage" },
                        { tier: "Professional", desc: "For regional NBFC loan operations", limit: "2,000 GB Storage" },
                        { tier: "Enterprise", desc: "Full features & support SLAs", limit: "10,000 GB Storage" }
                      ].map((plan, idx) => (
                        <Card 
                          key={idx}
                          className={cn(
                            "p-4 flex flex-col justify-between gap-3 text-xs border border-border",
                            selectedOrg.subscription === plan.tier && "border-primary bg-primary/5"
                          )}
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-foreground block text-sm">{plan.tier}</span>
                            <span className="text-foreground-muted text-[10px] leading-tight block">{plan.desc}</span>
                            <span className="text-[10px] text-foreground-secondary block font-bold font-mono">{plan.limit}</span>
                          </div>
                          {selectedOrg.subscription !== plan.tier ? (
                            <Button variant="outline" size="sm" className="w-full font-semibold h-8" onClick={() => handleUpgradeSubscription(plan.tier as any)}>
                              Apply Upgrade
                            </Button>
                          ) : (
                            <Badge variant="primary" className="text-center justify-center font-bold font-sans">Current tier</Badge>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: RESOURCE USAGE */}
              {drawerActiveTab === "usage" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-sm font-semibold text-foreground">Detailed Quota Consumptions</h3>
                  
                  <div className="space-y-4">
                    {/* Storage */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground-secondary flex items-center gap-1"><HardDrive className="h-4 w-4 text-foreground-muted" /> Disk Storage ({Math.round((selectedOrg.storageUsed/selectedOrg.storageLimit)*100)}% Used)</span>
                        <span className="font-mono text-foreground font-semibold">{selectedOrg.storageUsed}GB / {selectedOrg.storageLimit}GB</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(selectedOrg.storageUsed/selectedOrg.storageLimit)*100}%` }} />
                      </div>
                    </div>

                    {/* Predictions */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground-secondary flex items-center gap-1"><Cpu className="h-4 w-4 text-foreground-muted" /> AI Predictions Volume ({Math.round((selectedOrg.predictionVolume/selectedOrg.predictionLimit)*100)}% Used)</span>
                        <span className="font-mono text-foreground font-semibold">{selectedOrg.predictionVolume.toLocaleString()} / {selectedOrg.predictionLimit.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-ai rounded-full" style={{ width: `${(selectedOrg.predictionVolume/selectedOrg.predictionLimit)*100}%` }} />
                      </div>
                    </div>

                    {/* Bandwidth */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground-secondary flex items-center gap-1"><Network className="h-4 w-4 text-foreground-muted" /> Network Bandwidth ({Math.round((selectedOrg.bandwidthUsed/selectedOrg.bandwidthLimit)*100)}% Consumed)</span>
                        <span className="font-mono text-foreground font-semibold">{selectedOrg.bandwidthUsed}GB / {selectedOrg.bandwidthLimit}GB</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-forecast rounded-full" style={{ width: `${(selectedOrg.bandwidthUsed/selectedOrg.bandwidthLimit)*100}%` }} />
                      </div>
                    </div>

                    {/* API consumption */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground-secondary flex items-center gap-1"><Server className="h-4 w-4 text-foreground-muted" /> API Consumptions ({Math.round((selectedOrg.apiRequests/selectedOrg.apiRequestLimit)*100)}% Used)</span>
                        <span className="font-mono text-foreground font-semibold">{selectedOrg.apiRequests.toLocaleString()} / {selectedOrg.apiRequestLimit.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: `${(selectedOrg.apiRequests/selectedOrg.apiRequestLimit)*100}%` }} />
                      </div>
                    </div>

                    {/* Database Usage */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground-secondary flex items-center gap-1"><Database className="h-4 w-4 text-foreground-muted" /> Relational Database Space ({Math.round((selectedOrg.dbUsage/selectedOrg.dbLimit)*100)}% Occupied)</span>
                        <span className="font-mono text-foreground font-semibold">{selectedOrg.dbUsage}MB / {selectedOrg.dbLimit}MB</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-positive rounded-full" style={{ width: `${(selectedOrg.dbUsage/selectedOrg.dbLimit)*100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SETTINGS */}
              {drawerActiveTab === "settings" && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-semibold text-foreground">Enterprise Configuration Groups</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* General Settings */}
                    <Card>
                      <CardHeader className="p-4 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Info className="h-4 w-4 text-foreground-muted" />General Identity Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground-secondary">Entity Name</label>
                          <input type="text" defaultValue={selectedOrg.name} className="w-full h-9 px-3 bg-surface-elevated border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground-secondary">Corporate Description</label>
                          <textarea rows={2} defaultValue={selectedOrg.description} className="w-full p-2.5 bg-surface-elevated border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground" />
                        </div>
                        <Button variant="primary" size="sm" onClick={() => handleSaveSettings("General Identity")}>Save General Info</Button>
                      </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                      <CardHeader className="p-4 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Palette className="h-4 w-4 text-foreground-muted" />Branding</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5 text-xs font-sans">
                        <div className="flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-sm bg-primary/10 border border-primary/20 text-primary font-heading font-bold text-base flex items-center justify-center select-none flex-shrink-0">
                            {selectedOrg.logo}
                          </div>
                          <div className="space-y-1">
                            <span className="font-semibold text-foreground block">Workspace Logo Avatar</span>
                            <span className="text-[10px] text-foreground-muted">Provide 2 letters representing bank. Will replace standard headers.</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-foreground-secondary">Primary Hex Accent Color</label>
                          <input type="color" defaultValue={COLORS.primary} className="w-14 h-9 bg-transparent cursor-pointer rounded-xs" />
                        </div>
                        <Button variant="primary" size="sm" onClick={() => handleSaveSettings("Branding Accent")}>Save Branding</Button>
                      </CardContent>
                    </Card>

                    {/* Authentication */}
                    <Card>
                      <CardHeader className="p-4 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Fingerprint className="h-4 w-4 text-foreground-muted" />SSO & Authentication</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3 text-xs font-sans">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div>
                            <span className="font-semibold text-foreground block">Force SSO Authentications</span>
                            <span className="text-[10px] text-foreground-muted block mt-0.5">Restrict access to corporate Active Directory configurations.</span>
                          </div>
                          <input type="checkbox" defaultChecked className="accent-primary h-4 w-4 cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div>
                            <span className="font-semibold text-foreground block">Enforce Multi-Factor MFA</span>
                            <span className="text-[10px] text-foreground-muted block mt-0.5">Enforce authenticator app tokens globally across workspace seats.</span>
                          </div>
                          <input type="checkbox" defaultChecked className="accent-primary h-4 w-4 cursor-pointer" />
                        </div>
                        <Button variant="primary" size="sm" onClick={() => handleSaveSettings("SSO/MFA security")}>Save Authentication Settings</Button>
                      </CardContent>
                    </Card>

                    {/* Security IP restrictions */}
                    <Card>
                      <CardHeader className="p-4 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Shield className="h-4 w-4 text-foreground-muted" />Network Security & Whitelisting</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground-secondary">Whitelisted IPv4 Address Ranges (CIDR)</label>
                          <input type="text" defaultValue="10.22.45.*, 103.45.12.0/24" className="w-full h-9 px-3 bg-surface-elevated border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono" />
                        </div>
                        <Button variant="primary" size="sm" onClick={() => handleSaveSettings("IP restrictions")}>Save IP Firewalls</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 8: ACTIVITY TIMELINE */}
              {drawerActiveTab === "activity" && (
                <div className="space-y-4 animate-fadeIn pr-2">
                  <h3 className="text-sm font-semibold text-foreground">Security Action Ledger</h3>
                  
                  <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-1 text-xs">
                    {selectedOrg.activities.map(log => {
                      const logColors = {
                        "Organization Created": "bg-positive text-white border-positive",
                        "Plan Changed": "bg-ai text-white border-ai",
                        "Branch Added": "bg-forecast text-white border-forecast",
                        "Member Invited": "bg-warning text-white border-warning",
                        "API Key Generated": "bg-primary text-white border-primary",
                        "Settings Updated": "bg-secondary text-white border-secondary"
                      };
                      return (
                        <div key={log.id} className="relative space-y-1">
                          {/* Dot indicator */}
                          <div className={cn(
                            "absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-background",
                            logColors[log.type]?.split(" ")[0] || "bg-border"
                          )} />
                          
                          <div className="flex items-center justify-between text-[10px] text-foreground-muted select-none">
                            <span className="font-bold uppercase tracking-wider">{log.type}</span>
                            <span className="font-mono">{log.timestamp}</span>
                          </div>
                          <p className="text-foreground font-medium pr-2 leading-relaxed">{log.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-border/40 flex justify-between items-center select-none shrink-0 bg-surface-elevated/10 p-4">
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(selectedOrg)}>
                Expunge Tenant
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>Close View</Button>
                <Button variant="primary" size="sm" onClick={() => handleEditClick(selectedOrg)}>Edit Credentials</Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* ================================================== */}
      {/* 8. CREATE ORGANIZATION MODAL (MULTI-STEP WIZARD) */}
      {/* ================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Enterprise Workspace Tenant"
        className="max-w-xl animate-fadeIn"
      >
        <div className="space-y-6 font-sans text-xs">
          
          {/* Step Progress indicators */}
          <div className="flex justify-between items-center select-none border-b border-border/40 pb-4 mb-4">
            {[1, 2, 3, 4, 5].map(step => (
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
                  {step === 1 ? "Identity" : step === 2 ? "Contact" : step === 3 ? "Quotas" : step === 4 ? "Admin" : "Review"}
                </span>
                {step < 5 && <div className="h-px bg-border w-4 sm:w-6" />}
              </div>
            ))}
          </div>

          {/* STEP 1: GENERAL IDENTITY */}
          {createStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 1: General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrgData.name}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. State Bank of India"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Industry Sector</label>
                  <select
                    value={newOrgData.industry}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, industry: e.target.value as any }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    {MOCK_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Custom Logo Abbreviation (2 letters)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newOrgData.logo}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, logo: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SB"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-heading font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Corporate Website</label>
                  <input
                    type="url"
                    value={newOrgData.website}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="e.g. https://www.sbi.co.in"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Organization Description</label>
                  <textarea
                    rows={2}
                    value={newOrgData.description}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide brief statement outlining entity market niche, branches span, or risk profiling objectives."
                    className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT DETAILS & TAX */}
          {createStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 2: Contact Details & Tax IDs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Country Location *</label>
                  <select
                    value={newOrgData.country}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, country: e.target.value, state: MOCK_STATES[e.target.value]?.[0] || "" }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    {MOCK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">State / Region Province *</label>
                  <select
                    value={newOrgData.state}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    {MOCK_STATES[newOrgData.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Government Registration Code *</label>
                  <input
                    type="text"
                    required
                    value={newOrgData.registrationNumber}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="CIN registration key"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Entity Tax ID / GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={newOrgData.taxId}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="Corporate TAX ID"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Physical Office Address Address</label>
                  <input
                    type="text"
                    value={newOrgData.address}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full headquarters building location"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUBSCRIPTION & LIMITS */}
          {createStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 3: Subscription & Quota Limits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Subscription Plan Tier</label>
                  <select
                    value={newOrgData.subscription}
                    onChange={(e) => {
                      const sub = e.target.value;
                      const storageMap = { Starter: 500, Professional: 2000, Enterprise: 10000, Custom: 50000 };
                      const predMap = { Starter: 500000, Professional: 2000000, Enterprise: 10000000, Custom: 100000000 };
                      setNewOrgData(prev => ({ 
                        ...prev, 
                        subscription: sub as any, 
                        storageLimit: storageMap[sub as keyof typeof storageMap],
                        predictionLimit: predMap[sub as keyof typeof predMap]
                      }));
                    }}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom">Custom Scope</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Billing Cycle</label>
                  <select
                    value={newOrgData.billingCycle}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual (Discount Applied)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Disk Space Quota Allowance (GB)</label>
                  <input
                    type="number"
                    value={newOrgData.storageLimit}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, storageLimit: Number(e.target.value) }))}
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Monthly Models Evaluation Cap</label>
                  <input
                    type="number"
                    value={newOrgData.predictionLimit}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, predictionLimit: Number(e.target.value) }))}
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRIMARY ADMIN USER */}
          {createStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 4: Primary Workspace Root Administrator</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Administrator Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrgData.adminName}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, adminName: e.target.value }))}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newOrgData.adminEmail}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="e.g. r.chandra@sbi.co.in"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Secure Access Password *</label>
                  <input
                    type="password"
                    required
                    value={newOrgData.adminPassword}
                    onChange={(e) => setNewOrgData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    placeholder="Establish secure temporary login password"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {createStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 5: Review & Commission</h3>
              
              <div className="bg-surface-elevated border border-border p-4 rounded-sm space-y-3.5">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-semibold text-foreground text-sm">{newOrgData.name}</span>
                  <Badge variant="primary">{newOrgData.subscription}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-sans text-foreground-secondary">
                  <div><span className="text-foreground-muted">Industry:</span> {newOrgData.industry}</div>
                  <div><span className="text-foreground-muted">Location:</span> {newOrgData.state}, {newOrgData.country}</div>
                  <div><span className="text-foreground-muted">Reg Number:</span> <span className="font-mono">{newOrgData.registrationNumber}</span></div>
                  <div><span className="text-foreground-muted">TAX ID:</span> <span className="font-mono">{newOrgData.taxId}</span></div>
                  <div><span className="text-foreground-muted">Limits Space:</span> <span className="font-mono">{newOrgData.storageLimit} GB</span></div>
                  <div><span className="text-foreground-muted">Limits Models:</span> <span className="font-mono">{newOrgData.predictionLimit.toLocaleString()} monthly</span></div>
                  <div className="col-span-2 border-t border-border/40 pt-2.5">
                    <span className="text-foreground-muted block font-semibold mb-0.5">Primary Administrator:</span>
                    <span className="font-medium text-foreground">{newOrgData.adminName} ({newOrgData.adminEmail})</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-positive/10 border border-positive/20 text-positive rounded-sm flex items-start gap-2.5 leading-relaxed font-sans">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Confirming provisioning will construct a dedicated multitenant database, whitelist corporate domains, dispatch administration invites, and generate client authorization API credentials.
                </span>
              </div>
            </div>
          )}

          {/* Footer Navigation wizard */}
          <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-6 select-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (createStep === 1) setIsCreateOpen(false);
                else setCreateStep(prev => prev - 1);
              }}
            >
              {createStep === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={createStep === 5 ? handleCreateSubmit : handleCreateStepNext}
            >
              {createStep === 5 ? "Create Organization" : "Next"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================================================== */}
      {/* 9. ADD BRANCH DIALOG MODAL (INSIDE DRAWER) */}
      {/* ================================================== */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Add Corporate Branch Office"
        className="max-w-md animate-fadeIn"
      >
        {selectedOrg && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Branch Office Name *</label>
              <input
                type="text"
                required
                value={newBranchData.name}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Pune Zonal Office"
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">City Location</label>
                <input
                  type="text"
                  value={newBranchData.city}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Pune"
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">State Coordinate</label>
                <select
                  value={newBranchData.state}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                >
                  {MOCK_STATES[selectedOrg.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Branch General Manager</label>
                <input
                  type="text"
                  value={newBranchData.manager}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, manager: e.target.value }))}
                  placeholder="e.g. Sunil Gavaskar"
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Employee Seat Assignment</label>
                <input
                  type="number"
                  value={newBranchData.employees}
                  onChange={(e) => setNewBranchData(prev => ({ ...prev, employees: Number(e.target.value) }))}
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Initial Launch Status</label>
              <select
                value={newBranchData.status}
                onChange={(e) => setNewBranchData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
              >
                <option value="Active">Active Operational</option>
                <option value="Inactive">Deactivated</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsAddBranchOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAddBranchSubmit}>Add Branch</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================== */}
      {/* 10. INVITE MEMBER DIALOG MODAL (INSIDE DRAWER) */}
      {/* ================================================== */}
      <Modal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
        title="Invite Organization Member"
        className="max-w-md animate-fadeIn"
      >
        {selectedOrg && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Full Name *</label>
              <input
                type="text"
                required
                value={newMemberData.name}
                onChange={(e) => setNewMemberData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ramesh Chahar"
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Corporate Email *</label>
              <input
                type="email"
                required
                value={newMemberData.email}
                onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. ramesh@organization.com"
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Security Role</label>
                <select
                  value={newMemberData.role}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff Officer</option>
                  <option value="Viewer">Auditor Viewer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Department</label>
                <input
                  type="text"
                  value={newMemberData.department}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Retail Lending"
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Assigned Branch Office</label>
              <select
                value={newMemberData.branch}
                onChange={(e) => setNewMemberData(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
              >
                {selectedOrg.branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsInviteMemberOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleInviteMemberSubmit}>Dispatched Invite</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================== */}
      {/* 11. EDIT ORGANIZATIONAL CREDENTIALS DIALOG */}
      {/* ================================================== */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit credentials for ${orgToEdit?.name}`}
        className="max-w-md animate-fadeIn"
      >
        {orgToEdit && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Organization Name</label>
              <input
                type="text"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Corporate Website</label>
              <input
                type="url"
                value={newOrgData.website}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Government Reg Code</label>
                <input
                  type="text"
                  value={newOrgData.registrationNumber}
                  onChange={(e) => setNewOrgData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground-secondary font-bold">Corporate Tax ID</label>
                <input
                  type="text"
                  value={newOrgData.taxId}
                  onChange={(e) => setNewOrgData(prev => ({ ...prev, taxId: e.target.value }))}
                  className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Regional HQ Address</label>
              <input
                type="text"
                value={newOrgData.address}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>Save Credentials</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
