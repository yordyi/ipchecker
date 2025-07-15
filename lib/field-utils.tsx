/**
 * Fingerprint Pro 字段处理工具函数
 * 提供安全的字段值获取、格式化和渲染功能
 */

import React from 'react';
import { FieldConfig, getFieldConfig, FIELD_MAPPINGS } from './field-mappings';

/** 格式化器类型 */
export type FormatterFunction = (value: unknown, field?: FieldConfig) => string;

/** 内置格式化器映射 */
const FORMATTERS: Record<string, FormatterFunction> = {
  formatBoolean: (value: unknown) => Boolean(value) ? '是' : '否',
  formatRiskBoolean: (value: unknown) => Boolean(value) ? '⚠️ 检测到' : '✅ 未检测到',
  formatConfidence: (value: unknown) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '-';
    if (numValue >= 0.9) return `极高 (${(numValue * 100).toFixed(1)}%)`;
    if (numValue >= 0.8) return `高 (${(numValue * 100).toFixed(1)}%)`;
    if (numValue >= 0.6) return `中等 (${(numValue * 100).toFixed(1)}%)`;
    if (numValue >= 0.4) return `较低 (${(numValue * 100).toFixed(1)}%)`;
    return `低 (${(numValue * 100).toFixed(1)}%)`;
  },
  formatScore: (value: unknown) => `${Number(value) || 0}/100`,
  formatNumber: (value: unknown) => Number(value).toLocaleString(),
  formatCoordinate: (value: unknown) => Number(value).toFixed(6),
  formatDistance: (value: unknown) => `${Number(value)} km`,
  formatTimestamp: (value: unknown) => {
    if (!value) return '未知';
    const strValue = String(value);
    
    try {
      const date = new Date(strValue);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays}天前`;
      } else if (diffHours > 0) {
        return `${diffHours}小时前`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分钟前`;
      } else {
        return '刚刚';
      }
    } catch {
      return '无效时间';
    }
  },
  formatObject: (value: unknown) => {
    if (!value || typeof value !== 'object') return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  },
};

/**
 * 安全获取嵌套对象的值
 * @param obj 源对象
 * @param path 路径字符串，如 'ipLocation.country.name'
 * @returns 字段值或 undefined
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current;
}

/**
 * 检查值是否为空
 * @param value 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 格式化字段值
 * @param value 原始值
 * @param field 字段配置
 * @returns 格式化后的字符串
 */
export function formatFieldValue(value: unknown, field?: FieldConfig): string {
  if (isEmpty(value)) {
    return field?.hideEmpty ? '' : '-';
  }

  // 使用自定义格式化器
  if (field?.formatter && FORMATTERS[field.formatter]) {
    try {
      return FORMATTERS[field.formatter](value, field);
    } catch (error) {
      console.warn(`Formatter error for field ${field.key}:`, error);
    }
  }

  // 根据值类型进行默认格式化
  if (typeof value === 'boolean') {
    return FORMATTERS.formatBoolean(value);
  }
  
  if (typeof value === 'number') {
    return FORMATTERS.formatNumber(value);
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    return FORMATTERS.formatObject(value);
  }
  
  return String(value);
}

/**
 * 获取格式化的字段信息
 * @param data 数据对象
 * @param fieldKey 字段键
 * @returns 字段信息对象
 */
export function getFormattedField(data: unknown, fieldKey: string) {
  const field = getFieldConfig(fieldKey);
  const rawValue = getNestedValue(data, fieldKey);
  const formattedValue = formatFieldValue(rawValue, field);
  const shouldShow = !field?.hideEmpty || !isEmpty(rawValue);

  return {
    field,
    rawValue,
    formattedValue,
    shouldShow,
    isEmpty: isEmpty(rawValue),
  };
}

/**
 * 获取多个字段的格式化信息
 * @param data 数据对象
 * @param fieldKeys 字段键数组
 * @returns 字段信息数组
 */
export function getFormattedFields(data: unknown, fieldKeys: string[]) {
  return fieldKeys
    .map(key => getFormattedField(data, key))
    .filter(item => item.shouldShow);
}

