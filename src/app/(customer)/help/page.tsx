"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  Mail,
  Server
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
  category: "Model Risk" | "Data Sync" | "Reports" | "General";
}

const FAQS_DATABASE: FAQItem[] = [
  {
    q: "How does the SHAP Waterfall illustrate Default Risk?",
    a: "The SHAP waterfall chart begins at a model baseline risk (averaging 32%) and lists positive attributions (e.g. +24% for DTI) and negative protective factors (e.g. -8% for account longevity) sequentially, summing up to the final default probability rating.",
    category: "Model Risk"
  },
  {
    q: "Why is HDFC Credit Card Sync delayed?",
    a: "Banking credentials refresh tokens expire every 90 days. Please head to settings or data connections, click 'Sync Handshake', and complete the secure multi-factor confirmation.",
    category: "Data Sync"
  },
  {
    q: "Can I download visual reports in other formats?",
    a: "Yes. Clicking the PDF compilation format selector inside the Reports Center allows you to toggle options for compiled CSV bank statements or raw JSON metadata bundles.",
    category: "Reports"
  },
  {
    q: "Is there a latency in cash flow forecast actuals updates?",
    a: "Ingested statement feeds are reconciled every 24 hours. Click the manual Sync triggers inside Data connections center to trigger immediate ledger balances updates.",
    category: "Data Sync"
  }
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Contact support form
  const [supportMsg, setSupportMsg] = useState("");

  const filteredFaqs = useMemo(() => {
    return FAQS_DATABASE.filter((f) => {
      const matchSearch = f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "All" || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, selectedCategory]);

  const handleSendSupport = () => {
    if (!supportMsg.trim()) {
      toast.error("Please enter a message request.");
      return;
    }
    toast.success("Support ticket created. Compliance officers will notify you shortly.");
    setSupportMsg("");
  };

  return (
    <PageContainer className="pb-24 text-xs select-none">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3.5 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="h-6.5 w-6.5 text-primary" /> System Help & Troubleshooting
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Search developer manuals, credit documentation, system statuses, or query support officers.
          </p>
        </div>
      </div>

      {/* CORE SPLIT WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* FAQS & GUIDES LIST (LEFT - 8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border p-5 space-y-4.5">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-border/40 pb-3 gap-3">
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">
                Troubleshooting Guides
              </span>

              {/* Filters categories */}
              <div className="flex gap-1.5 flex-wrap">
                {["All", "Model Risk", "Data Sync", "Reports"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-xs text-[9.5px] uppercase font-sans font-bold transition-all cursor-pointer",
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search FAQ */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-foreground-muted">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search troubleshooting questions, topics, error descriptors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-elevated/45 border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
              />
            </div>

            {/* List FAQS */}
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="text-center border border-border border-dashed p-6 rounded-sm bg-surface">
                  <HelpCircle className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-foreground">No matches found</h3>
                  <p className="text-[10px] text-foreground-secondary mt-1">Try other search keywords.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1.5 border-b border-border/30 pb-3.5 last:border-0 last:pb-0">
                    <span className="text-[8px] font-sans font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h4 className="font-bold text-foreground text-xs">{faq.q}</h4>
                    <p className="text-foreground-secondary font-sans leading-relaxed text-[11px]">{faq.a}</p>
                  </div>
                ))
              )}
            </div>

          </Card>
        </div>

        {/* SYSTEM STATUS & CONTACT SUPPORT (RIGHT - 4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status logs */}
          <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3.5">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              System Service Status
            </span>

            <div className="space-y-2.5 font-sans">
              {[
                { name: "Risk Inference Pipeline", status: "Healthy" },
                { name: "Fraud Attributions Engine", status: "Healthy" },
                { name: "Connected Ledger Sync APIs", status: "Healthy" }
              ].map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-foreground-secondary" />
                    <span className="font-semibold text-foreground-secondary">{s.name}</span>
                  </div>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.25 rounded-xs uppercase text-positive bg-positive/10 border border-positive/15">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact support */}
          <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3.5">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              Query Support Officer
            </span>

            <div className="space-y-3">
              <textarea
                placeholder="Describe sync failures, validation errors, compliance requests..."
                rows={3}
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                className="w-full bg-surface-elevated/45 border border-border rounded-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted resize-none"
              />

              <Button
                onClick={handleSendSupport}
                className="w-full text-[10px] uppercase font-sans font-bold gap-1.5 cursor-pointer"
              >
                <Mail className="h-4 w-4" /> Submit Support Request
              </Button>
            </div>
          </div>

        </div>

      </div>

    </PageContainer>
  );
}
