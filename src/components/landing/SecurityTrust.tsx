"use client";

import React from "react";
import { 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  ScrollText, 
  Lock, 
  Activity,
  ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export function SecurityTrust() {
  const securityFeatures = [
    {
      title: "Bank-Grade Encryption",
      desc: "All ingestion pipelines and ledger credentials are encrypted using AES-256 standards in transit and at rest.",
      icon: Lock,
    },
    {
      title: "Role-Based Access Control",
      desc: "Granular IAM permissions separating borrower customers, lending loan officers, and server platform admins.",
      icon: ShieldCheck,
    },
    {
      title: "Explainable Risk Audits",
      desc: "Full attribution logging ensures every ML decision can be traced to verifiable inputs (SHAP frameworks).",
      icon: Eye,
    },
    {
      title: "Immutable Access Trails",
      desc: "Cryptographically chained audit logs trace user actions, API updates, and database modifications.",
      icon: ScrollText,
    },
    {
      title: "Privacy-Aware Ingests",
      desc: "PII masking engines filter personal identifiers before datasets are fed to AI threat classifiers.",
      icon: KeyRound,
    },
    {
      title: "Continuous MLOps Monitoring",
      desc: "Real-time concept and feature drift detection isolates validation warning drops immediately.",
      icon: Activity,
    },
  ];

  return (
    <section id="security" className="py-24 bg-background select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full uppercase mb-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            Compliance & Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
            Enterprise Security & Trust
          </h2>
          <p className="text-sm sm:text-base text-foreground-secondary font-sans leading-relaxed">
            Engineered to conform with modern financial compliance guidelines, protecting data assets and model integrity.
          </p>
        </div>

        {/* Security Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="group hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-surface-elevated/25 border-border/60">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-10 w-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 font-sans text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                  {feat.desc}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default SecurityTrust;
