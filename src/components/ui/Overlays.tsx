"use client";

import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { modalTransition, fadeIn } from "@/lib/animations";

// ==========================================
// TABS
// ==========================================

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChangeTab: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChangeTab, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-border/60 overflow-x-auto scrollbar-none", className)}>
      <div className="flex space-x-6 min-w-full sm:min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={cn(
                "relative pb-4 text-sm font-sans font-medium transition-colors select-none cursor-pointer flex items-center gap-2",
                isActive ? "text-primary" : "text-foreground-secondary hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MODAL (DIALOG)
// ==========================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Content Wrapper */}
          <motion.div
            variants={modalTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative w-full max-w-lg bg-surface border border-border rounded-md shadow-xl z-10 overflow-hidden flex flex-col",
              className
            )}
          >
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              {title ? (
                <h3 className="font-heading font-semibold text-lg text-foreground">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="text-foreground-secondary hover:text-foreground p-1 rounded-sm hover:bg-surface-hover transition-colors focus-visible:outline-2"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh] font-sans text-sm text-foreground-secondary">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// SHEET (SLIDEOUT PANEL - DRAWER STYLE)
// ==========================================

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "right" | "left";
}

export function Sheet({ isOpen, onClose, title, children, className, side = "right" }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const slideVariants: Variants = {
    hidden: { x: side === "right" ? "100%" : "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: { x: side === "right" ? "100%" : "-100%", transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  };

  const borderClass = side === "right" ? "border-l" : "border-r";
  const positionClass = side === "right" ? "right-0" : "left-0";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed top-0 bottom-0 w-full max-w-md bg-surface z-10 shadow-2xl flex flex-col overflow-hidden",
              borderClass,
              positionClass,
              className
            )}
          >
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              {title ? (
                <h3 className="font-heading font-semibold text-lg text-foreground">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="text-foreground-secondary hover:text-foreground p-1 rounded-sm hover:bg-surface-hover transition-colors focus-visible:outline-2"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto font-sans text-sm">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// TOOLTIP (ACCESSIBLE HOVER ELEMENT)
// ==========================================

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs bg-surface-elevated border border-border text-foreground text-xs font-sans py-1.5 px-3 rounded-sm shadow-md pointer-events-none select-none",
              className
            )}
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-strong opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// POPOVER
// ==========================================

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Popover({ trigger, children, className }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-2 z-50 w-64 bg-surface-elevated border border-border rounded-sm shadow-lg p-4 font-sans text-sm text-foreground-secondary",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// DROPDOWN MENU
// ==========================================

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  destructive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, className, align = "right" }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const alignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute mt-2 z-50 w-48 bg-surface-elevated border border-border rounded-sm shadow-lg py-1 flex flex-col",
              alignClass,
              className
            )}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm font-sans font-medium text-left transition-colors select-none cursor-pointer",
                    item.destructive 
                      ? "text-critical hover:bg-critical/10" 
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
