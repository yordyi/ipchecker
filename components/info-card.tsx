"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getFieldConfig } from "@/lib/field-mappings";
import { getCopyText, safeRender, getFormattedField } from "@/lib/field-utils";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface InfoItemProps {
  label: string;
  value: string | number | null | undefined | React.ReactNode;
  copyable?: boolean;
  className?: string;
  fieldKey?: string;
  rawValue?: unknown;
}

interface SmartInfoItemProps {
  fieldKey: string;
  data: unknown;
  className?: string;
}

export function InfoCard({ title, children, className }: InfoCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700",
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

export function InfoItem({ label, value, copyable = false, className, fieldKey, rawValue }: InfoItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!rawValue && !value) return;
    
    try {
      // 如果有字段配置，使用增强的复制逻辑
      if (fieldKey) {
        const copyText = getCopyText(rawValue || value);
        await navigator.clipboard.writeText(copyText);
      } else {
        await navigator.clipboard.writeText(String(rawValue || value));
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
          {value}
        </span>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="复制"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-gray-500" />
          )}
        </button>
      )}
    </div>
  );
}

/**
 * 智能信息项组件，自动使用字段配置
 */
export function SmartInfoItem({ fieldKey, data, className }: SmartInfoItemProps) {
  const field = getFieldConfig(fieldKey);
  
  if (!field) {
    console.warn(`Field config not found for key: ${fieldKey}`);
    return null;
  }

  const { rawValue, shouldShow } = getFormattedField(data, fieldKey);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1">
          {field.icon && <field.icon className="h-3 w-3 text-gray-500" />}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {field.label}
            {field.critical && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
        <div className={cn(
          "text-sm font-medium text-gray-900 dark:text-gray-100",
          field.valueType === 'string' && String(rawValue).length > 30 && "font-mono text-xs break-all"
        )}>
          {safeRender(rawValue, field)}
        </div>
        {field.description && (
          <p className="text-xs text-gray-400 mt-1">{field.description}</p>
        )}
      </div>
      {field.copyable && rawValue != null && (
        <InfoItem
          label=""
          value=""
          copyable={true}
          fieldKey={fieldKey}
          rawValue={rawValue}
          className="flex-shrink-0 ml-2"
        />
      )}
    </div>
  );
}