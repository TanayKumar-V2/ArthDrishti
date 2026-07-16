"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  Building2,
  Settings,
  Cpu,
  Activity,
  Plus,
  RefreshCw,
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Edit,
  Trash2,
  Copy,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
  MapPin,
  Laptop,
  Check,
  MoreVertical,
  PlusCircle,
  HelpCircle,
  UserMinus,
  Briefcase,
  Key,
  Shield
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
  INITIAL_ROLES,
  INITIAL_ROLE_USERS,
  INITIAL_ACCESS_POLICIES,
  INITIAL_AUDIT_HISTORY,
  MOCK_PERMISSION_GROUPS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_SPARKLINES,
  SystemRole,
  RoleUser,
  AccessPolicy,
  RoleAuditLog,
  PermissionAction,
  PermissionModule,
  PermissionMatrix
} from "@/lib/roles_data";

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

export default function RolePermissionManagementPage() {
  // Page lifecycle
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Core Data States
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [users, setUsers] = useState<RoleUser[]>([]);
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [auditLogs, setAuditLogs] = useState<RoleAuditLog[]>([]);

  // Filtering / Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"All" | "System Default" | "Custom">("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");

  // Table Configuration States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"compact" | "comfortable" | "loose">("comfortable");

  // Details Drawer States
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState("details");

  // Wizard Triggers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);

  // Active Role targets for dialogs
  const [roleToEdit, setRoleToEdit] = useState<SystemRole | null>(null);
  const [roleToClone, setRoleToClone] = useState<SystemRole | null>(null);

  // User Roster Management within Drawer
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserToAssign, setSelectedUserToAssign] = useState("");
  const [transferTargetRole, setTransferTargetRole] = useState("");

  // Create Role Steps Wizard
  const [createStep, setCreateStep] = useState(1);
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    description: "",
    category: "Custom" as SystemRole["category"],
    iconName: "ShieldCheck" as SystemRole["iconName"],
    groupsSelected: [] as string[],
    matrix: PERMISSION_MODULES.map(module => ({ module, actions: [] as PermissionAction[] }))
  });

  // Edit/Clone dynamic matrices
  const [editRoleMatrix, setEditRoleMatrix] = useState<PermissionMatrix[]>([]);

  // Accessibility States
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState(-1);

  // Initialize
  useEffect(() => {
    setMounted(true);
    setRoles(INITIAL_ROLES);
    setUsers(INITIAL_ROLE_USERS);
    setPolicies(INITIAL_ACCESS_POLICIES);
    setAuditLogs(INITIAL_AUDIT_HISTORY);
    setLastSyncTime(new Date().toLocaleTimeString());

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // System Sync
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setRowSelection({});
    
    setTimeout(() => {
      setRoles(INITIAL_ROLES);
      setUsers(INITIAL_ROLE_USERS);
      setPolicies(INITIAL_ACCESS_POLICIES);
      setAuditLogs(INITIAL_AUDIT_HISTORY);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("RBAC credentials synchronized with authentication vaults.");
    }, 600);
  }, []);

  // Dynamic KPI updates
  const kpis = useMemo(() => {
    const total = roles.length;
    const active = roles.filter(r => r.status === "Active").length;
    const custom = roles.filter(r => r.category === "Custom").length;
    const defaults = roles.filter(r => r.category === "System Default").length;
    const groups = Object.keys(MOCK_PERMISSION_GROUPS).length;
    const assignedUsers = roles.reduce((acc, curr) => acc + curr.usersCount, 0);

    return {
      total,
      active,
      custom,
      defaults,
      groups,
      assignedUsers
    };
  }, [roles]);

  // Sync role back to dataset
  const updateRoleInState = useCallback((updated: SystemRole) => {
    setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (selectedRole?.id === updated.id) {
      setSelectedRole(updated);
    }
  }, [selectedRole]);

  // Audits dispatcher
  const dispatchAuditLog = useCallback((type: RoleAuditLog["type"], detail: string) => {
    const newLog: RoleAuditLog = {
      id: `audit-${Date.now()}`,
      type,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "Rahul Chahar (Platform Admin)",
      detail
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // Filter Handler
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || role.category === filterCategory;
      const matchesStatus = filterStatus === "All" || role.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [roles, searchQuery, filterCategory, filterStatus]);

  // Drawer Handler
  const handleOpenDrawer = useCallback((role: SystemRole, tab = "details") => {
    setSelectedRole(role);
    setDrawerActiveTab(tab);
    setIsDrawerOpen(true);
  }, []);

  // Checkbox matrix toggle utility
  const toggleMatrixCell = (
    matrix: PermissionMatrix[], 
    setMatrix: React.Dispatch<React.SetStateAction<PermissionMatrix[]>>, 
    module: PermissionModule, 
    action: PermissionAction
  ) => {
    const updated = matrix.map(row => {
      if (row.module === module) {
        const hasAction = row.actions.includes(action);
        return {
          ...row,
          actions: hasAction 
            ? row.actions.filter(a => a !== action) 
            : [...row.actions, action]
        };
      }
      return row;
    });
    setMatrix(updated);
  };

  // Step wizard next
  const handleCreateStepNext = () => {
    if (createStep === 1 && !newRoleData.name) {
      toast.error("Role Name is a required parameter.");
      return;
    }
    setCreateStep(prev => prev + 1);
  };

  const handleCreateSubmit = () => {
    const newId = `role-${newRoleData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const permissionsCount = newRoleData.matrix.reduce((acc, curr) => acc + curr.actions.length, 0);

    const createdRole: SystemRole = {
      id: newId,
      name: newRoleData.name,
      category: "Custom",
      description: newRoleData.description || "Custom enterprise permission layout.",
      usersCount: 0,
      permissionsCount,
      status: "Active",
      iconName: newRoleData.iconName,
      createdBy: "Rahul Chahar",
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      matrix: newRoleData.matrix
    };

    setRoles(prev => [...prev, createdRole]);
    dispatchAuditLog("Role Created", `Custom role '${createdRole.name}' provisioned in directory.`);
    setIsCreateOpen(false);
    // Reset wizard
    setCreateStep(1);
    setNewRoleData({
      name: "",
      description: "",
      category: "Custom",
      iconName: "ShieldCheck",
      groupsSelected: [],
      matrix: PERMISSION_MODULES.map(module => ({ module, actions: [] }))
    });
    toast.success(`Role '${createdRole.name}' created successfully.`);
  };

  // Setup matrices in Wizard step 2 (Coarse assignment based on groups)
  const handleGroupSelect = (groupName: string) => {
    const isSelected = newRoleData.groupsSelected.includes(groupName);
    const updatedGroups = isSelected 
      ? newRoleData.groupsSelected.filter(g => g !== groupName)
      : [...newRoleData.groupsSelected, groupName];

    // Recalculate matrix permissions
    const affectedModules = MOCK_PERMISSION_GROUPS[groupName] || [];
    const updatedMatrix = newRoleData.matrix.map(row => {
      if (affectedModules.includes(row.module)) {
        // If selecting: add typical View/Create/Edit actions. If deselecting: clear actions.
        return {
          ...row,
          actions: isSelected ? [] : (["View", "Create", "Edit"] as PermissionAction[])
        };
      }
      return row;
    });

    setNewRoleData(prev => ({
      ...prev,
      groupsSelected: updatedGroups,
      matrix: updatedMatrix
    }));
  };

  // Edit Submit
  const handleEditClick = useCallback((role: SystemRole) => {
    setRoleToEdit(role);
    setEditRoleMatrix([...role.matrix]);
    setNewRoleData(prev => ({
      ...prev,
      name: role.name,
      description: role.description,
      category: role.category,
      iconName: role.iconName
    }));
    setIsEditOpen(true);
  }, []);

  const handleEditSubmit = () => {
    if (!roleToEdit) return;

    const permissionsCount = editRoleMatrix.reduce((acc, curr) => acc + curr.actions.length, 0);
    const updated: SystemRole = {
      ...roleToEdit,
      name: newRoleData.name,
      description: newRoleData.description,
      permissionsCount,
      lastModified: new Date().toISOString().split("T")[0],
      matrix: editRoleMatrix
    };

    updateRoleInState(updated);
    dispatchAuditLog("Permissions Updated", `Permissions matrix modified for role '${updated.name}'.`);
    setIsEditOpen(false);
    toast.success(`Role '${updated.name}' configurations committed.`);
  };

  // Duplicate / Clone Role
  const handleCloneClick = useCallback((role: SystemRole) => {
    setRoleToClone(role);
    setNewRoleData(prev => ({
      ...prev,
      name: `${role.name} Copy`,
      description: `Duplicate of ${role.name}. ${role.description}`,
      category: "Custom",
      iconName: role.iconName
    }));
    setIsCloneOpen(true);
  }, []);

  const handleCloneSubmit = () => {
    if (!roleToClone) return;
    const newId = `role-${newRoleData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    
    const cloned: SystemRole = {
      id: newId,
      name: newRoleData.name,
      category: "Custom",
      description: newRoleData.description,
      usersCount: 0,
      permissionsCount: roleToClone.permissionsCount,
      status: "Active",
      iconName: newRoleData.iconName,
      createdBy: "Rahul Chahar",
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      matrix: [...roleToClone.matrix]
    };

    setRoles(prev => [...prev, cloned]);
    dispatchAuditLog("Role Created", `Custom role '${cloned.name}' cloned from template '${roleToClone.name}'.`);
    setIsCloneOpen(false);
    toast.success(`Duplicated role '${roleToClone.name}' as '${cloned.name}'.`);
  };

  // Delete Role
  const handleDeleteClick = useCallback((role: SystemRole) => {
    if (role.category === "System Default") {
      toast.error("System Default roles cannot be deleted. Modifying access policies is disabled.");
      return;
    }

    if (confirm(`Expunge custom role '${role.name}'? Users assigned to this role will lose platform permissions.`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      dispatchAuditLog("RoleDeleted" as any, `Custom role '${role.name}' expunged from the registry.`);
      if (selectedRole?.id === role.id) {
        setIsDrawerOpen(false);
      }
      toast.success(`Role expunged.`);
    }
  }, [selectedRole, dispatchAuditLog]);

  // User assignments inside Drawer
  const handleAssignUser = () => {
    if (!selectedRole || !selectedUserToAssign) return;
    
    const targetUser = users.find(u => u.id === selectedUserToAssign);
    if (!targetUser) return;

    // Simulate updating role's usersCount
    const updatedRole = {
      ...selectedRole,
      usersCount: selectedRole.usersCount + 1
    };

    updateRoleInState(updatedRole);
    dispatchAuditLog("User Assigned", `Assigned user '${targetUser.name}' to role '${selectedRole.name}'.`);
    setSelectedUserToAssign("");
    setIsAssignUserOpen(false);
    toast.success(`User '${targetUser.name}' assigned to role '${selectedRole.name}'.`);
  };

  const handleRemoveUser = (userName: string) => {
    if (!selectedRole) return;
    if (confirm(`Remove user '${userName}' from role '${selectedRole.name}'?`)) {
      const updatedRole = {
        ...selectedRole,
        usersCount: Math.max(0, selectedRole.usersCount - 1)
      };
      updateRoleInState(updatedRole);
      dispatchAuditLog("User Removed", `Removed user '${userName}' from role '${selectedRole.name}'.`);
      toast.success(`User access seat de-allocated.`);
    }
  };

  const handleTransferRole = (userName: string) => {
    if (!selectedRole || !transferTargetRole) return;
    
    const targetRole = roles.find(r => r.id === transferTargetRole);
    if (!targetRole) return;

    // Decrease from current, increase in target
    const currentUpdated = {
      ...selectedRole,
      usersCount: Math.max(0, selectedRole.usersCount - 1)
    };
    const targetUpdated = {
      ...targetRole,
      usersCount: targetRole.usersCount + 1
    };

    updateRoleInState(currentUpdated);
    setRoles(prev => prev.map(r => r.id === targetUpdated.id ? targetUpdated : r));
    dispatchAuditLog("User Removed", `Transferred user '${userName}' from '${selectedRole.name}' to '${targetRole.name}'.`);
    setTransferTargetRole("");
    toast.success(`Access permissions transferred to '${targetRole.name}' successfully.`);
  };

  // Toggle Policy status
  const handleTogglePolicy = (policyId: string) => {
    const updatedPolicies = policies.map(p => {
      if (p.id === policyId) {
        const nextStatus = p.status === "Active" ? "Inactive" : "Active";
        toast.info(`Security policy [${p.name}] status toggled to ${nextStatus}.`);
        return {
          ...p,
          status: nextStatus as any
        };
      }
      return p;
    });
    setPolicies(updatedPolicies);
  };

  const handleSavePolicyValue = (policyId: string, val: any) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        toast.success(`Security threshold for [${p.name}] committed.`);
        return {
          ...p,
          value: val
        };
      }
      return p;
    }));
  };

  // Bulk actions on table selection
  const handleBulkAction = (action: "activate" | "suspend" | "delete" | "export") => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    if (selectedIds.length === 0) return;

    if (action === "delete") {
      const containsSystem = roles.some(r => rowSelection[r.id] && r.category === "System Default");
      if (containsSystem) {
        toast.error("System Default roles cannot be deleted. De-select defaults to bulk delete customs.");
        return;
      }
      if (confirm(`Expunge all ${selectedIds.length} custom roles?`)) {
        setRoles(prev => prev.filter(r => !rowSelection[r.id]));
        setRowSelection({});
        toast.success("Selected custom roles deleted.");
      }
    } else if (action === "activate") {
      setRoles(prev => prev.map(r => 
        rowSelection[r.id] ? { ...r, status: "Active" } : r
      ));
      setRowSelection({});
      toast.success("Selected roles activated.");
    } else if (action === "suspend") {
      const containsSystem = roles.some(r => rowSelection[r.id] && r.category === "System Default");
      if (containsSystem) {
        toast.error("System Default roles cannot be suspended.");
        return;
      }
      setRoles(prev => prev.map(r => 
        rowSelection[r.id] ? { ...r, status: "Inactive" } : r
      ));
      setRowSelection({});
      toast.success("Selected roles deactivated.");
    } else if (action === "export") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roles.filter(r => rowSelection[r.id]), null, 2));
      const anchor = document.createElement("a");
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", `rbac_export_${Date.now()}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("RBAC schemas exported.");
    }
  };

  // Role column mapping
  const tableColumns = useMemo<ColumnDef<SystemRole>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded-xs accent-primary border-border cursor-pointer h-3.5 w-3.5"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all roles"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded-xs accent-primary border-border cursor-pointer h-3.5 w-3.5"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select role ${row.original.name}`}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => {
        const role = row.original;
        // Icon matching
        const Icon = 
          role.iconName === "UserCheck" ? UserCheck :
          role.iconName === "Activity" ? Activity :
          role.iconName === "Building2" ? Building2 :
          role.iconName === "Settings" ? Settings :
          role.iconName === "Cpu" ? Cpu :
          role.iconName === "ShieldCheck" ? ShieldCheck : Users;

        return (
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-sm bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground hover:text-primary transition-colors">{role.name}</span>
              <span className="text-[10px] text-foreground-muted font-sans line-clamp-1 max-w-[200px]">{role.description}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Type",
      cell: ({ cell }) => {
        const cat = cell.getValue() as string;
        return (
          <Badge variant={cat === "System Default" ? "outline" : "primary"}>
            {cat}
          </Badge>
        );
      }
    },
    {
      accessorKey: "usersCount",
      header: "Users Assigned",
      cell: ({ cell }) => <span className="font-mono font-bold text-foreground">{cell.getValue() as number}</span>
    },
    {
      accessorKey: "permissionsCount",
      header: "Permission Count",
      cell: ({ cell }) => <span className="font-mono font-bold text-foreground">{cell.getValue() as number}</span>
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ cell }) => <span className="font-sans font-medium text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: ({ cell }) => <span className="font-mono text-foreground-secondary">{cell.getValue() as string}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ cell }) => {
        const val = cell.getValue() as string;
        return <StatusBadge status={val === "Active" ? "active" : "retired"} />;
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const role = row.original;
        const items = [
          { id: "view", label: "View Configuration", icon: Info, onClick: () => handleOpenDrawer(role, "details") },
          { id: "edit", label: "Edit Permissions", icon: Edit, onClick: () => handleEditClick(role) },
          { id: "clone", label: "Duplicate Role", icon: Copy, onClick: () => handleCloneClick(role) },
          { id: "delete", label: "Delete Role", icon: Trash2, destructive: true, onClick: () => handleDeleteClick(role) }
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
  ], [handleOpenDrawer, handleEditClick, handleCloneClick, handleDeleteClick]);

  // Setup TanStack Table
  const table = useReactTable({
    data: filteredRoles,
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

  const selectedRowsCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header */}
      <SectionHeader
        title="Role & Permission Management"
        description="Manage system roles, permissions, access control policies and authorization across the ArthDrishti platform."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer hidden md:flex" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Permissions schema template exported.")}>
              Import Roles
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roles, null, 2));
              const anchor = document.createElement("a");
              anchor.setAttribute("href", dataStr);
              anchor.setAttribute("download", `rbac_roles_all_${Date.now()}.json`);
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              toast.success("Full security registry exported.");
            }}>
              <Download className="h-4 w-4 shrink-0" />
              Export Roles
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setCreateStep(1); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 shrink-0" />
              Create Role
            </Button>
          </div>
        }
      />

      {/* 2. Premium KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 font-sans select-none mb-6">
        {[
          { label: "Total Roles", val: kpis.total, trend: 10.2, icon: Shield, sparkline: ROLE_SPARKLINES.totalRoles },
          { label: "Active Roles", val: kpis.active, trend: 8.5, icon: CheckCircle2, sparkline: ROLE_SPARKLINES.activeRoles },
          { label: "Custom Roles", val: kpis.custom, trend: 12.0, icon: Settings, sparkline: ROLE_SPARKLINES.customRoles },
          { label: "Default Roles", val: kpis.defaults, trend: 0.0, icon: ShieldAlert, sparkline: ROLE_SPARKLINES.defaultRoles },
          { label: "Permission Groups", val: kpis.groups, trend: 0.0, icon: SlidersHorizontal, sparkline: ROLE_SPARKLINES.groups },
          { label: "Users Assigned", val: kpis.assignedUsers, trend: 6.4, icon: Users, sparkline: ROLE_SPARKLINES.usersAssigned }
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
                  <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider truncate max-w-[100px]" title={card.label}>
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
                      {card.val}
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

      {/* Bypass Diagnostics Sync failure */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs animate-fadeIn">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">IAM Synchronization Disconnected</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                ArthDrishti security engine failed to sync authorization states with active Directory controllers. Re-establish sync.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Reconnect Vaults
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Disable Warnings
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8 animate-fadeIn">

          {/* 3. DEFAULT SYSTEM ROLES CARD GRID */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground select-none">Default System Roles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {roles.filter(r => r.category === "System Default").map((role) => {
                const Icon = 
                  role.iconName === "UserCheck" ? UserCheck :
                  role.iconName === "Activity" ? Activity :
                  role.iconName === "Building2" ? Building2 :
                  role.iconName === "Settings" ? Settings :
                  role.iconName === "Cpu" ? Cpu :
                  role.iconName === "ShieldCheck" ? ShieldCheck : Users;
                return (
                  <Card key={role.id} interactive className="flex flex-col justify-between h-48 select-text">
                    <CardHeader className="p-4 flex flex-row items-start justify-between gap-2 border-b border-border/40 bg-surface-elevated/10">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="h-8 w-8 rounded-sm bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-xs text-foreground truncate" title={role.name}>{role.name}</span>
                      </div>
                      <StatusBadge status={role.status === "Active" ? "active" : "retired"} className="scale-90" />
                    </CardHeader>
                    
                    <CardContent className="p-4 text-xs font-sans flex-1 flex flex-col justify-between gap-3 text-foreground-secondary">
                      <p className="line-clamp-2 leading-relaxed text-[11px] text-foreground-secondary/90">{role.description}</p>
                      <div className="flex items-center justify-between text-[10px] font-medium border-t border-border/20 pt-2 select-none">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Seats: <b>{role.usersCount}</b></span>
                        <span className="flex items-center gap-1"><Key className="h-3.5 w-3.5" />Scopes: <b>{role.permissionsCount}</b></span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-2.5 bg-surface-elevated/20 flex justify-end gap-1.5 border-t border-border/30 select-none">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => handleOpenDrawer(role, "details")}>View</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => handleEditClick(role)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold" onClick={() => handleCloneClick(role)}>Duplicate</Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 4. ROLES SEARCH & ADVANCED FILTER CARD */}
          <Card>
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roles directory by name index, privilege description, security tag..."
                    className="w-full h-10 pl-9 pr-9 bg-surface-elevated border border-border text-foreground rounded-xs text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted cursor-pointer outline-none">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="System Default">System Default</option>
                    <option value="Custom">Custom Scope</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active Role</option>
                    <option value="Inactive">Deactivated</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. STICKY BULK ACTION BAR */}
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
                    Batch configure target roles permissions indexes.
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
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
                    Bulk Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. PRIMARY ROLES DATA DIRECTORY */}
          <Card>
            <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <CardTitle>Security Registry Directory</CardTitle>
                <CardDescription>Verify user identity credentials and adjust privilege bindings.</CardDescription>
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
                  items={table.getAllLeafColumns().filter(col => col.id !== "select" && col.id !== "actions").map(col => ({
                    id: col.id,
                    label: col.id === "name" ? "Role Name" : col.id === "category" ? "Type" : col.id === "usersCount" ? "Users Assigned" : col.id === "permissionsCount" ? "Scopes" : col.id === "createdBy" ? "Creator" : col.id === "createdDate" ? "Created" : "Status",
                    icon: col.getIsVisible() ? Check : undefined,
                    onClick: () => col.toggleVisibility(!col.getIsVisible())
                  }))}
                  align="right"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto relative min-h-[250px]">
              {isLoading ? (
                <div className="space-y-4 p-5 animate-pulse">
                  <div className="h-9 bg-border/40 rounded-sm w-full" />
                  {[1, 2, 3].map(s => <div key={s} className="h-14 bg-border/30 rounded-sm w-full" />)}
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs max-w-sm mx-auto">
                  <div className="h-14 w-14 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold text-base text-foreground">No Roles Discovered</h3>
                    <p className="text-xs text-foreground-secondary leading-normal">
                      No custom or system security mappings match the active filters query.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>Create Role</Button>
                    <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setFilterCategory("All"); setFilterStatus("All"); }}>Reset Filters</Button>
                  </div>
                </div>
              ) : (
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
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleOpenDrawer(row.original, "details")}
                        className={cn(
                          "hover:bg-surface-hover/50 transition-colors cursor-pointer relative",
                          row.getIsSelected() && "bg-primary/5 hover:bg-primary/8"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            onClick={(e) => {
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
            
            {/* Table pagination */}
            {!isLoading && filteredRoles.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between flex-wrap gap-4 select-none font-sans text-xs bg-surface-elevated/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground-secondary font-medium">Rows per page:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="bg-surface border border-border rounded-xs px-2 py-1 outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    {[5, 10, 20].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>{pageSize} rows</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-foreground-secondary">
                    Page <span className="font-mono font-bold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-mono font-bold text-foreground">{table.getPageCount()}</span>
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="px-2" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-2" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 7. PERMISSION GROUPS CARDS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground select-none">Functional Permission Groups</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-text">
              {Object.entries(MOCK_PERMISSION_GROUPS).map(([group, modules]) => (
                <Card key={group} className="border border-border">
                  <CardHeader className="p-4 bg-surface-elevated/20 border-b border-border/40">
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">{group}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs font-sans text-foreground-secondary space-y-2">
                    <p className="text-[10px] text-foreground-muted uppercase tracking-wider font-bold">Associated Modules:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {modules.map(mod => (
                        <Badge key={mod} variant="outline" className="text-[10px] py-0 px-2 font-mono">{mod}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 8. ACCESS SECURITY POLICIES */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground select-none">Access Control Security Policies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 select-text">
              {policies.map(policy => {
                const isBool = typeof policy.value === "boolean";
                return (
                  <Card key={policy.id} className="flex flex-col justify-between min-h-[160px] border border-border">
                    <CardHeader className="p-4 border-b border-border/40 flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">{policy.name}</CardTitle>
                        <CardDescription className="text-[11px] leading-relaxed mt-1">{policy.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="scale-90">{policy.category}</Badge>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-between text-xs font-sans bg-surface-elevated/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-foreground-secondary uppercase select-none">Status:</span>
                        <button
                          onClick={() => handleTogglePolicy(policy.id)}
                          className={cn(
                            "px-2 py-0.5 rounded-xs font-bold text-[9px] cursor-pointer outline-none uppercase select-none",
                            policy.status === "Active" ? "bg-positive/10 text-positive" : "bg-border text-foreground-muted"
                          )}
                        >
                          {policy.status}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 select-none">
                        {isBool ? (
                          <input
                            type="checkbox"
                            checked={policy.value as boolean}
                            disabled={policy.status === "Inactive"}
                            onChange={(e) => handleSavePolicyValue(policy.id, e.target.checked)}
                            className="h-4 w-4 cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        ) : (
                          <input
                            type="number"
                            defaultValue={policy.value as number}
                            disabled={policy.status === "Inactive"}
                            onBlur={(e) => handleSavePolicyValue(policy.id, Number(e.target.value))}
                            className="w-14 h-8 px-2 bg-surface border border-border text-center rounded-xs font-mono font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-primary"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 9. ROLE DETAILS DRAWER (SHEET OVERLAY) */}
      {/* ================================================== */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedRole?.name || "Role Schema Config"}
        className="w-full max-w-xl md:max-w-2xl border-l border-border select-text"
      >
        {selectedRole && (
          <div className="flex flex-col h-full justify-between pr-1">
            
            {/* Header identity */}
            <div className="flex items-center gap-4 pb-5 border-b border-border/40 mb-5">
              <div className="h-12 w-12 rounded-sm bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-semibold text-lg text-foreground">{selectedRole.name}</h2>
                  <Badge variant={selectedRole.category === "System Default" ? "outline" : "primary"}>
                    {selectedRole.category}
                  </Badge>
                </div>
                <p className="text-xs text-foreground-secondary leading-normal pr-4 mt-0.5">{selectedRole.description}</p>
              </div>
            </div>

            {/* Inner drawer tabs */}
            <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-5 mb-5 select-none shrink-0">
              {[
                { id: "details", label: "Overview details", icon: Info },
                { id: "matrix", label: "Permission Matrix", icon: SlidersHorizontal },
                { id: "members", label: `Assigned Users (${selectedRole.usersCount})`, icon: Users },
                { id: "timeline", label: "Timeline Ledger", icon: Clock }
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

            {/* Drawer scroll content body */}
            <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-6 font-sans">
              
              {/* TAB 1: DETAILS OVERVIEW */}
              {drawerActiveTab === "details" && (
                <div className="space-y-4 animate-fadeIn">
                  <Card>
                    <CardContent className="p-4 space-y-3.5">
                      <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider select-none border-b border-border/40 pb-1.5">RBAC Registry Metadata</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-foreground-muted">Role Domain Name:</span> <span className="font-semibold text-foreground">{selectedRole.name}</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Registry Class:</span> <span className="font-semibold text-foreground">{selectedRole.category}</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Permission Scopes:</span> <span className="font-semibold text-foreground font-mono">{selectedRole.permissionsCount} active bounds</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Active user seats:</span> <span className="font-semibold text-foreground font-mono">{selectedRole.usersCount} seats</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Directory Creator:</span> <span className="font-semibold text-foreground">{selectedRole.createdBy}</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Creation Date:</span> <span className="font-semibold text-foreground font-mono">{selectedRole.createdDate}</span></div>
                        <div className="flex justify-between"><span className="text-foreground-muted">Last Modified:</span> <span className="font-semibold text-foreground font-mono">{selectedRole.lastModified}</span></div>
                        <div className="flex justify-between">
                          <span className="text-foreground-muted">Status:</span>
                          <StatusBadge status={selectedRole.status === "Active" ? "active" : "retired"} className="scale-90" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><SlidersHorizontal className="h-4 w-4 text-foreground-muted" />Active Module Clearances</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {selectedRole.matrix.filter(r => r.actions.length > 0).map(row => (
                          <div key={row.module} className="p-2.5 rounded-sm border border-border bg-surface flex flex-col gap-1.5">
                            <span className="font-semibold text-foreground font-mono">{row.module}</span>
                            <div className="flex flex-wrap gap-1">
                              {row.actions.map(act => (
                                <Badge key={act} variant="primary" className="text-[9px] py-0 px-1">{act}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                        {selectedRole.matrix.filter(r => r.actions.length > 0).length === 0 && (
                          <span className="text-foreground-muted italic">No module permissions allocated.</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 2: FUNCTIONAL MATRIX */}
              {drawerActiveTab === "matrix" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between select-none">
                    <h4 className="text-xs font-semibold text-foreground">Interactive Clearance Grid</h4>
                    <span className="text-[10px] text-foreground-muted">Configured: <b>{selectedRole.permissionsCount}</b> actions</span>
                  </div>

                  {/* Matrix table viewport (Desktop scrollable) */}
                  <div className="border border-border rounded-sm overflow-x-auto select-none">
                    <table className="w-full text-left border-collapse text-[11px] font-sans">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/40 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                          <th className="p-3 sticky left-0 bg-surface z-10 border-r border-border min-w-[140px]">Module / Area</th>
                          {PERMISSION_ACTIONS.map(action => (
                            <th key={action} className="p-3 text-center min-w-[70px]">{action}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {selectedRole.matrix.map((row) => (
                          <tr key={row.module} className="hover:bg-surface-hover/30">
                            <td className="p-3 font-semibold font-mono sticky left-0 bg-surface z-10 border-r border-border">{row.module}</td>
                            {PERMISSION_ACTIONS.map(action => {
                              const hasAction = row.actions.includes(action);
                              return (
                                <td key={action} className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={hasAction}
                                    readOnly
                                    className="accent-primary h-3.5 w-3.5 cursor-not-allowed opacity-80"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: USER ROSTER MANAGEMENT */}
              {drawerActiveTab === "members" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 select-none">
                    <div className="relative max-w-xs flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search assigned roster..."
                        className="w-full h-8 pl-8 pr-8 bg-surface border border-border text-xs rounded-xs outline-none"
                      />
                    </div>
                    <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setIsAssignUserOpen(true)}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign User
                    </Button>
                  </div>

                  {/* Assigned users cards list */}
                  <div className="space-y-3">
                    {users
                      .filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                      .map(user => (
                        <Card key={user.id} className="border border-border select-text">
                          <CardContent className="p-3.5 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-heading font-bold text-xs flex items-center justify-center select-none flex-shrink-0">
                                {user.avatar}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-foreground text-xs">{user.name}</span>
                                <span className="text-[10px] text-foreground-muted font-mono">{user.email}</span>
                                <span className="text-[9px] text-foreground-muted block mt-0.5 uppercase tracking-wide">Assigned: {user.assignedDate}</span>
                              </div>
                            </div>
                            
                            {/* Actions inside drawer roster */}
                            <div className="flex items-center gap-3 select-none">
                              {/* Transfer Role */}
                              <div className="flex items-center gap-1.5 border border-border bg-surface px-2 rounded-xs h-8 text-[11px]">
                                <span className="text-[9px] text-foreground-secondary font-bold uppercase">Transfer:</span>
                                <select
                                  value={transferTargetRole}
                                  onChange={(e) => {
                                    setTransferTargetRole(e.target.value);
                                    // Trigger immediate transfer
                                    if (e.target.value) {
                                      handleTransferRole(user.name);
                                    }
                                  }}
                                  className="bg-transparent border-none outline-none cursor-pointer text-foreground pr-1"
                                >
                                  <option value="">Select Role</option>
                                  {roles.filter(r => r.id !== selectedRole.id).map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => handleRemoveUser(user.name)}
                                className="text-foreground-secondary hover:text-critical p-1 rounded-sm hover:bg-surface cursor-pointer outline-none"
                                title="Remove User access seat"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT TIMELINE */}
              {drawerActiveTab === "timeline" && (
                <div className="space-y-4 animate-fadeIn pr-2">
                  <h3 className="text-sm font-semibold text-foreground select-none">Security Action timeline</h3>
                  
                  <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-1 text-xs select-text">
                    {auditLogs
                      .filter(log => log.detail.includes(selectedRole.name))
                      .map(log => {
                        const logColors = {
                          "Role Created": "bg-positive text-white border-positive",
                          "Permissions Updated": "bg-ai text-white border-ai",
                          "User Assigned": "bg-primary text-white border-primary",
                          "User Removed": "bg-warning text-white border-warning",
                          "Role Deleted": "bg-critical text-white border-critical"
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
                    {auditLogs.filter(log => log.detail.includes(selectedRole.name)).length === 0 && (
                      <span className="text-foreground-muted italic select-none">No historical ledger records found for this role.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer actions */}
            <div className="pt-4 border-t border-border/40 flex justify-between items-center select-none shrink-0 bg-surface-elevated/10 p-4">
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(selectedRole)}>
                Expunge Role
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>Close Roster</Button>
                <Button variant="primary" size="sm" onClick={() => handleEditClick(selectedRole)}>Edit Permissions</Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* ================================================== */}
      {/* 10. CREATE ROLE DIALOG MODAL (WIZARD STEPS) */}
      {/* ================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Custom Access Role"
        className="max-w-2xl animate-fadeIn"
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
                  {step === 1 ? "Information" : step === 2 ? "Coarse Groups" : step === 3 ? "Advanced Matrix" : "Verification"}
                </span>
                {step < 4 && <div className="h-px bg-border w-6 sm:w-10" />}
              </div>
            ))}
          </div>

          {/* STEP 1: GENERAL ROLE INFO */}
          {createStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 1: Role Identity Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Role Directory Name *</label>
                  <input
                    type="text"
                    required
                    value={newRoleData.name}
                    onChange={(e) => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Credit Auditor Assistant"
                    className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-foreground-secondary font-bold">Graphic Symbol Icon</label>
                  <select
                    value={newRoleData.iconName}
                    onChange={(e) => setNewRoleData(prev => ({ ...prev, iconName: e.target.value as any }))}
                    className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="ShieldCheck">Shield Check Icon</option>
                    <option value="Users">Multi-Users Group</option>
                    <option value="UserCheck">Single User Check</option>
                    <option value="Activity">Pulse Graph Line</option>
                    <option value="Building2">Bank Structure</option>
                    <option value="Settings">Gear Cogwheel</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-foreground-secondary font-bold">Privileges Scope Description</label>
                  <textarea
                    rows={3}
                    value={newRoleData.description}
                    onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly state target workspace seats and data segment parameters that align with this role definition..."
                    className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COARSE PERMISSION GROUPS CHECKBOXES */}
          {createStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Step 2: Assign Coarse Permission Groups</h3>
                <p className="text-foreground-secondary text-[11px]">Selecting a category auto-allocates baseline clearances (View, Create, Edit) to associated modules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {Object.keys(MOCK_PERMISSION_GROUPS).map(group => {
                  const isChecked = newRoleData.groupsSelected.includes(group);
                  return (
                    <div 
                      key={group} 
                      onClick={() => handleGroupSelect(group)}
                      className={cn(
                        "p-3 rounded-sm border cursor-pointer flex items-center justify-between select-none hover:bg-surface-hover/30 transition-all",
                        isChecked ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground-secondary"
                      )}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-[11px] block">{group}</span>
                        <span className="text-[9px] text-foreground-muted block font-mono">Count: {MOCK_PERMISSION_GROUPS[group]?.length} modules</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        readOnly 
                        className="accent-primary h-4 w-4 cursor-pointer" 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: ADVANCED DETAILED PERMISSIONS MATRIX */}
          {createStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Step 3: Fine-Tune Advanced Permissions Matrix</h3>
                <p className="text-foreground-secondary text-[11px]">Directly toggles action checkboxes for each security partition.</p>
              </div>

              {/* Scrollable matrix */}
              <div className="border border-border rounded-sm overflow-x-auto max-h-[300px] select-none">
                <table className="w-full text-left border-collapse text-[10px] font-sans">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated/40 text-[9px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <th className="p-2.5 sticky left-0 bg-surface z-10 border-r border-border min-w-[120px]">Module</th>
                      {PERMISSION_ACTIONS.map(action => (
                        <th key={action} className="p-2.5 text-center min-w-[60px]">{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {newRoleData.matrix.map((row) => (
                      <tr key={row.module} className="hover:bg-surface-hover/30">
                        <td className="p-2.5 font-semibold font-mono sticky left-0 bg-surface z-10 border-r border-border">{row.module}</td>
                        {PERMISSION_ACTIONS.map(action => {
                          const hasAction = row.actions.includes(action);
                          return (
                            <td key={action} className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={hasAction}
                                onChange={() => toggleMatrixCell(newRoleData.matrix, (updated) => setNewRoleData(prev => ({ ...prev, matrix: updated as any })), row.module, action)}
                                className="accent-primary h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {createStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 4: Review and Commission Access Directory</h3>
              
              <div className="bg-surface-elevated border border-border p-4 rounded-sm space-y-3.5 select-text">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-semibold text-foreground text-sm">{newRoleData.name}</span>
                  <Badge variant="primary">Custom Role</Badge>
                </div>
                <div className="space-y-2.5 text-xs text-foreground-secondary">
                  <p><span className="text-foreground-muted">Description Scope:</span> {newRoleData.description || "N/A"}</p>
                  <p><span className="text-foreground-muted">Category Segment:</span> {newRoleData.category}</p>
                  <p><span className="text-foreground-muted">Clearant Scopes Count:</span> <span className="font-mono font-bold text-foreground">{newRoleData.matrix.reduce((acc, curr) => acc + curr.actions.length, 0)} actions selected</span></p>
                </div>
              </div>

              <div className="p-3 bg-positive/10 border border-positive/20 text-positive rounded-sm flex items-start gap-2.5 leading-relaxed font-sans select-none">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Confirming configuration updates will index this custom role structure. User slots may be allocated immediately from active employee listings.
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
                if (createStep === 1) setIsCreateOpen(false);
                else setCreateStep(prev => prev - 1);
              }}
            >
              {createStep === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={createStep === 4 ? handleCreateSubmit : handleCreateStepNext}
            >
              {createStep === 4 ? "Create Role" : "Next"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================================================== */}
      {/* 11. EDIT ROLE PERMISSIONS MODAL */}
      {/* ================================================== */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit permissions for: ${roleToEdit?.name}`}
        className="max-w-2xl animate-fadeIn"
      >
        {roleToEdit && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Role Description</label>
              <textarea
                rows={2}
                value={newRoleData.description}
                onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5 select-none">
              <label className="text-foreground-secondary font-bold">Adjust Matrix Clearant Grid</label>
              <div className="border border-border rounded-sm overflow-x-auto max-h-[300px]">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated/40 text-[9px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <th className="p-2.5 sticky left-0 bg-surface z-10 border-r border-border min-w-[120px]">Module</th>
                      {PERMISSION_ACTIONS.map(action => (
                        <th key={action} className="p-2.5 text-center min-w-[60px]">{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {editRoleMatrix.map((row) => (
                      <tr key={row.module} className="hover:bg-surface-hover/30">
                        <td className="p-2.5 font-semibold font-mono sticky left-0 bg-surface z-10 border-r border-border">{row.module}</td>
                        {PERMISSION_ACTIONS.map(action => {
                          const hasAction = row.actions.includes(action);
                          return (
                            <td key={action} className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={hasAction}
                                onChange={() => toggleMatrixCell(editRoleMatrix, setEditRoleMatrix, row.module, action)}
                                className="accent-primary h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>Save Permissions</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================== */}
      {/* 12. ROLE CLONING MODAL */}
      {/* ================================================== */}
      <Modal
        isOpen={isCloneOpen}
        onClose={() => setIsCloneOpen(false)}
        title={`Duplicate role configuration: ${roleToClone?.name}`}
        className="max-w-md animate-fadeIn"
      >
        {roleToClone && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">New Role Name *</label>
              <input
                type="text"
                required
                value={newRoleData.name}
                onChange={(e) => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Duplicated Description Scope</label>
              <textarea
                rows={2}
                value={newRoleData.description}
                onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
              <Button variant="outline" size="sm" onClick={() => setIsCloneOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCloneSubmit}>Clone Role</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================== */}
      {/* 13. USER ROSTER ASSIGNMENT MODAL (INSIDE DRAWER) */}
      {/* ================================================== */}
      <Modal
        isOpen={isAssignUserOpen}
        onClose={() => setIsAssignUserOpen(false)}
        title={`Assign user to: ${selectedRole?.name}`}
        className="max-w-sm animate-fadeIn"
      >
        {selectedRole && (
          <div className="space-y-4 font-sans text-xs select-none">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Select employee directory candidate</label>
              <select
                value={selectedUserToAssign}
                onChange={(e) => setSelectedUserToAssign(e.target.value)}
                className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
              >
                <option value="">Choose User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <p className="text-[10px] text-foreground-muted leading-relaxed">
              Allocating user adds them to the seat list. Permissions associated with matrix filters immediately index onto employee sessions.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4">
              <Button variant="outline" size="sm" onClick={() => setIsAssignUserOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAssignUser} disabled={!selectedUserToAssign}>Assign</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
