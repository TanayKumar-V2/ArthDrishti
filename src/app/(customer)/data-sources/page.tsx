"use client";

import React, { useState, useCallback } from "react";
import {
  Database,
  Upload,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DataConnection {
  id: string;
  name: string;
  type: string;
  status: "Synced" | "Delayed" | "Disconnected";
  lastSync: string;
}

export default function DataSourcesPage() {
  // Connections list state
  const [connections, setConnections] = useState<DataConnection[]>([
    { id: "ds1", name: "ICICI Checking Account Ledger", type: "Bank Statement API", status: "Synced", lastSync: "10 mins ago" },
    { id: "ds2", name: "HDFC Premium Card Statements", type: "Credit API Feed", status: "Delayed", lastSync: "Yesterday" },
    { id: "ds3", name: "Razorpay Business Merchant Gateway", type: "API Webhook", status: "Synced", lastSync: "1 hour ago" }
  ]);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync actions
  const handleSyncSource = useCallback((id: string, name: string) => {
    toast.info(`Triggering handshake sync with "${name}"...`);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Synced", lastSync: "Just Now" } : c))
      );
      toast.success(`Synced successfully: "${name}"`);
    }, 800);
  }, []);

  const handleRemoveSource = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    toast.success("Disconnected data source.");
  }, []);

  // Upload file mock handler
  const handleUploadFile = useCallback(() => {
    if (!selectedFile) {
      toast.error("Please drag or select a ledger statement file to upload.");
      return;
    }
    setUploading(true);
    toast.info(`Ingesting document: "${selectedFile.name}"...`);

    setTimeout(() => {
      setUploading(false);
      const newSource: DataConnection = {
        id: `ds_${Date.now()}`,
        name: selectedFile.name,
        type: selectedFile.name.endsWith(".csv") ? "CSV Ledger Upload" : "PDF Statement Upload",
        status: "Synced",
        lastSync: "Just Now"
      };
      setConnections((prev) => [...prev, newSource]);
      setSelectedFile(null);
      toast.success(`Successfully ingested statement data from "${selectedFile.name}" into credit model.`);
    }, 1500);
  }, [selectedFile]);

  return (
    <PageContainer className="pb-24 text-xs select-none">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3.5 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Database className="h-6.5 w-6.5 text-primary" /> Data Connections Center
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Integrate bank ledgers, statements files, and credit APIs to feed the AI diagnostics models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* ACTIVE CONNECTIONS LIST (LEFT - 7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-border p-5 space-y-4.5">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              Active ledger connections ({connections.length})
            </span>

            {connections.length === 0 ? (
              <div className="text-center border border-border border-dashed p-8 rounded-sm bg-surface">
                <Database className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                <h3 className="text-xs font-bold text-foreground">No active connections</h3>
                <p className="text-[10px] text-foreground-secondary mt-1">Upload a financial statement document on the right to sync accounts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-elevated/40 border border-border p-4 rounded-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">
                        {c.type}
                      </span>
                      <h4 className="font-bold text-foreground">
                        {c.name}
                      </h4>
                      <span className="text-[9.5px] font-mono text-foreground-muted block">
                        Last sync handshake: {c.lastSync}
                      </span>
                    </div>

                    <div className="flex gap-2.5 items-center">
                      <span className={cn(
                        "text-[8px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider border",
                        c.status === "Synced"
                          ? "text-positive bg-positive/10 border-positive/15"
                          : "text-warning bg-warning/10 border-warning/15"
                      )}>
                        {c.status}
                      </span>

                      <button
                        onClick={() => handleSyncSource(c.id, c.name)}
                        className="p-1.5 rounded-xs border border-border hover:bg-surface-hover text-foreground-secondary cursor-pointer"
                        title="Sync Handshake"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveSource(c.id)}
                        className="p-1.5 rounded-xs border border-border hover:bg-critical/5 hover:text-critical text-foreground-secondary cursor-pointer"
                        title="Remove Connection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </Card>
        </div>

        {/* UPLOAD STATEMENTS ZONE (RIGHT - 5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border p-5 space-y-4">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              Upload bank statements ledger file
            </span>

            {/* Dropzone mock */}
            <div className="border border-dashed border-border/80 rounded-sm p-6 text-center bg-surface-elevated/25 relative hover:bg-surface-elevated/40 transition-colors">
              <input
                type="file"
                accept=".pdf,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <span className="font-bold text-foreground block">
                {selectedFile ? selectedFile.name : "Select Ledger File"}
              </span>
              <span className="text-[10px] text-foreground-secondary block mt-1">
                Drag and drop or click to choose PDF bank statements or CSV logs
              </span>
            </div>

            {selectedFile && (
              <div className="bg-surface border border-border p-3.5 rounded-xs flex justify-between items-center text-xs font-mono select-none">
                <span className="text-foreground truncate max-w-[200px]">{selectedFile.name}</span>
                <span className="text-foreground-muted font-bold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            <Button
              onClick={handleUploadFile}
              disabled={uploading || !selectedFile}
              className="w-full text-[10px] uppercase font-sans font-extrabold gap-1.5 cursor-pointer py-2.5"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Ingesting file...
                </>
              ) : (
                <>
                  <Upload className="h-4.5 w-4.5" /> Upload & Parse Document
                </>
              )}
            </Button>

          </Card>
        </div>

      </div>

    </PageContainer>
  );
}
