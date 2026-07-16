export type PermissionAction = "View" | "Create" | "Edit" | "Delete" | "Export" | "Approve" | "Assign" | "Configure";

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "View",
  "Create",
  "Edit",
  "Delete",
  "Export",
  "Approve",
  "Assign",
  "Configure"
];

export const PERMISSION_MODULES = [
  "Dashboard",
  "Customer Module",
  "Financial Health",
  "Credit Risk",
  "Fraud Intelligence",
  "Transactions",
  "Cash Flow",
  "Segmentation",
  "Reports",
  "Officer Module",
  "Applications",
  "Underwriting",
  "Risk Portfolio",
  "Decision History",
  "Organizations",
  "Users",
  "Roles",
  "Models",
  "Audit Logs",
  "System Health",
  "API Monitoring",
  "Settings"
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];

export interface PermissionMatrix {
  module: PermissionModule;
  actions: PermissionAction[]; // List of actions allowed, e.g. ["View", "Edit"]
}

export interface SystemRole {
  id: string;
  name: string;
  category: "System Default" | "Custom";
  description: string;
  usersCount: number;
  permissionsCount: number;
  status: "Active" | "Inactive";
  iconName: "User" | "UserCheck" | "Activity" | "Building2" | "Settings" | "ShieldCheck" | "Cpu";
  createdBy: string;
  createdDate: string;
  lastModified: string;
  matrix: PermissionMatrix[];
}

export interface RoleUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  organization: string;
  status: "Active" | "Inactive";
  assignedDate: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  status: "Active" | "Inactive";
  category: "Password" | "Session" | "MFA" | "IP" | "Location" | "Device";
}

export interface RoleAuditLog {
  id: string;
  type: "Role Created" | "Permissions Updated" | "User Assigned" | "User Removed" | "Role Deleted";
  timestamp: string;
  operator: string;
  detail: string;
}

export const MOCK_PERMISSION_GROUPS: Record<string, PermissionModule[]> = {
  "Customer Management": ["Dashboard", "Customer Module", "Financial Health", "Transactions", "Cash Flow", "Segmentation"],
  "Officer Operations": ["Officer Module", "Applications", "Underwriting", "Risk Portfolio", "Decision History"],
  "Risk Analysis": ["Credit Risk", "Fraud Intelligence", "Models"],
  "Administration": ["Organizations", "Users", "Roles", "Settings"],
  "Model Management": ["Models"],
  "Platform Monitoring": ["Audit Logs", "System Health", "API Monitoring"],
  "Reports": ["Reports"],
  "Settings": ["Settings"]
};

// Generates timeseries sparkline seed data
export const ROLE_SPARKLINES = {
  totalRoles: [5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9],
  activeRoles: [4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8],
  customRoles: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
  defaultRoles: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  groups: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  usersAssigned: [1200, 1280, 1340, 1400, 1450, 1490, 1530, 1580, 1600, 1620, 1640, 1660]
};

// Setup initial matrix for a role
const createMatrix = (allowed: Partial<Record<PermissionModule, PermissionAction[]>>): PermissionMatrix[] => {
  return PERMISSION_MODULES.map(module => ({
    module,
    actions: allowed[module] || []
  }));
};

export const INITIAL_ROLES: SystemRole[] = [
  {
    id: "role-customer",
    name: "Customer",
    category: "System Default",
    description: "Retail and corporate banking clients accessing self-service dashboards and transaction portals.",
    usersCount: 1420,
    permissionsCount: 10,
    status: "Active",
    iconName: "User",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2024-01-01",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Customer Module": ["View"],
      "Financial Health": ["View"],
      "Transactions": ["View", "Export"],
      "Cash Flow": ["View"],
      "Segmentation": ["View"],
      "Reports": ["View", "Export"]
    })
  },
  {
    id: "role-loan-officer",
    name: "Loan Officer",
    category: "System Default",
    description: "Frontline credit officers checking risk metrics, underwriting loan claims and submitting approvals.",
    usersCount: 84,
    permissionsCount: 22,
    status: "Active",
    iconName: "UserCheck",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2025-06-15",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Customer Module": ["View"],
      "Officer Module": ["View", "Create", "Edit"],
      "Applications": ["View", "Create", "Edit"],
      "Underwriting": ["View", "Create", "Edit", "Approve"],
      "Risk Portfolio": ["View"],
      "Decision History": ["View", "Export"],
      "Reports": ["View", "Export"]
    })
  },
  {
    id: "role-risk-analyst",
    name: "Risk Analyst",
    category: "System Default",
    description: "Credit specialists modeling drift rates, monitoring fraud alerts, and auditing accuracy metrics.",
    usersCount: 42,
    permissionsCount: 35,
    status: "Active",
    iconName: "Activity",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2026-03-10",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Credit Risk": ["View", "Edit", "Configure"],
      "Fraud Intelligence": ["View", "Edit", "Approve", "Configure"],
      "Risk Portfolio": ["View", "Edit", "Configure"],
      "Reports": ["View", "Create", "Edit", "Export"],
      "Models": ["View", "Create", "Edit", "Configure"],
      "Audit Logs": ["View"]
    })
  },
  {
    id: "role-branch-manager",
    name: "Branch Manager",
    category: "System Default",
    description: "Supervisors managing local underwriting workloads, reassignment cues, and auditing decisions.",
    usersCount: 18,
    permissionsCount: 28,
    status: "Active",
    iconName: "Building2",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2025-11-20",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Customer Module": ["View"],
      "Officer Module": ["View", "Edit", "Assign"],
      "Applications": ["View", "Edit", "Assign"],
      "Underwriting": ["View", "Edit", "Approve", "Assign"],
      "Decision History": ["View", "Export", "Approve"],
      "Reports": ["View", "Export"],
      "Audit Logs": ["View"]
    })
  },
  {
    id: "role-org-admin",
    name: "Organization Admin",
    category: "System Default",
    description: "Bank enterprise administrators regulating corporate branches, inviting members, and rotating API keys.",
    usersCount: 12,
    permissionsCount: 48,
    status: "Active",
    iconName: "Settings",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2026-07-01",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Organizations": ["View", "Edit", "Configure"],
      "Users": ["View", "Create", "Edit", "Delete", "Assign"],
      "Roles": ["View", "Create", "Edit", "Assign"],
      "Audit Logs": ["View", "Export"],
      "Settings": ["View", "Edit", "Configure"]
    })
  },
  {
    id: "role-platform-admin",
    name: "Platform Admin",
    category: "System Default",
    description: "ArthDrishti operations team monitoring server telemetries, managing microservices and running tasks.",
    usersCount: 6,
    permissionsCount: 62,
    status: "Active",
    iconName: "Cpu",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2026-07-10",
    matrix: createMatrix({
      "Dashboard": ["View"],
      "Models": ["View", "Edit", "Configure"],
      "Audit Logs": ["View", "Export"],
      "System Health": ["View", "Configure"],
      "API Monitoring": ["View", "Configure"],
      "Settings": ["View", "Edit", "Configure"]
    })
  },
  {
    id: "role-super-admin",
    name: "Super Admin",
    category: "System Default",
    description: "Root security administrator holding absolute permissions and access capabilities across all partitions.",
    usersCount: 3,
    permissionsCount: 176, // 22 modules * 8 actions
    status: "Active",
    iconName: "ShieldCheck",
    createdBy: "System",
    createdDate: "2024-01-01",
    lastModified: "2024-01-01",
    matrix: PERMISSION_MODULES.map(module => ({
      module,
      actions: [...PERMISSION_ACTIONS]
    }))
  }
];

