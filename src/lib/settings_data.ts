// Platform Settings Telemetry & Configurations Schema

export interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  status: "Connected" | "Disconnected" | "Pending";
  category: "Identity" | "Cloud" | "Communications" | "Payments" | "Other";
}

export interface BackupHistoryItem {
  id: string;
  filename: string;
  size: string;
  timestamp: string;
  status: "Success" | "Failed";
  type: "Scheduled" | "Manual";
}

export const INITIAL_INTEGRATIONS: IntegrationCard[] = [
  { id: "google-workspace", name: "Google Workspace", description: "Enables SSO authentication and GDrive KYC uploads.", status: "Connected", category: "Identity" },
  { id: "azure-ad", name: "Microsoft Azure", description: "Sync organizational directories and user access roles.", status: "Connected", category: "Cloud" },
  { id: "aws-s3", name: "AWS S3 Cloud Storage", description: "Hot-tier document storage and database backup buckets.", status: "Connected", category: "Cloud" },
  { id: "firebase", name: "Firebase Notifications", description: "Routes push notification triggers to customer mobile apps.", status: "Disconnected", category: "Communications" },
  { id: "twilio", name: "Twilio SMS Gateway", description: "Sends text verification MFA pins and alert dispatches.", status: "Connected", category: "Communications" },
  { id: "sendgrid", name: "SendGrid Email SMTP", description: "High-deliverability transactional email gateway.", status: "Connected", category: "Communications" },
  { id: "stripe", name: "Stripe Payment Gateway", description: "Automates subscription billings and merchant payouts.", status: "Disconnected", category: "Payments" },
  { id: "webhook-gateway", name: "Generic Webhooks", description: "Forwards core system notifications to custom endpoints.", status: "Pending", category: "Other" }
];

export const INITIAL_BACKUPS: BackupHistoryItem[] = [
  { id: "BKP-912", filename: "arthdrishti_prod_2026-07-14.sql", size: "14.2 GB", timestamp: "2026-07-14 00:00:15", status: "Success", type: "Scheduled" },
  { id: "BKP-911", filename: "arthdrishti_manual_predeploy.sql", size: "14.1 GB", timestamp: "2026-07-13 14:10:00", status: "Success", type: "Manual" },
  { id: "BKP-910", filename: "arthdrishti_prod_2026-07-13.sql", size: "14.1 GB", timestamp: "2026-07-13 00:00:12", status: "Success", type: "Scheduled" },
  { id: "BKP-909", filename: "arthdrishti_prod_2026-07-12.sql", size: "13.9 GB", timestamp: "2026-07-12 00:00:15", status: "Success", type: "Scheduled" },
  { id: "BKP-908", filename: "arthdrishti_prod_2026-07-11.sql", size: "13.8 GB", timestamp: "2026-07-11 00:00:14", status: "Failed", type: "Scheduled" }
];

export const DEFAULT_PLATFORM_SETTINGS = {
  // General
  platformName: "ArthDrishti Platform Engine",
  platformDescription: "AI-Powered Advanced Commercial Credit Underwriting & Analytics Suite.",
  supportEmail: "support@arthdrishti.in",
  supportPhone: "+91 22 6820 9000",
  companyWebsite: "https://arthdrishti.in",
  timezone: "GMT+5:30",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  language: "en-US",

  // Branding
  logoUrl: "/assets/logo.png",
  faviconUrl: "/favicon.ico",
  primaryColor: "#4F7CFF",
  secondaryColor: "#64748B",
  accentColor: "#8B5CF6",
  orgLogoUrl: "/assets/org-logo.png",
  loginBackground: "gradient-glass",
  footerText: "© 2026 ArthDrishti Technologies Private Limited. All Rights Reserved. Secures RBI-SLA.",

  // Authentication
  emailLogin: true,
  googleLogin: true,
  microsoftLogin: true,
  ssoEnabled: false,
  passwordPolicy: "Strong (min 8 chars, 1 uppercase, 1 number, 1 special)",
  sessionTimeout: 30, // minutes
  rememberMeDuration: 14, // days

  // Security
  tfaRequired: true,
  minPasswordLength: 8,
  failedLoginLimit: 5,
  ipWhitelist: "103.45.192.0/24, 192.168.1.0/24",
  allowedDomains: "arthdrishti.in, indofincorp.com",
  encryptionStatus: "AES-256 Enabled (Hardware Vault)",
  sessionExpiryDuration: 1440, // minutes (24 Hours)

  // Organizations settings
  defaultOrgQuota: 50,
  defaultOrgRole: "Organization Manager",
  orgSignupApproval: true,
  blockedOrgDomains: "tempmail.com, 10minutemail.com",

  // Users settings
  maxUsersPerOrg: 100,
  userSignupApproval: true,
  domainWhitelistAutoJoin: "arthdrishti.in",
  sessionConcurrencyLimit: 3,

  // AI Configuration
  aiConfidenceThreshold: 85, // percentage
  autoRetraining: true,
  modelSelection: "Risk Ensemble v3.2-canary",
  predictionTimeout: 15, // seconds
  explainabilityLevel: "High (SHAP & LIME Matrices)",
  riskThreshold: 45, // percentage
  fraudThreshold: 15, // percentage
  financialHealthThreshold: 70, // percentage

  // Notification Settings
  emailAlerts: true,
  smsAlerts: true,
  pushAlerts: false,
  webhookAlerts: true,
  slackAlerts: true,
  teamsAlerts: false,
  dailyDigest: true,
  weeklyDigest: false,

  // Email settings
  smtpHost: "smtp.sendgrid.net",
  smtpPort: 587,
  senderName: "ArthDrishti Platform Gateway",
  senderEmail: "gateway@arthdrishti.in",
  smtpEncryption: "TLS",

  // API settings
  apiBaseUrl: "https://api.arthdrishti.in/v1",
  apiKeyCount: 3,
  webhookSecret: "whsec_X8F9J2L4M1N7P5Q0V3Z6W9K8R5",
  apiRateLimit: 1000, // req per minute per API key
  jwtExpiry: 120, // minutes

  // Storage
  storageUsed: "2.45 TB",
  storageLimit: "5.00 TB",
  backupLocation: "AWS S3 Glacier Vault Mumbai",
  fileSizeLimit: 25, // MB
  allowedFileTypes: ".pdf, .xlsx, .csv, .jpg, .png",

  // Backup & Recovery
  backupFrequency: "Daily at 00:00 IST",
  backupRetentionPolicy: "180 Days",

  // Log retention (days)
  auditLogsRetention: 365,
  appLogsRetention: 30,
  predictionLogsRetention: 90,
  notificationLogsRetention: 60,
  systemLogsRetention: 45,

  // Maintenance mode
  maintenanceEnabled: false,
  maintenanceMessage: "ArthDrishti core systems are undergoing scheduled maintenance. Services will restore shortly.",
  allowedMaintenanceUsers: "admin@arthdrishti.in, compliance@arthdrishti.in",
  estimatedCompletion: "2026-07-16 04:00 IST",

  // Advanced features
  devModeEnabled: false,
  debugLogsEnabled: false,
  performanceModeEnabled: true,
  featureFlagSmeUnderwrite: true,
  featureFlagEaiGraphs: true,
  experimentalTurboPrerender: false
};
