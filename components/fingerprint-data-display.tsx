"use client";

import { EnhancedFingerprintProData } from "@/types";
import { AlertTriangle, Copy, Search } from "lucide-react";
import { useState } from "react";
import { 
  getFieldsByGroup, 
  getAllGroups, 
  FieldGroup,
  FIELD_MAPPINGS
} from "@/lib/field-mappings";
import { 
  filterAndSearchFields, 
  safeRender, 
  getCopyText,
  calculateRiskScore,
  getRiskLevelColor,
  getRiskLevelLabel
} from "@/lib/field-utils";

interface FingerprintDataDisplayProps {
  data: EnhancedFingerprintProData;
}

export function FingerprintDataDisplay({ data }: FingerprintDataDisplayProps) {
  const { clientData, serverData, isLoading, hasServerData } = data;
  const [selectedGroup, setSelectedGroup] = useState<FieldGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (clientData?.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Fingerprint Pro 数据获取失败</h3>
        </div>
        <p className="text-red-600 dark:text-red-400 mt-2">{clientData.error.message}</p>
      </div>
    );
  }

  if (!clientData?.result) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">等待 Fingerprint Pro 数据...</h3>
        </div>
      </div>
    );
  }

  // 合并客户端和服务端数据
  const combinedData = {
    ...clientData.result,
    ...serverData?.currentVisit,
  };

  // 计算风险评分
  const riskAssessment = calculateRiskScore(combinedData);

  // 复制到剪贴板
  const handleCopy = async (fieldKey: string, value: unknown) => {
    const copyText = getCopyText(value);
    
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 获取要显示的字段
  const allGroups = getAllGroups();
  const fieldsToShow = selectedGroup === 'all' 
    ? Object.keys(FIELD_MAPPINGS)
    : getFieldsByGroup(selectedGroup).map(f => f.key);

  // 过滤和搜索字段
  const filteredFields = filterAndSearchFields(combinedData, fieldsToShow, searchQuery);

  // 按组分类字段
  const fieldsByGroup = allGroups.reduce((acc, group) => {
    acc[group] = filteredFields.filter(({ field }) => field?.group === group);
    return acc;
  }, {} as Record<FieldGroup, typeof filteredFields>);

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* 风险评估 */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(riskAssessment.level)}`}>
              {getRiskLevelLabel(riskAssessment.level)} ({riskAssessment.score}/100)
            </div>
            {hasServerData && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                增强检测
              </span>
            )}
          </div>

          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索字段..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 分组过滤器 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selectedGroup === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {allGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedGroup === group
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* 字段显示区域 */}
      {selectedGroup === 'all' ? (
        // 显示所有分组
        allGroups.map((group) => {
          const groupFields = fieldsByGroup[group];
          if (groupFields.length === 0) return null;

          const GroupIcon = groupFields[0]?.field?.icon;

          return (
            <div key={group} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                {GroupIcon && <GroupIcon className="h-5 w-5 text-blue-500" />}
                <h3 className="text-lg font-semibold">{group}</h3>
                <span className="text-sm text-gray-500">({groupFields.length})</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupFields.map(({ field, rawValue }) => {
                  if (!field) return null;
                  
                  const FieldIcon = field.icon;
                  
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {FieldIcon && <FieldIcon className="h-3 w-3" />}
                          {field.label}
                          {field.critical && <span className="text-red-500 text-xs">*</span>}
                        </label>
                        {field.copyable && rawValue != null && (
                          <button
                            onClick={() => handleCopy(field.key, rawValue)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="复制"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedField === field.key && (
                              <span className="absolute bg-black text-white text-xs px-2 py-1 rounded mt-1 ml-2">
                                已复制
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                      <div className={`${field.valueType === 'string' && typeof rawValue === 'string' && rawValue.length > 30 ? 'font-mono text-xs break-all' : ''}`}>
                        {safeRender(rawValue, field)}
                      </div>
                      {field.description && (
                        <p className="text-xs text-gray-400">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        // 显示单个分组
        (() => {
          const groupFields = fieldsByGroup[selectedGroup];
          if (groupFields.length === 0) {
            return (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center text-gray-500">
                未找到匹配的字段
              </div>
            );
          }

          const GroupIcon = groupFields[0]?.field?.icon;

          return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                {GroupIcon && <GroupIcon className="h-5 w-5 text-blue-500" />}
                <h3 className="text-lg font-semibold">{selectedGroup}</h3>
                <span className="text-sm text-gray-500">({groupFields.length})</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupFields.map(({ field, rawValue }) => {
                  if (!field) return null;
                  
                  const FieldIcon = field.icon;
                  
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {FieldIcon && <FieldIcon className="h-3 w-3" />}
                          {field.label}
                          {field.critical && <span className="text-red-500 text-xs">*</span>}
                        </label>
                        {field.copyable && rawValue != null && (
                          <button
                            onClick={() => handleCopy(field.key, rawValue)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="复制"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedField === field.key && (
                              <span className="absolute bg-black text-white text-xs px-2 py-1 rounded mt-1 ml-2">
                                已复制
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                      <div className={`${field.valueType === 'string' && typeof rawValue === 'string' && rawValue.length > 30 ? 'font-mono text-xs break-all' : ''}`}>
                        {safeRender(rawValue, field)}
                      </div>
                      {field.description && (
                        <p className="text-xs text-gray-400">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {/* 风险因素详情 */}
      {riskAssessment.factors.filter(f => f.triggered).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            风险因素
          </h3>
          <div className="space-y-2">
            {riskAssessment.factors
              .filter(factor => factor.triggered)
              .map((factor) => (
                <div key={factor.key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">{factor.label}</span>
                  <span className="text-sm text-red-600 font-medium">+{factor.weight}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}