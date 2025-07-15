"use client";

import { AlertTriangle, CheckCircle, Info, TrendingUp, Shield, Eye } from "lucide-react";

interface SummaryData {
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
  primaryConcerns: string[];
  recommendations: string[];
  visitCount: number;
  lastSeen: string;
  isNewVisitor: boolean;
  suspiciousActivities: string[];
}

interface SummaryCardProps {
  summaryData: SummaryData;
  isLoading?: boolean;
  className?: string;
}

export function SummaryCard({ summaryData, isLoading = false, className = "" }: SummaryCardProps) {
  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'medium': return <TrendingUp className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return '未知';
    }
  };

  const getRiskMessage = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '该访问者的行为模式正常，各项指标均在安全范围内。';
      case 'medium': return '检测到一些可疑特征，建议密切关注此访问者的活动。';
      case 'high': return '检测到多个高风险指标，强烈建议采取额外的安全验证措施。';
      default: return '正在分析访问者的风险等级...';
    }
  };

  if (isLoading) {
    return (
      <div className={`summary-card ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`summary-card ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            summaryData.riskLevel === 'low' ? 'bg-green-500/20' :
            summaryData.riskLevel === 'medium' ? 'bg-yellow-500/20' :
            'bg-red-500/20'
          }`}>
            <div className={getRiskColor(summaryData.riskLevel)}>
              {getRiskIcon(summaryData.riskLevel)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              风险评估摘要
            </h3>
            <p className="text-sm text-gray-400">
              基于多维度分析的综合评估结果
            </p>
          </div>
        </div>
        <div className="details-label">
          <span>细节</span>
        </div>
      </div>

      {/* 主要风险警告 */}
      <div className={`risk-warning ${
        summaryData.riskLevel === 'low' ? 'bg-green-500/10 border-green-500/30' :
        summaryData.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
        'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="risk-warning-title">
          {getRiskIcon(summaryData.riskLevel)}
          <span>{getRiskText(summaryData.riskLevel)} - {summaryData.overallScore}%</span>
        </div>
        <div className="risk-warning-content">
          {getRiskMessage(summaryData.riskLevel)}
        </div>
      </div>

      {/* 访问者信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">访问状态</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {summaryData.isNewVisitor ? '新访问者' : '返回访问者'}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">访问次数</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {summaryData.visitCount}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">最后访问</span>
          </div>
          <div className="text-sm font-medium text-white">
            {summaryData.lastSeen}
          </div>
        </div>
      </div>

      {/* 主要关注点 */}
      {summaryData.primaryConcerns.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            主要关注点
          </h4>
          <div className="space-y-2">
            {summaryData.primaryConcerns.map((concern, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span className="text-gray-300">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 可疑活动 */}
      {summaryData.suspiciousActivities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            可疑活动
          </h4>
          <div className="space-y-2">
            {summaryData.suspiciousActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 建议措施 */}
      {summaryData.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            建议措施
          </h4>
          <div className="space-y-2">
            {summaryData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                <span className="text-gray-300">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}