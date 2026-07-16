// System Health & Background Jobs operations center datasets

export type HealthStatus = "Healthy" | "Warning" | "Degraded" | "Maintenance" | "Offline";
export type JobStatus = "Queued" | "Running" | "Completed" | "Failed" | "Retrying" | "Cancelled" | "Scheduled";

export interface ServiceHealthRow {
  id: string;
  name: string;
  status: HealthStatus;
  uptime: number; // in %
  cpu: number; // in %
  memory: number; // in MB
  latency: number; // in ms
  lastCheck: string;
}

export interface BackgroundJobItem {
  id: string;
  name: string;
  category: "AI Training" | "Ingestion" | "BI Reports" | "Mailing" | "Cleanup" | "System Check";
  priority: "Critical" | "High" | "Medium" | "Low";
  queue: string;
  worker: string;
  status: JobStatus;
  progress: number; // 0 to 100
  startedAt: string;
  completedAt: string;
  duration: number; // in seconds
  description: string;
  createdBy: string;
  logs: string[];
  output: string;
}

export interface QueueMonitorItem {
  name: string;
  queued: number;
  running: number;
  avgWait: number; // in seconds
  workers: number;
}

export interface WorkerMonitorItem {
  name: string;
  currentJob: string;
  cpu: number;
  memory: number; // in MB
  status: "Active" | "Idle" | "Offline";
  processedJobs: number;
}

export interface ScheduledTaskItem {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron
  lastRun: string;
  nextRun: string;
  status: "Active" | "Paused" | "Running";
}

export interface SystemOverviewPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number; // in MB/s
  networkOut: number; // in MB/s
  dbConn: number;
  queueLen: number;
  workerUtil: number; // in %
}

export interface DatabaseMonitorPoint {
  time: string;
  connections: number;
  queryTime: number; // in ms
  reads: number;
  writes: number;
  cacheHitRate: number; // in %
}

export interface SystemAlertItem {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  timestamp: string;
  message: string;
}

export interface EventTimelineItem {
  id: string;
  title: string;
  timestamp: string;
  type: "Info" | "Success" | "Warning" | "Critical";
  message: string;
}

