"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse"
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "loading-pulse",
    none: ""
  };

  return (
    <div
      className={cn(
        "bg-white/10",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || "100%",
        height: height || (variant === "text" ? "1rem" : "100%")
      }}
    />
  );
}

// 卡片骨架屏
export function CardSkeleton() {
  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="60%" height={20} />
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

// IP显示骨架屏
export function IPDisplaySkeleton() {
  return (
    <div className="text-center">
      <Skeleton variant="text" width={100} height={16} className="mx-auto mb-4" />
      <Skeleton variant="text" width={300} height={48} className="mx-auto mb-4" />
      <div className="flex items-center justify-center gap-2">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={200} height={20} />
      </div>
    </div>
  );
}

// 统计卡片骨架屏
export function StatCardSkeleton() {
  return (
    <div className="glass-effect rounded-xl p-4">
      <Skeleton variant="circular" width={32} height={32} className="mb-3" />
      <Skeleton variant="text" width="60%" height={28} className="mb-2" />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="40%" />
        </div>
      ))}
    </div>
  );
}