export const INITIAL_ROLE_USERS: RoleUser[] = [
  { id: "u-1", name: "Rahul Chahar", email: "rahul.chahar@arthdrishti.in", avatar: "RC", department: "Platform Operations", organization: "ArthDrishti", status: "Active", assignedDate: "2026-03-12" },
  { id: "u-2", name: "Priya Sharma", email: "priya.sharma@hdfcbank.com", avatar: "PS", department: "Retail Lending Underwriting", organization: "HDFC Bank Ltd.", status: "Active", assignedDate: "2024-05-15" },
  { id: "u-3", name: "Anand Sinha", email: "anand.sinha@icicibank.com", avatar: "AS", department: "Risk Intelligence Unit", organization: "ICICI Bank Ltd.", status: "Active", assignedDate: "2025-08-20" },
  { id: "u-4", name: "Sarah Jenkins", email: "sarah.j@credco.org", avatar: "SJ", department: "Micro Lending Desk", organization: "CredCo Microfinance", status: "Active", assignedDate: "2024-08-15" },
  { id: "u-5", name: "Mathew Jacob", email: "mathew.j@muthoot.com", avatar: "MJ", department: "Collections Desk", organization: "Muthoot Finance", status: "Active", assignedDate: "2025-02-10" }
];

export const INITIAL_ACCESS_POLICIES: AccessPolicy[] = [
  { id: "pol-1", name: "Minimum Password Length", description: "Enforces a minimum length for administrator and risk analyst login keys.", value: 12, status: "Active", category: "Password" },
  { id: "pol-2", name: "Password Complexity Requirements", description: "Enforces letters, numbers, and special symbols in password definitions.", value: true, status: "Active", category: "Password" },
  { id: "pol-3", name: "Session Timeout Threshold (Minutes)", description: "Auto-terminates active dashboard sessions after period of inactivity.", value: 15, status: "Active", category: "Session" },
  { id: "pol-4", name: "Enforce MFA globally", description: "Mandates Authenticator App MFA registration for all client employees.", value: true, status: "Active", category: "MFA" },
  { id: "pol-5", name: "Branch Operations IP whitelisting", description: "Restricts risk analysts inputs to specified CIDR corporate networks.", value: true, status: "Inactive", category: "IP" },
  { id: "pol-6", name: "Geofenced Login Restraints", description: "Blocks platform access commands from locations outside national operations.", value: false, status: "Inactive", category: "Location" }
];

export const INITIAL_AUDIT_HISTORY: RoleAuditLog[] = [
  { id: "lh-1", type: "Role Created", timestamp: "2026-07-13 10:20:11", operator: "Rahul Chahar", detail: "Custom role 'Sub-Underwriter' provisioned under Officer Operations category." },
  { id: "lh-2", type: "Permissions Updated", timestamp: "2026-07-12 16:40:02", operator: "Rahul Chahar", detail: "Elevated 'Approve' permission on Applications for Loan Officer role." },
  { id: "lh-3", type: "User Assigned", timestamp: "2026-07-10 11:30:15", operator: "System AD Sync", detail: "Assigned user 'Priya Sharma' to Loan Officer role." },
  { id: "lh-4", type: "User Removed", timestamp: "2026-07-08 09:15:00", operator: "Sarah Jenkins", detail: "Removed 'Ramesh Patel' from Branch Manager seat list." }
];
