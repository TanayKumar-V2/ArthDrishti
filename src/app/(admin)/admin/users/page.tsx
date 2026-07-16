"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  UserCheck,
  ShieldCheck,
  Cpu,
  ClipboardList,
  Sparkles,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Database,
  Server,
  FileText,
  Settings,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  RefreshCw,
  Download,
  UserPlus,
  Folder,
  Terminal,
  Lock,
  Plus,
  Search,
  X,
  ChevronsRight,
  Clock,
  Calendar,
  Smartphone,
  Key,
  Check,
  Eye,
  EyeOff,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Laptop,
  SlidersHorizontal
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import {
  UserInfo,
  LoginHistoryItem,
  ActivityItem,
  INITIAL_USERS,
  MOCK_PERMISSIONS,
  MOCK_DEPARTMENTS,
  MOCK_ORGANIZATIONS,
  MOCK_BRANCHES,
  COLORS
} from "@/lib/users_data";

export default function PlatformUserManagementPage() {
  const router = useRouter();

  // Primary Data State
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Filters State
  const [globalSearch, setGlobalSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterEmpId, setFilterEmpId] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterOrg, setFilterOrg] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLastLogin, setFilterLastLogin] = useState("All");
  const [filterAccountState, setFilterAccountState] = useState("All");
  const [filterDateJoined, setFilterDateJoined] = useState("All");

  // UI Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"compact" | "comfortable" | "loose">("comfortable");

  // Overlay Modals / Drawers Open States
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBulkActionConfirmOpen, setIsBulkActionConfirmOpen] = useState(false);

  // Selected contexts
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [editingUserForm, setEditingUserForm] = useState<UserInfo | null>(null);
  const [editModalTab, setEditModalTab] = useState<"profile" | "org" | "role" | "perms" | "prefs">("profile");

  // Invite User Multi-Step state
  const [inviteStep, setInviteStep] = useState<1 | 2 | 3 | 4>(1);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    organization: MOCK_ORGANIZATIONS[0],
    department: MOCK_DEPARTMENTS[0],
    branch: MOCK_BRANCHES[0],
    role: "Loan Officer" as UserInfo["role"],
    permissions: [...MOCK_PERMISSIONS["Loan Officer"]],
    tempPassword: "",
    forceMfa: true
  });

  // Bulk operation active parameters
  const [bulkActionType, setBulkActionType] = useState<"suspend" | "delete" | "roleUpdate" | "">("");
  const [bulkTargetRole, setBulkTargetRole] = useState<UserInfo["role"]>("Loan Officer");

  // Load Initial Users
  useEffect(() => {
    const loadUsers = () => {
      try {
        const saved = localStorage.getItem("arth-users");
        if (saved) {
          setUsers(JSON.parse(saved));
        } else {
          localStorage.setItem("arth-users", JSON.stringify(INITIAL_USERS));
          setUsers(INITIAL_USERS);
        }
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        console.error(e);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(loadUsers, 700);
    return () => clearTimeout(timer);
  }, []);

  const saveUsersRegistry = (updatedList: UserInfo[]) => {
    setUsers(updatedList);
    localStorage.setItem("arth-users", JSON.stringify(updatedList));
  };

  // Actions
  const handleRefresh = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      const saved = localStorage.getItem("arth-users");
      if (saved) setUsers(JSON.parse(saved));
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("User management index refreshed.");
    }, 600);
  };

  const handleExportUsers = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Compiling user database schema for CSV export...",
        success: () => {
          const headers = ["ID", "Name", "Employee ID", "Email", "Phone", "Org", "Dept", "Role", "Status", "Joined"];
          const csvRows = users.map((u) =>
            [u.id, u.fullName, u.employeeId, u.email, u.phone, u.organization, u.department, u.role, u.status, u.createdDate].join(",")
          );
          const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
          const dlAnchor = document.createElement("a");
          dlAnchor.setAttribute("href", encodeURI(csvContent));
          dlAnchor.setAttribute("download", `arth_users_registry.csv`);
          dlAnchor.click();
          return "User database exported successfully.";
        },
        error: "Export failed."
      }
    );
  };

  const handleBulkImport = () => {
    toast.info("Triggered spreadsheet bulk import. Integration queue operational.");
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setGlobalSearch("");
    setFilterName("");
    setFilterEmail("");
    setFilterEmpId("");
    setFilterRole("All");
    setFilterDept("All");
    setFilterOrg("All");
    setFilterBranch("All");
    setFilterStatus("All");
    setFilterLastLogin("All");
    setFilterAccountState("All");
    setFilterDateJoined("All");
    toast.success("Active filter view reset.");
  };

  const handleSaveFilterView = () => {
    toast.success("Saved filter view parameters.");
  };

  // Row operations
  const handleViewProfile = (user: UserInfo) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleEditUser = (user: UserInfo) => {
    setEditingUserForm({ ...user });
    setEditModalTab("profile");
    setIsEditOpen(true);
  };

  const handleResetPassword = (user: UserInfo) => {
    toast.success(`Temporary reset link sent to ${user.fullName} (${user.email}).`);
    
    // Log Activity
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          activities: [
            { event: "Password Changed", timestamp: "Just Now", detail: "Password reset requested by admin." },
            ...u.activities
          ]
        };
      }
      return u;
    });
    saveUsersRegistry(updated);
  };

  const handleToggleSuspend = (user: UserInfo) => {
    const isSuspended = user.status === "Suspended";
    const nextStatus = isSuspended ? "Active" : "Suspended";
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          status: nextStatus as any,
          activities: [
            { event: "Profile Updated", timestamp: "Just Now", detail: `Account status set to ${nextStatus} by admin.` },
            ...u.activities
          ]
        };
      }
      return u;
    });
    saveUsersRegistry(updated);
    toast.success(`User ${user.fullName} has been ${isSuspended ? "activated" : "suspended"}.`);
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser((prev) => prev ? { ...prev, status: nextStatus as any } : null);
    }
  };

  const handleToggleDeactivate = (user: UserInfo) => {
    const isActive = user.status === "Active";
    const nextStatus = isActive ? "Inactive" : "Active";
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          status: nextStatus as any,
          activities: [
            { event: "Profile Updated", timestamp: "Just Now", detail: `Account status set to ${nextStatus} by admin.` },
            ...u.activities
          ]
        };
      }
      return u;
    });
    saveUsersRegistry(updated);
    toast.success(`User ${user.fullName} has been ${isActive ? "deactivated" : "activated"}.`);
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser((prev) => prev ? { ...prev, status: nextStatus as any } : null);
    }
  };

  const handleDeleteClick = (user: UserInfo) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    const updated = users.filter((u) => u.id !== selectedUser.id);
    saveUsersRegistry(updated);
    setIsDeleteConfirmOpen(false);
    setIsDrawerOpen(false);
    toast.success(`User ${selectedUser.fullName} has been deleted.`);
    setSelectedUser(null);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForm) return;

    const updated = users.map((u) => {
      if (u.id === editingUserForm.id) {
        return {
          ...editingUserForm,
          activities: [
            { event: "Profile Updated", timestamp: "Just Now", detail: "Profile settings modified by administrator." },
            ...editingUserForm.activities
          ]
        };
      }
      return u;
    });
    saveUsersRegistry(updated);
    setIsEditOpen(false);
    toast.success(`User profile details saved.`);
    if (selectedUser && selectedUser.id === editingUserForm.id) {
      setSelectedUser(editingUserForm);
    }
  };

  // Invite dialog stepper steps triggers
  const handleInviteStepNext = () => {
    if (inviteStep === 1) {
      if (!inviteForm.fullName || !inviteForm.email || !inviteForm.phone || !inviteForm.employeeId) {
        toast.error("Please fill in all personal information fields.");
        return;
      }
      setInviteStep(2);
    } else if (inviteStep === 2) {
      setInviteStep(3);
    } else if (inviteStep === 3) {
      setInviteStep(4);
    }
  };

  const handleInviteStepPrev = () => {
    if (inviteStep > 1) {
      setInviteStep((prev) => (prev - 1) as any);
    }
  };

  const handleRoleSelection = (role: UserInfo["role"]) => {
    setInviteForm({
      ...inviteForm,
      role,
      permissions: [...MOCK_PERMISSIONS[role]]
    });
  };

  const handleTogglePermissionCheckbox = (permission: string) => {
    const has = inviteForm.permissions.includes(permission);
    const updatedPerms = has
      ? inviteForm.permissions.filter((p) => p !== permission)
      : [...inviteForm.permissions, permission];
    setInviteForm({ ...inviteForm, permissions: updatedPerms });
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation simple check
    if (inviteForm.tempPassword.length < 6) {
      toast.error("Temporary password must be at least 6 characters.");
      return;
    }

    const newUser: UserInfo = {
      id: `usr-${Date.now()}`,
      fullName: inviteForm.fullName,
      avatar: inviteForm.fullName.split(" ").map((n) => n[0]).join("").toUpperCase(),
      employeeId: inviteForm.employeeId,
      email: inviteForm.email,
      phone: inviteForm.phone,
      organization: inviteForm.organization,
      department: inviteForm.department,
      branch: inviteForm.branch,
      role: inviteForm.role,
      status: "Pending Invitation",
      lastLogin: "Never",
      mfaEnabled: inviteForm.forceMfa,
      createdDate: new Date().toISOString().split("T")[0],
      mfaType: inviteForm.forceMfa ? "Pending Enrolment" : "None",
      failedLogins: 0,
      trustedDevicesCount: 0,
      permissions: inviteForm.permissions,
      loginHistory: [],
      activities: [
        { event: "Account Created", timestamp: "Just Now", detail: "IAM activation invitation code dispatched." }
      ],
      assignedReports: [],
      assignedCases: [],
      assignedDevices: []
    };

    saveUsersRegistry([newUser, ...users]);
    setIsInviteOpen(false);
    toast.success(`Invitation dispatched to ${inviteForm.email}.`);
    
    // Reset invite form
    setInviteForm({
      fullName: "",
      email: "",
      phone: "",
      employeeId: "",
      organization: MOCK_ORGANIZATIONS[0],
      department: MOCK_DEPARTMENTS[0],
      branch: MOCK_BRANCHES[0],
      role: "Loan Officer",
      permissions: [...MOCK_PERMISSIONS["Loan Officer"]],
      tempPassword: "",
      forceMfa: true
    });
    setInviteStep(1);
  };

  // Bulk execution handlers
  const handleBulkActionClick = (action: "suspend" | "delete" | "roleUpdate") => {
    setBulkActionType(action);
    setIsBulkActionConfirmOpen(true);
  };

  const executeBulkAction = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    if (selectedIds.length === 0) return;

    let updatedList = [...users];
    if (bulkActionType === "delete") {
      updatedList = users.filter((u) => !selectedIds.includes(u.id));
      toast.success(`Deleted ${selectedIds.length} users.`);
    } else if (bulkActionType === "suspend") {
      updatedList = users.map((u) =>
        selectedIds.includes(u.id) ? { ...u, status: "Suspended" as const } : u
      );
      toast.success(`Suspended ${selectedIds.length} users.`);
    } else if (bulkActionType === "roleUpdate") {
      updatedList = users.map((u) =>
        selectedIds.includes(u.id) ? { ...u, role: bulkTargetRole, permissions: [...MOCK_PERMISSIONS[bulkTargetRole]] } : u
      );
      toast.success(`Updated role to ${bulkTargetRole} for ${selectedIds.length} users.`);
    }

    saveUsersRegistry(updatedList);
    setRowSelection({});
    setIsBulkActionConfirmOpen(false);
    setBulkActionType("");
  };

  const handleBulkExport = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    if (selectedIds.length === 0) {
      toast.error("No users selected.");
      return;
    }
    const targets = users.filter((u) => selectedIds.includes(u.id));
    const csvContent = "data:text/csv;charset=utf-8," + [
      ["ID", "Name", "Role", "Status"].join(","),
      ...targets.map((t) => [t.id, t.fullName, t.role, t.status].join(","))
    ].join("\n");
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", encodeURI(csvContent));
    dlAnchor.setAttribute("download", `bulk_users_export.csv`);
    dlAnchor.click();
    toast.success(`Exported ${selectedIds.length} selected users.`);
  };

  // Filter and Search Computations
  const filteredUsersList = useMemo(() => {
    return users.filter((u) => {
      // Global Search
      const searchStr = (u.fullName + " " + u.email + " " + u.employeeId).toLowerCase();
      const matchGlobal = !globalSearch || searchStr.includes(globalSearch.toLowerCase());

      // Detailed filters
      const matchName = !filterName || u.fullName.toLowerCase().includes(filterName.toLowerCase());
      const matchEmail = !filterEmail || u.email.toLowerCase().includes(filterEmail.toLowerCase());
      const matchEmpId = !filterEmpId || u.employeeId.toLowerCase().includes(filterEmpId.toLowerCase());
      const matchRole = filterRole === "All" || u.role === filterRole;
      const matchDept = filterDept === "All" || u.department === filterDept;
      const matchOrg = filterOrg === "All" || u.organization === filterOrg;
      const matchBranch = filterBranch === "All" || u.branch === filterBranch;
      const matchStatus = filterStatus === "All" || u.status === filterStatus;

      // Last Login filter logic
      let matchLastLogin = true;
      if (filterLastLogin !== "All") {
        if (filterLastLogin === "Today") {
          matchLastLogin = u.lastLogin.toLowerCase().includes("today") || u.lastLogin.toLowerCase().includes("now") || u.lastLogin.toLowerCase().includes("mins");
        } else if (filterLastLogin === "Never") {
          matchLastLogin = u.lastLogin.toLowerCase() === "never";
        } else if (filterLastLogin === "Older") {
          matchLastLogin = u.lastLogin.toLowerCase().includes("days") || u.lastLogin.toLowerCase().includes("month");
        }
      }

      // MFA state filter
      let matchMfa = true;
      if (filterAccountState !== "All") {
        matchMfa = filterAccountState === "MFA" ? u.mfaEnabled : !u.mfaEnabled;
      }

      return matchGlobal && matchName && matchEmail && matchEmpId && matchRole && matchDept && matchOrg && matchBranch && matchStatus && matchLastLogin && matchMfa;
    });
  }, [users, globalSearch, filterName, filterEmail, filterEmpId, filterRole, filterDept, filterOrg, filterBranch, filterStatus, filterLastLogin, filterAccountState]);

  // Statistics summaries
  const stats = useMemo(() => {
    return {
      total: users.length,
      customers: users.filter((u) => u.role === "Customer").length,
      officers: users.filter((u) => u.role === "Loan Officer").length,
      analysts: users.filter((u) => u.role === "Risk Analyst").length,
      admins: users.filter((u) => u.role === "Administrator" || u.role === "Super Administrator").length,
      activeSessions: users.filter((u) => u.status === "Active").length,
      pending: users.filter((u) => u.status === "Pending Invitation").length,
      locked: users.filter((u) => u.status === "Locked").length
    };
  }, [users]);

  // TanStack Table columns definitions
  const columns = useMemo<ColumnDef<UserInfo>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
          />
        )
      },
      {
        accessorKey: "fullName",
        header: "User Details",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="h-7.5 w-7.5 rounded-full border border-border bg-primary/10 text-primary flex items-center justify-center font-heading font-extrabold text-[10px] shrink-0">
                {user.avatar}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-semibold text-foreground truncate max-w-[150px]">{user.fullName}</span>
                <span className="text-[10px] text-foreground-muted truncate max-w-[150px] font-mono">{user.employeeId}</span>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col text-left font-mono text-[10px] leading-tight">
              <span className="text-foreground-secondary">{user.email}</span>
              <span className="text-foreground-muted mt-0.5">{user.phone}</span>
            </div>
          );
        }
      },
      {
        accessorKey: "organization",
        header: "Affiliation",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col text-left leading-tight">
              <span className="font-semibold text-foreground truncate max-w-[120px]">{user.organization}</span>
              <span className="text-[10px] text-foreground-secondary truncate max-w-[120px]">{user.department}</span>
            </div>
          );
        }
      },
      {
        accessorKey: "role",
        header: "Access Role",
        cell: ({ row }) => {
          const role = row.original.role;
          let roleColor = "bg-primary/10 text-primary border-primary/20";
          if (role.includes("Admin")) roleColor = "bg-critical/10 text-critical border-critical/20";
          else if (role === "Manager") roleColor = "bg-warning/10 text-warning border-warning/20";
          else if (role === "Risk Analyst") roleColor = "bg-ai/10 text-ai border-ai/20";
          else if (role === "Customer") roleColor = "bg-surface-elevated text-foreground-secondary border-border/80";

          return (
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize leading-none", roleColor)}>
              {role}
            </span>
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeVariant: "completed" | "pending" | "failed" | "under_review" | "shadow" = "completed";
          if (status === "Inactive") badgeVariant = "under_review";
          else if (status === "Suspended") badgeVariant = "failed";
          else if (status === "Locked") badgeVariant = "failed";
          else if (status === "Pending Invitation") badgeVariant = "pending";

          return (
            <span className="inline-flex items-center leading-none">
              <Badge variant={
                status === "Active" ? "success" :
                status === "Inactive" ? "outline" :
                status === "Suspended" || status === "Locked" ? "destructive" : "warning"
              } className="text-[9px] py-0.25 leading-none">
                {status}
              </Badge>
            </span>
          );
        }
      },
      {
        accessorKey: "lastLogin",
        header: "Last Session",
        cell: ({ row }) => (
          <span className="font-sans text-foreground-secondary font-medium leading-none block">
            {row.original.lastLogin}
          </span>
        )
      },
      {
        accessorKey: "mfaEnabled",
        header: "MFA",
        cell: ({ row }) => {
          const enabled = row.original.mfaEnabled;
          return enabled ? (
            <Check className="h-4 w-4 text-positive shrink-0 mx-auto" />
          ) : (
            <X className="h-4 w-4 text-foreground-muted shrink-0 mx-auto" />
          );
        }
      },
      {
        id: "actions",
        header: () => <span className="text-right block pr-4">Actions</span>,
        cell: ({ row }) => {
          const user = row.original;
          const menuItems = [
            { id: "view", label: "View Profile", icon: FileText, onClick: () => handleViewProfile(user) },
            { id: "edit", label: "Edit User", icon: Settings, onClick: () => handleEditUser(user) },
            { id: "pass", label: "Reset Password", icon: Key, onClick: () => handleResetPassword(user) },
            { id: "role", label: "Assign Role", icon: ShieldCheck, onClick: () => handleEditUser(user) },
            {
              id: "suspend",
              label: user.status === "Suspended" ? "Activate User" : "Suspend User",
              icon: UserMinus,
              destructive: user.status !== "Suspended",
              onClick: () => handleToggleSuspend(user)
            },
            {
              id: "deactivate",
              label: user.status === "Inactive" ? "Activate Session" : "Deactivate User",
              icon: Lock,
              onClick: () => handleToggleDeactivate(user)
            },
            { id: "delete", label: "Delete Account", icon: Trash2, destructive: true, onClick: () => handleDeleteClick(user) }
          ];

          return (
            <div className="text-right pr-2">
              <Dropdown
                trigger={
                  <button className="p-1 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer">
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
    ];
  }, [users, selectedUser]);

  // Set up TanStack table
  const table = useReactTable({
    data: filteredUsersList,
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

  const selectedRowsCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

  return (
    <PageContainer>
      {/* Page Header */}
      <SectionHeader
        title="User Management"
        description="Manage platform users, permissions, account security, organizational assignments and access controls."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* QA simulator fail button */}
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkImport}>
              Bulk Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportUsers}>
              <Download className="h-4 w-4 shrink-0" />
              Export Users
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="h-4 w-4 shrink-0" />
              Invite User
            </Button>
          </div>
        }
      />

      {/* Header status count ribbons */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-surface border border-border px-4 py-3 rounded-sm text-xs font-sans select-none">
        <div className="flex flex-wrap items-center gap-6 text-foreground-secondary font-medium">
          <span className="flex items-center gap-1.5">
            Total registered users: <span className="font-mono font-bold text-foreground">{stats.total}</span>
          </span>
          <span className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            Active session logs: <span className="font-mono font-bold text-positive">{stats.activeSessions}</span>
          </span>
          <span className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            Pending activation keys: <span className="font-mono font-bold text-warning">{stats.pending}</span>
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-foreground-muted">
            Registry Sync Time: <span className="font-mono font-bold">{lastUpdated}</span>
          </span>
        )}
      </div>

      {/* Error state retry screen */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">IAM Service Connection Loss</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Platform could not establish session handshakes with Active Directory or LDAP credentials vaults. Check gateway logs.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Retry IAM Service
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8">

          {/* 1. SUMMARY KPI CARDS (8 cards grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 font-sans select-none">
            {[
              { label: "Total Users", val: stats.total, trend: "+4.2%", icon: Users, color: COLORS.primary },
              { label: "Customers", val: stats.customers, trend: "+8.5%", icon: Building2, color: COLORS.ai },
              { label: "Loan Officers", val: stats.officers, trend: "+1.2%", icon: UserCheck, color: COLORS.forecast },
              { label: "Risk Analysts", val: stats.analysts, trend: "+5.1%", icon: Activity, color: COLORS.positive },
              { label: "Administrators", val: stats.admins, trend: "Stable", icon: ShieldCheck, color: COLORS.critical },
              { label: "Active Sessions", val: stats.activeSessions, trend: "+10.4%", icon: Smartphone, color: COLORS.primary },
              { label: "Pending Invites", val: stats.pending, trend: "4 Pending", icon: Key, color: COLORS.warning },
              { label: "Locked Accounts", val: stats.locked, trend: "0.0% critical", icon: Lock, color: COLORS.critical }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <CardContent className="pt-4 p-4 flex flex-col gap-2">
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
                        <span className="text-xl font-bold font-mono tracking-tight text-foreground leading-none">{card.val}</span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-foreground-secondary font-sans mt-1">
                          {card.trend}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 2. ADVANCED FILTER BAR CARD */}
          <Card>
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
              
              {/* Global search */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Global search by name, email, employee ID key..."
                  className="w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-xs text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                />
                {globalSearch && (
                  <button onClick={() => setGlobalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Form grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">User Name</label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Email Address</label>
                  <input
                    type="text"
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs"
                  />
                </div>

                {/* ID */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Employee ID</label>
                  <input
                    type="text"
                    value={filterEmpId}
                    onChange={(e) => setFilterEmpId(e.target.value)}
                    placeholder="Enter ID"
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs font-mono"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Security Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Customer">Customer</option>
                    <option value="Loan Officer">Loan Officer</option>
                    <option value="Risk Analyst">Risk Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Department</label>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Departments</option>
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Organization */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Organization</label>
                  <select
                    value={filterOrg}
                    onChange={(e) => setFilterOrg(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Orgs</option>
                    {MOCK_ORGANIZATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Corporate Branch</label>
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Branches</option>
                    {MOCK_BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Status Badge</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Locked">Locked</option>
                    <option value="Pending Invitation">Pending Invitation</option>
                  </select>
                </div>

                {/* Last Session */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Last Session</label>
                  <select
                    value={filterLastLogin}
                    onChange={(e) => setFilterLastLogin(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All Times</option>
                    <option value="Today">Active Today</option>
                    <option value="Never">Never Logged In</option>
                    <option value="Older">Older (&gt;7 days)</option>
                  </select>
                </div>

                {/* Account MFA State */}
                <div className="space-y-1">
                  <label className="text-foreground-secondary font-semibold">Security State</label>
                  <select
                    value={filterAccountState}
                    onChange={(e) => setFilterAccountState(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-xs cursor-pointer"
                  >
                    <option value="All">All States</option>
                    <option value="MFA">MFA Enabled</option>
                    <option value="No-MFA">MFA Disabled</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-3.5 gap-3">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    Reset Filters
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveFilterView}>
                    Save Filter View
                  </Button>
                </div>
                
                <span className="text-[10px] text-foreground-muted font-medium">
                  Showing <span className="font-mono font-bold text-foreground">{filteredUsersList.length}</span> matching user schemas out of {users.length}.
                </span>
              </div>

            </CardContent>
          </Card>

          {/* BULK ACTIONS BANNER PANEL (Sticky header) */}
          {selectedRowsCount > 0 && (
            <div className="sticky top-0 bg-surface-elevated border border-primary/20 p-3.5 rounded-sm flex items-center justify-between shadow-md z-30 select-none animate-fadeIn">
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="font-bold text-xs">{selectedRowsCount} Selected</Badge>
                <span className="text-xs font-sans font-medium text-foreground-secondary hidden sm:inline">
                  Applying administrative actions across user schemas.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  Bulk Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkActionClick("suspend")}>
                  Bulk Suspend
                </Button>
                
                {/* Bulk Role dropdown */}
                <select
                  value={bulkTargetRole}
                  onChange={(e) => setBulkTargetRole(e.target.value as any)}
                  className="bg-surface border border-border text-[11px] font-sans font-medium h-9 px-2 rounded-xs outline-none cursor-pointer focus:border-primary"
                >
                  <option value="Customer">Role: Customer</option>
                  <option value="Loan Officer">Role: Loan Officer</option>
                  <option value="Risk Analyst">Role: Risk Analyst</option>
                  <option value="Manager">Role: Manager</option>
                  <option value="Administrator">Role: Admin</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => handleBulkActionClick("roleUpdate")}>
                  Update Roles
                </Button>

                <Button variant="destructive" size="sm" onClick={() => handleBulkActionClick("delete")}>
                  Bulk Delete
                </Button>
              </div>
            </div>
          )}

          {/* 3. TANSTACK DATA TABLE CARD */}
          <Card className="overflow-visible">
            <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <CardTitle>Directory Indexes</CardTitle>
                <CardDescription>Verify user identity credentials and adjust platform privileges.</CardDescription>
              </div>
              
              <div className="flex items-center gap-3 select-none">
                {/* Density Selector */}
                <div className="flex items-center bg-surface border border-border p-0.5 rounded-xs text-[10px]">
                  {(["compact", "comfortable", "loose"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDensity(d)}
                      className={cn(
                        "px-2 py-1 rounded-xs transition-all cursor-pointer font-bold capitalize",
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
                    <button className="flex items-center gap-1.5 h-9 px-3 border border-border bg-surface rounded-xs text-xs font-semibold cursor-pointer">
                      <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                      Columns
                    </button>
                  }
                  items={table.getAllLeafColumns().filter(col => col.id !== "select" && col.id !== "actions").map(col => ({
                    id: col.id,
                    label: col.id === "fullName" ? "User Details" : col.id === "email" ? "Contact Info" : col.id === "organization" ? "Affiliation" : col.id === "role" ? "Role" : col.id === "status" ? "Status" : col.id === "lastLogin" ? "Last Session" : "MFA",
                    icon: col.getIsVisible() ? Check : undefined,
                    onClick: () => col.toggleVisibility(!col.getIsVisible())
                  }))}
                  align="right"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto relative">
              {isLoading ? (
                /* SKELETON TABLE LOADING STATE */
                <div className="space-y-4 p-5 animate-pulse">
                  <div className="h-10 bg-border rounded-sm w-full" />
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-12 bg-border rounded-sm w-full" />
                  ))}
                </div>
              ) : filteredUsersList.length === 0 ? (
                /* EMPTY STATE */
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
                  <div className="h-16 w-16 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
                    <Users className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold text-base text-foreground">No Users Found</h3>
                    <p className="text-xs text-foreground-secondary max-w-xs leading-normal">
                      No matching user registry sheets found in database files. Reset filters to trace users.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
                      Invite User
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              ) : (
                /* ACTUAL TANSTACK TABLE */
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-border bg-surface-elevated/70 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider select-none sticky top-0">
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="p-4 font-sans font-bold select-none">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleViewProfile(row.original)}
                        className={cn(
                          "hover:bg-surface-hover/60 transition-colors cursor-pointer relative",
                          row.getIsSelected() && "bg-primary/5 hover:bg-primary/10"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            onClick={(e) => {
                              // Prevent click routing to Drawer if select checkbox or actions dropdown clicked
                              if (cell.column.id === "select" || cell.column.id === "actions") {
                                e.stopPropagation();
                              }
                            }}
                            className={cn(
                              "font-sans transition-all",
                              density === "compact" ? "p-2.5" : density === "comfortable" ? "p-3.5" : "p-5"
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

            {/* Pagination Controls */}
            {!isLoading && filteredUsersList.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between flex-wrap gap-4 select-none font-sans text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground-secondary">Rows per page:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="bg-surface border border-border rounded-xs px-2 py-1 outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    {[5, 10, 20, 30].map((pageSize) => (
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

      {/* 4. DETAILS DRAWER / SHEET OVERLAY */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="User Audit Profile"
        className="w-full max-w-md md:max-w-xl"
      >
        {selectedUser && (
          <div className="space-y-6 font-sans text-xs">
            {/* Drawer Header card */}
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <div className="h-12 w-12 rounded-full border-2 border-border bg-primary/10 text-primary flex items-center justify-center font-heading font-extrabold text-lg shrink-0 select-none">
                {selectedUser.avatar}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground leading-none flex items-center gap-2 truncate">
                  {selectedUser.fullName}
                  <Badge variant={selectedUser.status === "Active" ? "success" : "destructive"}>
                    {selectedUser.status}
                  </Badge>
                </h3>
                <span className="block text-[10px] text-foreground-secondary leading-none uppercase tracking-wider font-mono font-bold">
                  {selectedUser.employeeId} &bull; {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4 select-none">
              <Button variant="primary" size="sm" className="h-8 text-[10px] font-bold" onClick={() => handleEditUser(selectedUser)}>
                Edit User Details
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => handleResetPassword(selectedUser)}>
                Reset Password
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold text-critical hover:bg-critical/5 border-transparent" onClick={() => handleToggleDeactivate(selectedUser)}>
                {selectedUser.status === "Inactive" ? "Activate User" : "Deactivate User"}
              </Button>
            </div>

            {/* Divided Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Profile details */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Personal Details
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Employee ID</span>
                    <span className="font-semibold text-foreground font-mono">{selectedUser.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Access Role</span>
                    <span className="font-semibold text-foreground font-bold">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Organization</span>
                    <span className="font-semibold text-foreground">{selectedUser.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Department</span>
                    <span className="font-semibold text-foreground truncate max-w-[130px]">{selectedUser.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Branch Site</span>
                    <span className="font-semibold text-foreground truncate max-w-[130px]">{selectedUser.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Joined Date</span>
                    <span className="font-semibold text-foreground font-mono">{selectedUser.createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Contact Coordinates
                </span>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary font-sans">Primary Email</span>
                    <span className="font-semibold text-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary font-sans">Primary Phone</span>
                    <span className="font-semibold text-foreground">{selectedUser.phone}</span>
                  </div>
                </div>
              </div>

              {/* Security Metrics Panel */}
              <div className="space-y-3.5 md:col-span-2">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Security Telemetry Control
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 border border-border bg-surface-elevated/40 rounded-xs flex flex-col gap-1">
                    <span className="text-[9px] text-foreground-secondary font-semibold">Password Score</span>
                    <span className="text-xs font-bold text-positive font-mono leading-none">Strong (92)</span>
                  </div>
                  <div className="p-2 border border-border bg-surface-elevated/40 rounded-xs flex flex-col gap-1">
                    <span className="text-[9px] text-foreground-secondary font-semibold">MFA status</span>
                    <span className={cn("text-xs font-bold font-mono leading-none", selectedUser.mfaEnabled ? "text-positive" : "text-critical")}>
                      {selectedUser.mfaEnabled ? selectedUser.mfaType : "Disabled"}
                    </span>
                  </div>
                  <div className="p-2 border border-border bg-surface-elevated/40 rounded-xs flex flex-col gap-1">
                    <span className="text-[9px] text-foreground-secondary font-semibold">Failed Logins</span>
                    <span className={cn("text-xs font-bold font-mono leading-none", selectedUser.failedLogins > 2 ? "text-critical" : "text-foreground")}>
                      {selectedUser.failedLogins} Attempts
                    </span>
                  </div>
                  <div className="p-2 border border-border bg-surface-elevated/40 rounded-xs flex flex-col gap-1">
                    <span className="text-[9px] text-foreground-secondary font-semibold">Trusted Terminals</span>
                    <span className="text-xs font-bold text-foreground font-mono leading-none">{selectedUser.trustedDevicesCount} Terminals</span>
                  </div>
                </div>
              </div>

              {/* Scope assigned items lists (Assigned Cases, Reports, Devices) */}
              <div className="space-y-3.5 md:col-span-2">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  System Allocations & Assignments
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Assigned Devices */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-foreground-secondary block">Assigned Terminals</span>
                    {selectedUser.assignedDevices.length === 0 ? (
                      <span className="text-[10px] text-foreground-muted italic font-sans block">No devices configured</span>
                    ) : (
                      <div className="space-y-1">
                        {selectedUser.assignedDevices.map((d, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] text-foreground-secondary font-sans">
                            <Laptop className="h-3.5 w-3.5 text-foreground-muted" />
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Reports */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-foreground-secondary block">Assigned Reports</span>
                    {selectedUser.assignedReports.length === 0 ? (
                      <span className="text-[10px] text-foreground-muted italic font-sans block">No reports configured</span>
                    ) : (
                      <div className="space-y-1">
                        {selectedUser.assignedReports.map((r, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] text-foreground-secondary font-sans truncate max-w-[130px]" title={r}>
                            <FileText className="h-3.5 w-3.5 text-foreground-muted" />
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Cases */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-foreground-secondary block">Active Underwriting Cases</span>
                    {selectedUser.assignedCases.length === 0 ? (
                      <span className="text-[10px] text-foreground-muted italic font-sans block">No cases assigned</span>
                    ) : (
                      <div className="space-y-1">
                        {selectedUser.assignedCases.map((c, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] text-foreground-secondary font-mono">
                            <ClipboardList className="h-3.5 w-3.5 text-foreground-muted" />
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions scope */}
              <div className="space-y-3.5 md:col-span-2">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Active Access Privileges Scope ({selectedUser.permissions.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                  {selectedUser.permissions.map((perm) => (
                    <span key={perm} className="inline-flex items-center font-mono text-[9px] font-bold bg-surface-elevated border border-border/80 px-2 py-0.5 rounded-xs text-foreground-secondary">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Login history table */}
              <div className="space-y-3.5 md:col-span-2">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Security Log Session Logs
                </span>
                
                {selectedUser.loginHistory.length === 0 ? (
                  <span className="text-[10px] text-foreground-muted italic block py-4">No login sessions recorded in database logs.</span>
                ) : (
                  <div className="border border-border rounded-xs overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px] font-sans">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated text-foreground-secondary font-bold uppercase tracking-wider">
                          <th className="p-2">Time</th>
                          <th className="p-2">IP Address</th>
                          <th className="p-2">Device</th>
                          <th className="p-2">Location</th>
                          <th className="p-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-surface text-foreground-secondary font-mono">
                        {selectedUser.loginHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-hover/30 transition-colors">
                            <td className="p-2 font-sans">{item.date} {item.time}</td>
                            <td className="p-2">{item.ip}</td>
                            <td className="p-2 font-sans">{item.device} ({item.browser})</td>
                            <td className="p-2 font-sans">{item.location}</td>
                            <td className="p-2 text-right">
                              <Badge variant={item.status === "Success" ? "success" : "destructive"}>
                                {item.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Audit activities timeline */}
              <div className="space-y-3.5 md:col-span-2">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-1">
                  Activity Timeline History Logs
                </span>
                
                <div className="space-y-4 pl-3 border-l border-border relative ml-1 pt-1.5">
                  {selectedUser.activities.map((act, idx) => (
                    <div key={idx} className="relative space-y-0.5 select-none">
                      <div className="absolute top-1 left-[-16.5px] h-2 w-2 rounded-full bg-border border border-surface" />
                      <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                        <span className="font-bold text-foreground">{act.event}</span>
                        <span className="text-foreground-muted font-bold">{act.timestamp}</span>
                      </div>
                      <p className="text-foreground-secondary leading-relaxed font-sans">{act.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </Sheet>

      {/* 5. CREATE USER STEP DIALOG (4 steps modal) */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setInviteStep(1);
        }}
        title="Invite Platform User"
        className="max-w-md md:max-w-lg font-sans text-xs"
      >
        <div className="space-y-5">
          {/* Visual Step indicators */}
          <div className="flex items-center justify-between border-b border-border pb-3 select-none">
            {[1, 2, 3, 4].map((step) => {
              const isActive = inviteStep === step;
              const isDone = inviteStep > step;
              return (
                <div key={step} className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] border transition-colors",
                    isActive ? "bg-primary border-primary text-white" :
                    isDone ? "bg-positive/10 border-positive text-positive" : "bg-surface border-border text-foreground-secondary"
                  )}>
                    {isDone ? <Check className="h-3.5 w-3.5" /> : step}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold hidden sm:inline capitalize",
                    isActive ? "text-primary" : "text-foreground-muted"
                  )}>
                    {step === 1 ? "Personal" : step === 2 ? "Org Assignment" : step === 3 ? "Permissions" : "Security"}
                  </span>
                  {step < 4 && <ChevronRight className="h-3.5 w-3.5 text-foreground-muted hidden sm:inline" />}
                </div>
              );
            })}
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (inviteStep === 4) {
              handleCreateUserSubmit(e);
            }
          }} className="space-y-4">

            {/* STEP 1: Personal Details */}
            {inviteStep === 1 && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                    placeholder="E.g. Officer Rahul"
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="rahul.ro@arthdrishti.in"
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Employee ID (CST/EMP/ORG format)</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.employeeId}
                    onChange={(e) => setInviteForm({ ...inviteForm, employeeId: e.target.value })}
                    placeholder="EMP-2026-XXXX"
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Org Assignment */}
            {inviteStep === 2 && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Corporate Organization</label>
                  <select
                    value={inviteForm.organization}
                    onChange={(e) => setInviteForm({ ...inviteForm, organization: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_ORGANIZATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Business Unit Department</label>
                  <select
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Office Branch Site</label>
                  <select
                    value={inviteForm.branch}
                    onChange={(e) => setInviteForm({ ...inviteForm, branch: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Role & Permissions checklist */}
            {inviteStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Assigned Account Security Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => handleRoleSelection(e.target.value as any)}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Loan Officer">Loan Officer</option>
                    <option value="Risk Analyst">Risk Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>

                <div className="space-y-2 border border-border p-3.5 bg-surface-elevated/40 rounded-sm">
                  <span className="font-heading font-semibold text-[10px] text-foreground-secondary uppercase tracking-wider block">
                    Permission Scope Allocation Checklists
                  </span>
                  
                  {/* Grid check list of permissions */}
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 select-none pt-1">
                    {[
                      { val: "users:read", label: "Read Directory" },
                      { val: "users:write", label: "Write Profiles" },
                      { val: "orgs:read", label: "View Orgs" },
                      { val: "orgs:write", label: "Manage Orgs" },
                      { val: "models:read", label: "View AI Models" },
                      { val: "models:write", label: "retrain Weights" },
                      { val: "models:retrain", label: "Queue Models" },
                      { val: "system:diagnostics", label: "Execute Diagn." },
                      { val: "audit:read", label: "Read Audit Log" }
                    ].map((perm) => {
                      const isChecked = inviteForm.permissions.includes(perm.val);
                      return (
                        <label key={perm.val} className="flex items-center gap-2 cursor-pointer font-sans text-[11px] text-foreground-secondary">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermissionCheckbox(perm.val)}
                            className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Security setup & Review */}
            {inviteStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 border border-border/80 bg-surface-elevated p-3.5 rounded-sm">
                  <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider border-b border-border/40 pb-1.5 select-none">
                    Review Invitation Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                    <div className="space-y-0.5">
                      <span className="text-foreground-muted block font-sans">Full Name:</span>
                      <span className="font-semibold text-foreground">{inviteForm.fullName}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-foreground-muted block font-sans">Email Address:</span>
                      <span className="font-semibold text-foreground font-mono">{inviteForm.email}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-foreground-muted block font-sans">Access Role:</span>
                      <span className="font-semibold text-foreground font-bold">{inviteForm.role}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-foreground-muted block font-sans">Organization:</span>
                      <span className="font-semibold text-foreground">{inviteForm.organization}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5 relative">
                    <label className="text-foreground-secondary font-semibold">Temporary Setup Password</label>
                    <input
                      type="password"
                      required
                      value={inviteForm.tempPassword}
                      onChange={(e) => setInviteForm({ ...inviteForm, tempPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 select-none">
                    <input
                      id="invite-mfa"
                      type="checkbox"
                      checked={inviteForm.forceMfa}
                      onChange={(e) => setInviteForm({ ...inviteForm, forceMfa: e.target.checked })}
                      className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <label htmlFor="invite-mfa" className="text-foreground-secondary font-sans cursor-pointer font-semibold">
                      Force MFA enrolment on initial authentication sync
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Buttons panel */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div>
                {inviteStep > 1 && (
                  <Button variant="outline" type="button" size="sm" onClick={handleInviteStepPrev}>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => {
                    setIsInviteOpen(false);
                    setInviteStep(1);
                  }}
                >
                  Cancel
                </Button>
                {inviteStep < 4 ? (
                  <Button variant="primary" type="button" size="sm" onClick={handleInviteStepNext}>
                    Next
                  </Button>
                ) : (
                  <Button variant="primary" type="submit" size="sm">
                    Invite User
                  </Button>
                )}
              </div>
            </div>

          </form>
        </div>
      </Modal>

      {/* 6. EDIT USER DIALOG (Tabs form modal) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User Directory Details"
        className="max-w-md md:max-w-lg font-sans text-xs"
      >
        {editingUserForm && (
          <form onSubmit={handleEditSave} className="space-y-5">
            {/* Modal horizontal tabs */}
            <div className="flex border-b border-border/60 overflow-x-auto scrollbar-none pb-0 select-none">
              <div className="flex space-x-5">
                {(["profile", "org", "role", "perms", "prefs"] as const).map((tab) => {
                  const labels: Record<string, string> = {
                    profile: "Profile",
                    org: "Organization",
                    role: "Assigned Role",
                    perms: "Permissions",
                    prefs: "Preferences"
                  };
                  const isActive = editModalTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setEditModalTab(tab)}
                      className={cn(
                        "relative pb-2.5 text-xs font-semibold transition-colors cursor-pointer",
                        isActive ? "text-primary font-bold" : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      <span>{labels[tab]}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT: PROFILE */}
            {editModalTab === "profile" && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUserForm.fullName}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, fullName: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUserForm.email}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingUserForm.phone}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORG */}
            {editModalTab === "org" && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Corporate Organization</label>
                  <select
                    value={editingUserForm.organization}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, organization: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_ORGANIZATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Business Unit Department</label>
                  <select
                    value={editingUserForm.department}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, department: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Branch Office Location</label>
                  <select
                    value={editingUserForm.branch}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, branch: e.target.value })}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    {MOCK_BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ROLE */}
            {editModalTab === "role" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-foreground-secondary font-semibold">Select Access Role</label>
                  <select
                    value={editingUserForm.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as any;
                      setEditingUserForm({
                        ...editingUserForm,
                        role: nextRole,
                        permissions: [...MOCK_PERMISSIONS[nextRole]]
                      });
                    }}
                    className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Loan Officer">Loan Officer</option>
                    <option value="Risk Analyst">Risk Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>

                <div className="p-3.5 border border-border bg-surface-elevated/40 rounded-xs space-y-1 select-none">
                  <span className="font-bold text-foreground">Access Level Permission Summary</span>
                  <p className="text-foreground-secondary leading-normal">
                    Changing the role auto-populates pre-defined permission guidelines. You can modify specific guidelines inside the Permissions tab.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PERMS */}
            {editModalTab === "perms" && (
              <div className="space-y-2 border border-border p-3.5 bg-surface-elevated/40 rounded-sm">
                <span className="font-heading font-bold text-[10px] text-foreground-secondary uppercase tracking-wider block border-b border-border/40 pb-1.5 select-none">
                  Permission Scope Checklists Override
                </span>
                
                <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1 pt-1.5">
                  {[
                    { val: "users:read", label: "Read Directory" },
                    { val: "users:write", label: "Write Profiles" },
                    { val: "orgs:read", label: "View Orgs" },
                    { val: "orgs:write", label: "Manage Orgs" },
                    { val: "models:read", label: "View AI Models" },
                    { val: "models:write", label: "retrain Weights" },
                    { val: "models:retrain", label: "Queue Models" },
                    { val: "system:diagnostics", label: "Execute Diagn." },
                    { val: "audit:read", label: "Read Audit Log" }
                  ].map((perm) => {
                    const isChecked = editingUserForm.permissions.includes(perm.val);
                    return (
                      <label key={perm.val} className="flex items-center gap-2 cursor-pointer text-foreground-secondary">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const permsList = editingUserForm.permissions;
                            const has = permsList.includes(perm.val);
                            const updatedPerms = has
                              ? permsList.filter((p) => p !== perm.val)
                              : [...permsList, perm.val];
                            setEditingUserForm({ ...editingUserForm, permissions: updatedPerms });
                          }}
                          className="h-3.5 w-3.5 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PREFS */}
            {editModalTab === "prefs" && (
              <div className="space-y-4 font-sans text-xs select-none">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div>
                    <span className="font-semibold text-foreground block">Force MFA Enrolment</span>
                    <span className="text-[10px] text-foreground-secondary leading-normal block max-w-[280px]">
                      Forces TOTP validation prompts during the next system login sync.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingUserForm.mfaEnabled}
                    onChange={(e) => setEditingUserForm({ ...editingUserForm, mfaEnabled: e.target.checked })}
                    className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground block">Email Dispatch Preferences</span>
                    <span className="text-[10px] text-foreground-secondary leading-normal block max-w-[280px]">
                      Automate alert emails mapping profile adjustments.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Edit Modal buttons */}
            <div className="pt-4 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" type="button" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" size="sm">
                Save Profile Changes
              </Button>
            </div>

          </form>
        )}
      </Modal>

      {/* 7. DELETE SINGLE USER CONFIRM MODAL */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm User Account Deletion"
        className="max-w-md font-sans text-xs"
      >
        <div className="space-y-5 text-left">
          <div className="flex gap-3 items-start border-b border-border pb-4">
            <AlertTriangle className="h-6 w-6 text-critical shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="block font-bold text-foreground">Delete Account permanently?</span>
              <p className="text-foreground-secondary">
                You are about to delete user card credentials for: <span className="font-semibold text-foreground font-sans">{selectedUser?.fullName}</span>.
                This action will revoke all permissions and is cryptographically permanent.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2.5 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDeleteUser}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. BULK OPERATION CONFIRM MODAL */}
      <Modal
        isOpen={isBulkActionConfirmOpen}
        onClose={() => setIsBulkActionConfirmOpen(false)}
        title="Confirm Bulk Administration Event"
        className="max-w-md font-sans text-xs"
      >
        <div className="space-y-5 text-left leading-normal">
          <div className="flex gap-3 items-start border-b border-border pb-4">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block font-bold text-foreground">Confirm Administrative Change?</span>
              <p className="text-foreground-secondary">
                You have requested a bulk event: <span className="font-bold text-foreground uppercase tracking-wider">{bulkActionType}</span> across{" "}
                <span className="font-bold text-foreground font-mono">{selectedRowsCount} selected users</span>. 
                Are you sure you want to proceed?
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2.5 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsBulkActionConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={executeBulkAction}>
              Execute Bulk Action
            </Button>
          </div>
        </div>
      </Modal>

    </PageContainer>
  );
}
