"use client";

import { useEffect, useState } from "react";
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export interface FraudFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export interface FraudScoreData {
  overall: number; // 0-100
  confidence: number; // 0-1
  factors: FraudFactor[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface FraudScoreDisplayProps {
  score: number;
  confidence: number;
  factors?: FraudFactor[];
  isLoading?: boolean;
  className?: string;
}

export function FraudScoreDisplay({ 
  score, 
  confidence, 
  factors = [], 
  isLoading = false,
  className = "" 
}: FraudScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  // 动画效果
  useEffect(() => {
    const scoreTimer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);

    const confidenceTimer = setTimeout(() => {
      setAnimatedConfidence(confidence);
    }, 800);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(confidenceTimer);
    };
  }, [score, confidence]);

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score <= 30) return 'low';
    if (score <= 70) return 'medium';
    return 'high';
  };

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'low-risk';
      case 'medium': return 'medium-risk';
      case 'high': return 'high-risk';
      default: return 'low-risk';
    }
  };

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'medium': return <TrendingUp className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getRiskText = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return '低风险';
    }
  };

  const getRiskDescription = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return '该访问者的行为模式正常，风险极低';
      case 'medium': return '检测到一些可疑特征，需要关注';
      case 'high': return '检测到多个高风险指标，建议加强验证';
      default: return '风险评估完成';
    }
  };

  const riskLevel = getRiskLevel(animatedScore);
  const circumference = 2 * Math.PI * 88; // 圆的周长 (半径 88)
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  if (isLoading) {
    return (
      <div className={`professional-card ${className}`}>
        <div className="fraud-score-circle">
          <div className="fraud-score-center">
            <div className="animate-spin">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <div className="fraud-score-label">分析中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`professional-card ${className}`}>
      <div className="professional-card-header">
        <div className="professional-card-title">
          <Shield className="h-5 w-5 text-blue-400" />
          欺诈评分
        </div>
        <div className="pro-label">
          <span>专业</span>
        </div>
      </div>

      <div className="fraud-score-circle">
        <svg className="fraud-score-svg" viewBox="0 0 200 200">
          {/* 背景圆环 */}
          <circle
            cx="100"
            cy="100"
            r="88"
            className="fraud-score-track"
          />
          {/* 进度圆环 */}
          <circle
            cx="100"
            cy="100"
            r="88"
            className={`fraud-score-progress ${getRiskColor(riskLevel)}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ 
              transition: 'stroke-dashoffset 1.5s ease-in-out',
              transformOrigin: 'center'
            }}
          />
        </svg>
        
        <div className="fraud-score-center">
          <div className="fraud-score-number">
            {animatedScore}%
          </div>
          <div className="fraud-score-label">
            欺诈风险
          </div>
        </div>
      </div>

      {/* 风险级别指示器 */}
      <div className="flex items-center justify-center mt-4 gap-2">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
          riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {getRiskIcon(riskLevel)}
          <span className="text-sm font-medium">{getRiskText(riskLevel)}</span>
        </div>
      </div>

      {/* 置信度显示 */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-400">
          置信度: <span className="text-white font-medium">{(animatedConfidence * 100).toFixed(1)}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {getRiskDescription(riskLevel)}
        </div>
      </div>

      {/* 风险因素概览 */}
      {factors.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-300 mb-3">主要风险因素</div>
          <div className="space-y-2">
            {factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{factor.name}</span>
                <span className={`font-medium ${
                  factor.risk === 'low' ? 'text-green-400' :
                  factor.risk === 'medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {factor.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}