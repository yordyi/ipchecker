"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  glowColor?: "blue" | "purple" | "green" | "red" | "yellow";
}

export function ModernCard({ 
  title, 
  icon, 
  children, 
  className = "",
  gradient = false,
  glowColor = "blue"
}: ModernCardProps) {
  const glowColors = {
    blue: "rgba(59, 130, 246, 0.5)",
    purple: "rgba(147, 51, 234, 0.5)",
    green: "rgba(34, 197, 94, 0.5)",
    red: "rgba(239, 68, 68, 0.5)",
    yellow: "rgba(234, 179, 8, 0.5)"
  };

  return (
    <div 
      className={cn(
        "relative group",
        "glass-effect rounded-2xl p-6",
        "transition-all duration-300",
        "hover:transform hover:-translate-y-1",
        gradient && "gradient-border",
        className
      )}
      style={{
        boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 40px -8px ${glowColors[glowColor || "blue"]}`
      }}
    >
      {/* 悬浮时的光效 */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColors[glowColor || "blue"]}, transparent 40%)`
        }}
      />
      
      {/* 卡片头部 */}
      {(title || icon) && (
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="icon-wrapper">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                {title}
              </h3>
            )}
          </div>
        </div>
      )}
      
      {/* 卡片内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// 信息项组件
interface InfoItemProps {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  status?: "success" | "warning" | "danger" | "info";
}

export function InfoItem({ label, value, icon, status }: InfoItemProps) {
  const statusColors = {
    success: "text-green-400",
    warning: "text-yellow-400", 
    danger: "text-red-400",
    info: "text-blue-400"
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={cn(
        "text-sm font-medium",
        status ? statusColors[status] : "text-gray-200"
      )}>
        {value}
      </div>
    </div>
  );
}

// 统计卡片组件
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatCard({ label, value, icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="glass-effect rounded-xl p-4 hover-card">
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div className="p-2 rounded-lg bg-white/5">
            {icon}
          </div>
        )}
        {trend && trendValue && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}