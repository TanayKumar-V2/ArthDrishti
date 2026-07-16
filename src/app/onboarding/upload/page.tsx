"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload as UploadIcon, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  X, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SelectedSourceMap {
  [key: string]: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  extension: string;
  status: "waiting" | "uploading" | "validating" | "valid" | "warning" | "error";
  progress: number;
  errorMsg?: string;
  warningMsg?: string;
}

const sourceNameMap: SelectedSourceMap = {
  "bank-statement": "Bank Statement",
  "credit-card": "Credit Card Statement",
  "transaction-history": "Transaction History",
  "salary-slip": "Salary Slip",
  "income-proof": "Income Proof"
};

export default function FileIngestionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interval and Timeout registry for cleanup under unmount
  const timersRef = useRef<{
    intervals: NodeJS.Timeout[];
    timeouts: { [key: string]: NodeJS.Timeout };
  }>({
    intervals: [],
    timeouts: {}
  });

  useEffect(() => {
    // Load selected sources
    const saved = localStorage.getItem("onboarding-selected-sources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedSources(parsed);
      } catch (e) {
        console.error("Failed to parse onboarding sources", e);
      }
    }
    
    // Copy ref value for cleanup closure
    const currentTimers = timersRef.current;
    
    // Cleanup timers on unmount
    return () => {
      currentTimers.intervals.forEach((interval) => clearInterval(interval));
      Object.values(currentTimers.timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Simulate file validation process
  const startFileSimulation = (fileId: string, filename: string, fileSize: number) => {
    // 1. Initial State: Uploading
    setFiles((prev) => 
      prev.map((f) => f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f)
    );

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      
      setFiles((prev) => 
        prev.map((f) => {
          if (f.id === fileId && f.status === "uploading") {
            const nextProgress = Math.min(currentProgress, 100);
            return { ...f, progress: nextProgress };
          }
          return f;
        })
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // 2. Transition State: Validating
        setFiles((prev) => 
          prev.map((f) => f.id === fileId ? { ...f, status: "validating", progress: 100 } : f)
        );

        // Run mock validation rules after 1.2s delay
        const timeout = setTimeout(() => {
          setFiles((prev) => 
            prev.map((f) => {
              if (f.id !== fileId) return f;

              const nameLower = filename.toLowerCase();
              const ext = nameLower.split(".").pop() || "";
              
              // Validation 1: Unsupported extension check
              const supportedExts = ["csv", "xlsx", "xls", "pdf"];
              if (!supportedExts.includes(ext)) {
                return {
                  ...f,
                  status: "error",
                  errorMsg: "Unsupported file format. Please upload CSV, Excel, or PDF statements."
                };
              }

              // Validation 2: File size limit check (10MB limit)
              const maxSizeBytes = 10 * 1024 * 1024; // 10MB
              if (fileSize > maxSizeBytes || nameLower.includes("large") || nameLower.includes("big")) {
                return {
                  ...f,
                  status: "error",
                  errorMsg: "File size exceeds the 10 MB maximum limit."
                };
              }

              // Validation 3: Password-protected PDF check
              if (nameLower.includes("pass") || nameLower.includes("protected") || nameLower.includes("locked")) {
                return {
                  ...f,
                  status: "error",
                  errorMsg: "Password-protected PDF. Please decrypt the file before uploading."
                };
              }

              // Validation 4: Duplicate file check
              const duplicateCheck = prev.some((other) => other.id !== fileId && other.name === filename);
              if (duplicateCheck || nameLower.includes("duplicate")) {
                return {
                  ...f,
                  status: "error",
                  errorMsg: "Duplicate file: This document has already been uploaded."
                };
              }

              // Validation 5: Missing expected columns warning
              if (nameLower.includes("missing") || nameLower.includes("empty") || nameLower.includes("warning")) {
                return {
                  ...f,
                  status: "warning",
                  warningMsg: "Warning: Missing expected ledger columns. We will attempt a partial scan."
                };
              }

              // Validation Success: Valid
              return {
                ...f,
                status: "valid"
              };
            })
          );
        }, 1200);

        timersRef.current.timeouts[fileId] = timeout;
      }
    }, 1500 / 10); // Upload takes ~1.5s total

    timersRef.current.intervals.push(interval);
  };

  const handleFileAdd = (rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];

    Array.from(rawFiles).forEach((file) => {
      const fileId = Math.random().toString(36).substring(2, 9);
      const ext = "." + file.name.split(".").pop();
      
      const newFileObj: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        extension: ext,
        status: "waiting",
        progress: 0
      };

      newFiles.push(newFileObj);
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Start simulation async
    newFiles.forEach((f) => {
      startFileSimulation(f.id, f.name, f.size);
    });
  };

  // Drag and drop event mapping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileAdd(e.dataTransfer.files);
  };

  const handleRemove = (fileId: string) => {
    // Clear any timers for this specific file id
    if (timersRef.current.timeouts[fileId]) {
      clearTimeout(timersRef.current.timeouts[fileId]);
      delete timersRef.current.timeouts[fileId];
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleCancel = (fileId: string) => {
    // Cancel action stops upload and flags error
    if (timersRef.current.timeouts[fileId]) {
      clearTimeout(timersRef.current.timeouts[fileId]);
      delete timersRef.current.timeouts[fileId];
    }
    setFiles((prev) => 
      prev.map((f) => f.id === fileId ? { ...f, status: "error", errorMsg: "Upload cancelled by user." } : f)
    );
  };

  const handleRetry = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    
    // Clear any timer references and re-run
    if (timersRef.current.timeouts[fileId]) {
      clearTimeout(timersRef.current.timeouts[fileId]);
      delete timersRef.current.timeouts[fileId];
    }
    
    startFileSimulation(fileId, file.name, file.size);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDownDropzone = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  const getFileIcon = (extension: string) => {
    const extLower = extension.toLowerCase();
    if (extLower === ".pdf") return <FileText className="h-5 w-5 text-critical shrink-0" />;
    if ([".csv", ".xlsx", ".xls"].includes(extLower)) return <FileSpreadsheet className="h-5 w-5 text-positive shrink-0" />;
    return <File className="h-5 w-5 text-foreground-muted shrink-0" />;
  };

  const renderFileCard = (file: UploadedFile) => {
    return (
      <div 
        key={file.id} 
        className="p-4 rounded-sm border border-border bg-surface-elevated/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* File extension Icon */}
          {getFileIcon(file.extension)}

          {/* File Metadata & Progress details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-foreground truncate block">
                {file.name}
              </span>
              <span className="text-[10px] text-foreground-muted shrink-0 font-mono">
                {file.formattedSize}
              </span>
            </div>
            
            {/* Show progress bar under uploading state */}
            {file.status === "uploading" && (
              <div className="space-y-1">
                <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-150" 
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-foreground-secondary">
                  <span>Uploading files...</span>
                  <span>{file.progress}%</span>
                </div>
              </div>
            )}

            {/* Show validation pulsing state */}
            {file.status === "validating" && (
              <div className="flex items-center gap-1.5 text-[10px] text-ai font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ai"></span>
                </span>
                <span>Validating statement ledger columns...</span>
              </div>
            )}

            {/* Validation warning message */}
            {file.status === "warning" && file.warningMsg && (
              <p className="text-[10px] text-warning font-sans leading-tight mt-0.5">
                {file.warningMsg}
              </p>
            )}

            {/* Validation error message */}
            {file.status === "error" && file.errorMsg && (
              <p className="text-[10px] text-critical font-sans leading-tight mt-0.5">
                {file.errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Status badges and Actions */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {/* 1. Status Indicator Badge */}
          {file.status === "valid" && (
            <span className="flex items-center gap-1.5 bg-positive/10 text-positive border border-positive/20 text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
            </span>
          )}

          {file.status === "warning" && (
            <span className="flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/20 text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs">
              <AlertTriangle className="h-3.5 w-3.5" /> Warning
            </span>
          )}

          {file.status === "error" && (
            <span className="flex items-center gap-1.5 bg-critical/10 text-critical border border-critical/20 text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs">
              <XCircle className="h-3.5 w-3.5" /> Error
            </span>
          )}

          {/* 2. Interactive Action Buttons */}
          <div className="flex items-center gap-1 border-l border-border/80 pl-2">
            {/* Cancel Button during active ingestion */}
            {(file.status === "uploading" || file.status === "validating") && (
              <button
                onClick={() => handleCancel(file.id)}
                className="text-foreground-secondary hover:text-foreground p-1 rounded-sm hover:bg-surface-hover transition-colors cursor-pointer"
                title="Cancel upload"
                aria-label="Cancel upload"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Retry Button for failed uploads */}
            {file.status === "error" && (
              <button
                onClick={() => handleRetry(file.id)}
                className="text-foreground-secondary hover:text-primary p-1 rounded-sm hover:bg-surface-hover transition-colors cursor-pointer"
                title="Retry upload"
                aria-label="Retry upload"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            )}

            {/* Remove Button for completed states */}
            {["valid", "warning", "error"].includes(file.status) && (
              <button
                onClick={() => handleRemove(file.id)}
                className="text-foreground-secondary hover:text-critical p-1 rounded-sm hover:bg-surface-hover transition-colors cursor-pointer"
                title="Remove file"
                aria-label="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleValidateAndAnalyze = () => {
    setIsSubmitting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Ingesting validated ledger tables to AI models...",
        success: () => {
          setIsSubmitting(false);
          // Redirecting to customer dashboard workspace
          router.push("/dashboard");
          return "Ledger ingestion completed successfully. Redirecting to Command Center.";
        },
        error: "Failed to deploy model."
      }
    );
  };

  // Enable analysis if we have at least one file, all completed, and zero error files
  const canSubmit = useMemo(() => {
    if (files.length === 0) return false;
    const hasPending = files.some((f) => f.status === "uploading" || f.status === "validating" || f.status === "waiting");
    const hasErrors = files.some((f) => f.status === "error");
    const hasValidOrWarning = files.some((f) => f.status === "valid" || f.status === "warning");
    
    return !hasPending && !hasErrors && hasValidOrWarning;
  }, [files]);

  // Selected sources lists text
  const sourcesText = useMemo(() => {
    if (selectedSources.length === 0) return "General Statements";
    return selectedSources.map((id) => sourceNameMap[id] || id).join(", ");
  }, [selectedSources]);

  return (
    <div className="space-y-8 flex flex-col justify-between h-full min-h-0">
      
      {/* Title Header */}
      <div className="space-y-2.5">
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground tracking-tight">
          Upload your financial statements.
        </h1>
        <p className="text-xs text-foreground-secondary font-sans leading-relaxed">
          Ingesting: <span className="font-semibold text-primary">{sourcesText}</span>. 
          Upload statements to run data parsers and alignment validations.
        </p>
      </div>

      {/* Main drag drop layout */}
      <div className="space-y-5 flex-1 min-h-0">
        {/* Dropzone area */}
        <div
          ref={dropzoneRef}
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDownDropzone}
          onClick={handleBrowseClick}
          className={cn(
            "border-2 border-dashed rounded-sm p-6 sm:p-10 text-center flex flex-col items-center justify-center gap-3 transition-all outline-none cursor-pointer select-none",
            isDragging 
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md shadow-primary/10" 
              : "border-border hover:border-border-strong bg-surface hover:bg-surface-elevated/20",
            "focus-visible:outline-2 focus-visible:outline-offset-2"
          )}
          role="button"
          aria-label="Upload drag drop zone. Press space or enter to browse files."
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileAdd(e.target.files)}
            className="hidden"
            multiple
            accept=".pdf,.csv,.xlsx,.xls"
          />
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-xs">
            <UploadIcon className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">
            Drop Financial Data Here
          </h3>
          <p className="text-xs text-foreground-muted">
            Drag and drop statement files, or click to <span className="text-primary font-semibold hover:underline">Browse Files</span>
          </p>
          <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider bg-background border border-border px-2 py-0.5 rounded-xs mt-1">
            CSV, Excel, PDF (Max 10MB)
          </span>
        </div>

        {/* Uploaded Files list */}
        {files.length > 0 && (
          <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
            {files.map((file) => renderFileCard(file))}
          </div>
        )}
      </div>

      {/* Trust privacy badge panel */}
      <div className="p-4 rounded-sm border border-border bg-surface-elevated/40 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
        <div className="h-9 w-9 rounded-sm border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-foreground font-heading">Your Data, Your Control.</h4>
          <p className="text-[11px] text-foreground-secondary leading-relaxed">
            Uploads are analyzed solely to compute diagnostic indicators. Key credentials and personal identifiers are scrubbed at ingestion. You maintain complete control to delete statements and connections at any time in Settings.
          </p>
        </div>
      </div>

      {/* Bottom Nav Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border/80 shrink-0">
        <Button
          variant="outline"
          onClick={() => router.push("/onboarding/data-source")}
          disabled={isSubmitting}
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleValidateAndAnalyze}
          disabled={!canSubmit || isSubmitting}
          loading={isSubmitting}
          className="gap-2 cursor-pointer font-sans font-bold"
        >
          Validate & Analyze
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