/**
 * 安全渲染字段值（用于 React 组件）
 * @param value 字段值
 * @param field 字段配置
 * @returns 安全的渲染值
 */
export function safeRender(value: unknown, field?: FieldConfig): React.ReactNode {
  const formatted = formatFieldValue(value, field);
  
  if (!formatted || formatted === '-') {
    return <span className="text-muted-foreground">-</span>;
  }
  
  // 风险字段特殊样式
  if (field?.riskWeight && field.riskWeight > 0 && value === true) {
    return <span className="text-destructive font-medium">{formatted}</span>;
  }
  
  // 链接类型
  if (field?.valueType === 'url' && typeof value === 'string' && value.startsWith('http')) {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary hover:underline"
      >
        {formatted}
      </a>
    );
  }
  
  return formatted;
}

/**
 * 计算综合风险评分
 * @param data 数据对象
 * @returns 风险评估结果
 */
export function calculateRiskScore(data: unknown): {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{ key: string; label: string; weight: number; triggered: boolean }>;
} {
  const factors: Array<{ key: string; label: string; weight: number; triggered: boolean }> = [];
  let totalScore = 0;

  // 遍历所有有风险权重的字段
  (Object.values(FIELD_MAPPINGS) as FieldConfig[]).forEach((field: FieldConfig) => {
    if (field.riskWeight && field.riskWeight > 0) {
      const value = getNestedValue(data, field.key);
      const triggered = value === true || (typeof value === 'number' && value > 50);
      
      factors.push({
        key: field.key,
        label: field.label,
        weight: field.riskWeight,
        triggered,
      });
      
      if (triggered) {
        totalScore += field.riskWeight;
      }
    }
  });

  // 添加 suspectScore 如果存在
  const suspectScore = getNestedValue(data, 'suspectScore');
  if (typeof suspectScore === 'number' && suspectScore > 0) {
    const additionalScore = Math.min(suspectScore / 2, 30);
    totalScore += additionalScore;
  }

  // 确定风险等级
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (totalScore >= 80) {
    level = 'critical';
  } else if (totalScore >= 50) {
    level = 'high';
  } else if (totalScore >= 20) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    score: Math.min(totalScore, 100),
    level,
    factors,
  };
}

/**
 * 获取风险等级对应的颜色类名
 * @param level 风险等级
 * @returns Tailwind CSS 类名
 */
export function getRiskLevelColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * 获取风险等级的中文描述
 * @param level 风险等级
 * @returns 中文描述
 */
export function getRiskLevelLabel(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'low':
      return '低风险';
    case 'medium':
      return '中等风险';
    case 'high':
      return '高风险';
    case 'critical':
      return '严重风险';
    default:
      return '未知';
  }
}

/**
 * 过滤和搜索字段
 * @param data 数据对象
 * @param fieldKeys 字段键数组
 * @param searchQuery 搜索查询
 * @returns 过滤后的字段信息数组
 */
export function filterAndSearchFields(data: unknown, fieldKeys: string[], searchQuery: string = '') {
  const fields = getFormattedFields(data, fieldKeys);
  
  if (!searchQuery.trim()) {
    return fields;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return fields.filter(({ field, formattedValue }) => {
    if (!field) return false;
    
    // 搜索字段标签、英文标签、描述或格式化后的值
    return (
      field.label.toLowerCase().includes(query) ||
      field.labelEn?.toLowerCase().includes(query) ||
      field.description?.toLowerCase().includes(query) ||
      formattedValue.toLowerCase().includes(query)
    );
  });
}

/**
 * 注册自定义格式化器
 * @param name 格式化器名称
 * @param formatter 格式化函数
 */
export function registerFormatter(name: string, formatter: FormatterFunction): void {
  FORMATTERS[name] = formatter;
}

/**
 * 获取字段的复制文本
 * @param value 字段值
 * @param field 字段配置
 * @returns 复制用的文本
 */
export function getCopyText(value: unknown): string {
  if (isEmpty(value)) return '';
  
  // 对于对象类型，返回 JSON 字符串
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}