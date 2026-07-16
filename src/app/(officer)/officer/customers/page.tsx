"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface CustomerRecord {
  id: string;
  name: string;
  avatar: string;
  email: string;
  company: string;
  creditScore: number;
  dti: number;
  activeLimit: number;
  outstandingBalance: number;
  status: "Active" | "Delinquent" | "Closed";
  lastAuditDate: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  { id: "c1", name: "Rahul Chahar", avatar: "RC", email: "rahul.chahar@corporation.com", company: "ArthDrishti Labs", creditScore: 785, dti: 22, activeLimit: 1500000, outstandingBalance: 420000, status: "Active", lastAuditDate: "2026-06-15" },
  { id: "c2", name: "Amit Sharma", avatar: "AS", email: "amit.sharma@gmail.com", company: "Sharma Logistics", creditScore: 589, dti: 57, activeLimit: 2500000, outstandingBalance: 1800000, status: "Delinquent", lastAuditDate: "2026-06-28" },
  { id: "c3", name: "Priyanka Roy", avatar: "PR", email: "priyanka.roy@outlook.com", company: "Roy Enterprises", creditScore: 812, dti: 12, activeLimit: 3000000, outstandingBalance: 120000, status: "Active", lastAuditDate: "2026-07-03" },
  { id: "c4", name: "Suresh Gupta", avatar: "SG", email: "suresh.gupta@guptas.in", company: "Gupta Traders", creditScore: 748, dti: 28, activeLimit: 1200000, outstandingBalance: 50000, status: "Active", lastAuditDate: "2026-07-09" }
];

export default function OfficerCustomersPage() {
  const [customers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && c.status === "Active") ||
        (statusFilter === "Delinquent" && c.status === "Delinquent");
      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleAuditCustomer = useCallback((name: string) => {
    toast.info(`Triggering compliance audit session for "${name}"...`);
  }, []);

  return (
    <PageContainer className="pb-24 text-xs">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3.5 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6.5 w-6.5 text-primary" /> Customer Directory & Compliance Ledger
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Audit existing commercial accounts, credit scores shifts, outstanding dues balances, and compliance indexes.
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="mt-6 flex flex-wrap gap-3 bg-surface-elevated/40 border border-border p-3.5 rounded-sm select-none items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-2.5 text-foreground-muted">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search customer name or enterprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
          />
        </div>

        <div className="relative w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
          >
            <option value="All">All Customer Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Delinquent">Delinquent Accounts</option>
          </select>
          <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2.5 text-foreground-muted pointer-events-none" />
        </div>
      </div>

      {/* CUSTOMERS TABLE CARD */}
      <Card className="border border-border/80 bg-surface p-5 select-none mt-6 overflow-x-auto">
        {filteredCustomers.length === 0 ? (
          <div className="text-center border border-border border-dashed p-10 rounded-sm bg-surface">
            <Users className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
            <h3 className="text-xs font-bold text-foreground">No customer records found</h3>
            <p className="text-[10px] text-foreground-secondary mt-1">Adjust search parameters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated/45 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border/40">
                  <th className="py-2.5 px-3">Customer Profile</th>
                  <th className="py-2.5 px-3">Enterprise Firm</th>
                  <th className="py-2.5 px-3 text-right">Bureau Score</th>
                  <th className="py-2.5 px-3 text-right">DTI Ratio</th>
                  <th className="py-2.5 px-3 text-right">Sanctioned Limit</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Bal</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Audited</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="border-b border-border/30 last:border-b-0 hover:bg-surface-elevated/15 font-sans">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7.5 w-7.5 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-extrabold text-[10px]">
                          {cust.avatar}
                        </div>
                        <div>
                          <span className="font-extrabold text-foreground block leading-tight">{cust.name}</span>
                          <span className="text-[9.5px] text-foreground-muted block">{cust.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground-secondary">
                      {cust.company}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {cust.creditScore}
                    </td>
                    <td className={cn(
                      "py-3 px-3 text-right font-mono font-bold",
                      cust.dti >= 40 ? "text-critical" : "text-foreground"
                    )}>
                      {cust.dti}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₹{cust.activeLimit.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground-secondary font-semibold">
                      ₹{cust.outstandingBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn(
                        "text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                        cust.status === "Active"
                          ? "text-positive bg-positive/10 border-positive/20"
                          : "text-critical bg-critical/10 border-critical/20 animate-pulse"
                      )}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-foreground-muted font-mono font-medium">
                      {cust.lastAuditDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleAuditCustomer(cust.name)}
                          className="text-[9px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-xs hover:bg-primary/95 cursor-pointer uppercase font-sans"
                        >
                          Audit Account
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </PageContainer>
  );
}