export const SERVICES_HEALTH_DATA: ServiceHealthRow[] = [
  { id: "srv-auth", name: "Authentication Service", status: "Healthy", uptime: 100.00, cpu: 1.2, memory: 124, latency: 12, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-customer", name: "Customer Service", status: "Healthy", uptime: 99.99, cpu: 2.8, memory: 256, latency: 18, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-officer", name: "Officer Service", status: "Healthy", uptime: 99.98, cpu: 3.5, memory: 312, latency: 45, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-admin", name: "Admin Service", status: "Healthy", uptime: 100.00, cpu: 0.8, memory: 98, latency: 10, lastCheck: "2026-07-14 20:24:55" },
  { id: "srv-credit", name: "Credit Risk Engine", status: "Healthy", uptime: 99.95, cpu: 14.5, memory: 1240, latency: 180, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-fraud", name: "Fraud Detection Engine", status: "Healthy", uptime: 99.99, cpu: 28.2, memory: 2048, latency: 14, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-finhealth", name: "Financial Health Engine", status: "Healthy", uptime: 99.97, cpu: 8.4, memory: 512, latency: 32, lastCheck: "2026-07-14 20:24:58" },
  { id: "srv-cashflow", name: "Cash Flow Engine", status: "Healthy", uptime: 99.96, cpu: 6.2, memory: 480, latency: 25, lastCheck: "2026-07-14 20:24:50" },
  { id: "srv-notify", name: "Notification Service", status: "Healthy", uptime: 99.95, cpu: 4.8, memory: 280, latency: 20, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-email", name: "Email Service", status: "Healthy", uptime: 99.90, cpu: 2.1, memory: 180, latency: 85, lastCheck: "2026-07-14 20:24:45" },
  { id: "srv-db", name: "Database (PostgreSQL)", status: "Healthy", uptime: 99.99, cpu: 18.5, memory: 4096, latency: 4, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-redis", name: "Redis Cache", status: "Healthy", uptime: 100.00, cpu: 5.4, memory: 1024, latency: 1, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-s3", name: "Object Storage (S3)", status: "Degraded", uptime: 99.42, cpu: 0.0, memory: 0, latency: 4200, lastCheck: "2026-07-14 20:23:12" },
  { id: "srv-worker", name: "Background Worker", status: "Warning", uptime: 99.85, cpu: 78.4, memory: 8192, latency: 0, lastCheck: "2026-07-14 20:25:00" },
  { id: "srv-gateway", name: "API Gateway", status: "Healthy", uptime: 100.00, cpu: 4.5, memory: 512, latency: 2, lastCheck: "2026-07-14 20:25:00" }
];

export const BACKGROUND_JOBS_DATA: BackgroundJobItem[] = [
  {
    id: "JOB-401",
    name: "Model Retraining Ensemble",
    category: "AI Training",
    priority: "Critical",
    queue: "AI Prediction Queue",
    worker: "ml-worker-3",
    status: "Running",
    progress: 45,
    startedAt: "2026-07-14 20:00:12",
    completedAt: "—",
    duration: 1620,
    description: "Triggers recalculations of underwriting coefficients utilizing July transaction batches.",
    createdBy: "System Cron",
    logs: [
      "[2026-07-14 20:00:12] Ingested 1.2M historical samples from pg-master-db",
      "[2026-07-14 20:05:00] Initialized validation tests: F1-score reference: 0.948",
      "[2026-07-14 20:15:30] Compiling model layer weights. Epoch 24/50 completed."
    ],
    output: "Model training in progress. Loss: 0.042 | Accuracy: 95.8%"
  },
  {
    id: "JOB-402",
    name: "Mailing campaign dispatch",
    category: "Mailing",
    priority: "Low",
    queue: "Email Queue",
    worker: "comm-worker-1",
    status: "Completed",
    progress: 100,
    startedAt: "2026-07-14 19:30:00",
    completedAt: "2026-07-14 19:35:12",
    duration: 312,
    description: "Sends automated monthly account activity digests to corporate clients.",
    createdBy: "Retail Marketing",
    logs: [
      "[2026-07-14 19:30:00] Compiled contact index. Target list: 4,500 addresses",
      "[2026-07-14 19:33:15] SMTP brokers validated. Dispatched 2,000 blocks",
      "[2026-07-14 19:35:12] Dispatch complete. Senders reported 0 bounce violations."
    ],
    output: "4,500 emails sent. Uptime bounce checks: 100.00% success."
  },
  {
    id: "JOB-403",
    name: "KYC Documents processing",
    category: "Ingestion",
    priority: "High",
    queue: "Document Processing Queue",
    worker: "storage-worker-2",
    status: "Failed",
    progress: 12,
    startedAt: "2026-07-14 19:12:00",
    completedAt: "2026-07-14 19:12:05",
    duration: 5,
    description: "Ingests scanned KYC image buffers from onboarding folder into storage vaults.",
    createdBy: "Onboarding App",
    logs: [
      "[2026-07-14 19:12:00] Ingestion trigger generated for client KYC-1025",
      "[2026-07-14 19:12:04] Upload request dispatched to Object Storage S3",
      "[2026-07-14 19:12:05] FATAL: Connection refused to endpoint storage-s3.cloud.internal. Gateway timeout."
    ],
    output: "S3 connection failed. HTTP 503 Service Unavailable."
  },
  {
    id: "JOB-404",
    name: "Database Backup backup",
    category: "Cleanup",
    priority: "Medium",
    queue: "Export Queue",
    worker: "db-worker-1",
    status: "Scheduled",
    progress: 0,
    startedAt: "—",
    completedAt: "—",
    duration: 0,
    description: "Daily automated snapshot backup of pg-master-db clusters.",
    createdBy: "System Cron",
    logs: [
      "[2026-07-14 20:25:00] Backup scheduler active. Task queued under priority Medium."
    ],
    output: "Scheduled to start on 2026-07-14 23:59:00."
  },
  {
    id: "JOB-405",
    name: "Financial Health aggregation",
    category: "BI Reports",
    priority: "High",
    queue: "Report Queue",
    worker: "bi-worker-2",
    status: "Queued",
    progress: 0,
    startedAt: "—",
    completedAt: "—",
    duration: 0,
    description: "Aggregates quarterly treasury transaction logs for executive board audit.",
    createdBy: "Treasury Officer",
    logs: [
      "[2026-07-14 20:22:15] Aggregation trigger requested. Validation checklist locks complete.",
      "[2026-07-14 20:23:00] Placed in Report Queue. Awaiting worker threads allocation."
    ],
    output: "Queued. Current wait time estimation: 45 seconds."
  },
  {
    id: "JOB-406",
    name: "Old session records cleanup",
    category: "Cleanup",
    priority: "Low",
    queue: "Export Queue",
    worker: "sys-worker-4",
    status: "Cancelled",
    progress: 0,
    startedAt: "—",
    completedAt: "—",
    duration: 0,
    description: "Flushes expired redis login session tokens Older than 30 days.",
    createdBy: "Platform Admin",
    logs: [
      "[2026-07-14 18:00:00] Task initiated manually.",
      "[2026-07-14 18:00:15] Cancel request sent by administrator. Halting worker thread allocation."
    ],
    output: "Cancelled by administrator request."
  }
];

export const QUEUES_MONITOR_DATA: QueueMonitorItem[] = [
  { name: "Email Queue", queued: 0, running: 1, avgWait: 2.1, workers: 2 },
  { name: "Report Queue", queued: 1, running: 0, avgWait: 45.0, workers: 2 },
  { name: "AI Prediction Queue", queued: 2, running: 1, avgWait: 154.0, workers: 4 },
  { name: "Notification Queue", queued: 0, running: 0, avgWait: 0.5, workers: 3 },
  { name: "Document Processing Queue", queued: 8, running: 0, avgWait: 950.0, workers: 0 },
  { name: "Export Queue", queued: 1, running: 0, avgWait: 12.5, workers: 2 }
];

export const WORKERS_MONITOR_DATA: WorkerMonitorItem[] = [
  { name: "ml-worker-3", currentJob: "Model Retraining Ensemble", cpu: 84.5, memory: 4096, status: "Active", processedJobs: 142 },
  { name: "comm-worker-1", currentJob: "Mailing campaign dispatch", cpu: 12.1, memory: 512, status: "Idle", processedJobs: 842 },
  { name: "storage-worker-2", currentJob: "None", cpu: 0.0, memory: 256, status: "Offline", processedJobs: 54 },
  { name: "db-worker-1", currentJob: "None", cpu: 4.8, memory: 1024, status: "Idle", processedJobs: 120 },
  { name: "bi-worker-2", currentJob: "None", cpu: 1.2, memory: 512, status: "Idle", processedJobs: 45 }
];

export const SCHEDULED_TASKS_DATA: ScheduledTaskItem[] = [
  { id: "SCH-01", name: "Daily Report Generation", description: "Generates daily balance reports.", schedule: "0 6 * * *", lastRun: "2026-07-14 06:00:02", nextRun: "2026-07-15 06:00:00", status: "Active" },
  { id: "SCH-02", name: "Model Retraining", description: "Hourly prediction weight updates.", schedule: "0 */4 * * *", lastRun: "2026-07-14 20:00:12", nextRun: "2026-07-15 00:00:00", status: "Running" },
  { id: "SCH-03", name: "Database Backup", description: "Midnight backup archives.", schedule: "0 0 * * *", lastRun: "2026-07-14 00:00:15", nextRun: "2026-07-15 00:00:00", status: "Active" },
  { id: "SCH-04", name: "System Cleanup", description: "Wipes temp folders.", schedule: "0 2 * * 0", lastRun: "2026-07-12 02:00:04", nextRun: "2026-07-19 02:00:00", status: "Active" },
  { id: "SCH-05", name: "Notification Sync", description: "Flushes messaging stacks.", schedule: "*/5 * * * *", lastRun: "2026-07-14 20:25:01", nextRun: "2026-07-14 20:30:00", status: "Active" },
  { id: "SCH-06", name: "Log Rotation", description: "Compresses diagnostics history.", schedule: "0 1 * * *", lastRun: "2026-07-14 01:00:01", nextRun: "2026-07-15 01:00:00", status: "Active" },
  { id: "SCH-07", name: "Health Check", description: "Continuous service validations.", schedule: "*/1 * * * *", lastRun: "2026-07-14 20:26:00", nextRun: "2026-07-14 20:27:00", status: "Active" }
];

export const SYSTEM_OVERVIEW_DATA: Record<string, SystemOverviewPoint[]> = {
  "Live": [
    { time: "20:22:00", cpu: 42, memory: 64, disk: 32, networkIn: 4.5, networkOut: 8.2, dbConn: 240, queueLen: 10, workerUtil: 75 },
    { time: "20:23:00", cpu: 45, memory: 65, disk: 32, networkIn: 5.1, networkOut: 9.4, dbConn: 248, queueLen: 12, workerUtil: 78 },
    { time: "20:24:00", cpu: 78, memory: 68, disk: 32, networkIn: 12.4, networkOut: 24.5, dbConn: 310, queueLen: 15, workerUtil: 84 },
    { time: "20:25:00", cpu: 74, memory: 69, disk: 32, networkIn: 10.2, networkOut: 20.8, dbConn: 298, queueLen: 14, workerUtil: 82 },
    { time: "20:26:00", cpu: 52, memory: 66, disk: 32, networkIn: 6.8, networkOut: 12.4, dbConn: 254, queueLen: 13, workerUtil: 78 },
    { time: "20:27:00", cpu: 48, memory: 65, disk: 32, networkIn: 5.4, networkOut: 9.8, dbConn: 244, queueLen: 12, workerUtil: 74 }
  ],
  "Today": [
    { time: "00:00", cpu: 15, memory: 40, disk: 30, networkIn: 0.8, networkOut: 1.2, dbConn: 45, queueLen: 1, workerUtil: 10 },
    { time: "04:00", cpu: 12, memory: 40, disk: 30, networkIn: 0.5, networkOut: 0.8, dbConn: 38, queueLen: 0, workerUtil: 5 },
    { time: "08:00", cpu: 35, memory: 52, disk: 31, networkIn: 4.2, networkOut: 6.5, dbConn: 180, queueLen: 4, workerUtil: 45 },
    { time: "12:00", cpu: 58, memory: 62, disk: 31, networkIn: 8.5, networkOut: 15.4, dbConn: 284, queueLen: 8, workerUtil: 72 },
    { time: "16:00", cpu: 64, memory: 64, disk: 32, networkIn: 9.8, networkOut: 18.2, dbConn: 320, queueLen: 11, workerUtil: 80 },
    { time: "20:00", cpu: 48, memory: 65, disk: 32, networkIn: 5.4, networkOut: 9.8, dbConn: 244, queueLen: 12, workerUtil: 74 }
  ],
  "7 Days": [
    { time: "Jul 08", cpu: 32, memory: 55, disk: 28, networkIn: 4.8, networkOut: 8.5, dbConn: 210, queueLen: 3, workerUtil: 40 },
    { time: "Jul 09", cpu: 35, memory: 58, disk: 28, networkIn: 5.2, networkOut: 9.2, dbConn: 220, queueLen: 4, workerUtil: 45 },
    { time: "Jul 10", cpu: 45, memory: 60, disk: 29, networkIn: 6.4, networkOut: 11.5, dbConn: 250, queueLen: 5, workerUtil: 55 },
    { time: "Jul 11", cpu: 52, memory: 62, disk: 29, networkIn: 8.2, networkOut: 14.8, dbConn: 290, queueLen: 8, workerUtil: 70 },
    { time: "Jul 12", cpu: 28, memory: 52, disk: 30, networkIn: 3.1, networkOut: 5.4, dbConn: 140, queueLen: 2, workerUtil: 30 },
    { time: "Jul 13", cpu: 42, memory: 60, disk: 30, networkIn: 6.5, networkOut: 11.8, dbConn: 230, queueLen: 6, workerUtil: 60 },
    { time: "Jul 14", cpu: 48, memory: 65, disk: 32, networkIn: 5.4, networkOut: 9.8, dbConn: 244, queueLen: 12, workerUtil: 74 }
  ],
  "30 Days": [
    { time: "Wk 1", cpu: 30, memory: 52, disk: 24, networkIn: 4.2, networkOut: 7.8, dbConn: 198, queueLen: 2, workerUtil: 35 },
    { time: "Wk 2", cpu: 38, memory: 58, disk: 26, networkIn: 5.8, networkOut: 10.4, dbConn: 235, queueLen: 4, workerUtil: 50 },
    { time: "Wk 3", cpu: 44, memory: 61, disk: 29, networkIn: 7.2, networkOut: 12.8, dbConn: 275, queueLen: 7, workerUtil: 65 },
    { time: "Wk 4", cpu: 48, memory: 65, disk: 32, networkIn: 5.4, networkOut: 9.8, dbConn: 244, queueLen: 12, workerUtil: 74 }
  ]
};

export const DATABASE_MONITOR_DATA: DatabaseMonitorPoint[] = [
  { time: "20:22:00", connections: 240, queryTime: 4.2, reads: 1240, writes: 420, cacheHitRate: 99.95 },
  { time: "20:23:00", connections: 248, queryTime: 4.5, reads: 1310, writes: 450, cacheHitRate: 99.94 },
  { time: "20:24:00", connections: 310, queryTime: 12.8, reads: 2420, writes: 840, cacheHitRate: 99.82 },
  { time: "20:25:00", connections: 298, queryTime: 8.4, reads: 2150, writes: 780, cacheHitRate: 99.88 },
  { time: "20:26:00", connections: 254, queryTime: 4.8, reads: 1450, writes: 480, cacheHitRate: 99.93 },
  { time: "20:27:00", connections: 244, queryTime: 4.1, reads: 1340, writes: 430, cacheHitRate: 99.95 }
];

export const SYSTEM_ALERTS_DATA: SystemAlertItem[] = [
  { id: "AL-301", title: "Storage Almost Full", severity: "Warning", timestamp: "2026-07-14 18:30:00", message: "KYC onboarding storage vault folder has crossed 88% capacity limits (total: 5TB)." },
  { id: "AL-302", title: "Worker Offline", severity: "Critical", timestamp: "2026-07-14 19:12:05", message: "Thread worker 'storage-worker-2' has crashed following S3 upload timeouts." },
  { id: "AL-303", title: "Database Latency High", severity: "Warning", timestamp: "2026-07-14 20:24:12", message: "PostgreSQL query runtimes breached 10ms threshold margins during batch loads." }
];

export const EVENT_TIMELINE_DATA: EventTimelineItem[] = [
  { id: "EV-01", title: "Worker Started", timestamp: "20:00:00", type: "Success", message: "Thread worker 'ml-worker-3' initialized. Worker pool: active." },
  { id: "EV-02", title: "Backup Completed", timestamp: "00:00:15", type: "Success", message: "Snapshot snapshot_base_v24 complete (14.2 GB compiled to S3)." },
  { id: "EV-03", title: "Queue Increased", timestamp: "19:12:00", type: "Warning", message: "Document Processing Queue backlogged with 8 pending tasks." },
  { id: "EV-04", title: "Database Restarted", timestamp: "14:20:00", type: "Info", message: "Master DB connection indexes flushed by administrator request." },
  { id: "EV-05", title: "Service Updated", timestamp: "12:00:00", type: "Info", message: "Reports API version promoted from v2.0.9 to v2.1.0." }
];
