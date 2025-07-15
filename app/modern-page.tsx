"use client";

import { useState, useCallback } from "react";
import { useEnhancedFingerprint } from "@/hooks/use-enhanced-fingerprint";
import { useDeviceInfo } from "@/hooks/use-device-info";
import { useWebRTCInfo } from "@/hooks/use-webrtc-info";
import { useBrowserFingerprint } from "@/hooks/use-browser-fingerprint";
import { FingerprintDiagnostics } from "@/components/fingerprint-diagnostics";
import { FraudScoreDisplay } from "@/components/fraud-score-display";
import { BrowserInfoCard } from "@/components/browser-info-card";
import { ConnectionInfoCard } from "@/components/connection-info-card";
import { SummaryCard } from "@/components/summary-card";
import { FingerprintDataDisplay } from "@/components/fingerprint-data-display";
import { FingerprintDetails } from "@/components/fingerprint-details";
import { 
  getNestedValue, 
  calculateRiskScore
} from "@/lib/field-utils";
import {
  MapPin,
  Copy,
  CheckCircle,
  Shield,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function ModernNetworkDetection() {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const enhancedFingerprint = useEnhancedFingerprint();
  const deviceInfo = useDeviceInfo();
  const webrtcInfo = useWebRTCInfo();
  const browserFingerprint = useBrowserFingerprint();

  // 数据转换函数
  const transformToBrowserInfo = useCallback(() => {
    if (!deviceInfo || !enhancedFingerprint.data.clientData?.result) return null;
    
    return {
      name: deviceInfo.browser || '未知',
      version: deviceInfo.browserVersion || '',
      userAgent: deviceInfo.userAgent || '',
      platform: deviceInfo.os || '未知',
      cookiesEnabled: navigator.cookieEnabled,
      javaEnabled: false, // Java支持已被大多数浏览器移除
      webglRenderer: browserFingerprint?.webglRenderer,
      webglVendor: browserFingerprint?.webglVendor,
      plugins: browserFingerprint?.plugins || [],
      languages: navigator.languages ? Array.from(navigator.languages) : ['en'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
      },
      fingerprints: {
        canvas: browserFingerprint?.canvasFingerprint,
        webgl: browserFingerprint?.webglFingerprint,
        audio: browserFingerprint?.audioFingerprint,
      }
    };
  }, [deviceInfo, enhancedFingerprint.data.clientData]);

  const transformToConnectionInfo = useCallback(() => {
    if (!enhancedFingerprint.data.clientData?.result || !webrtcInfo) return null;
    
    const result = enhancedFingerprint.data.clientData.result;
    
    // 计算网络质量评分
    const calculateNetworkQuality = () => {
      if (!webrtcInfo?.connection) return { score: 0, level: 'unknown' as const };

      const latency = webrtcInfo.connection.rtt || 0;
      const effectiveType = webrtcInfo.connection.effectiveType;
      const downlink = webrtcInfo.connection.downlink || 0;

      let score = 100;

      // 基于延迟评分
      if (latency > 200) score -= 40;
      else if (latency > 100) score -= 25;
      else if (latency > 50) score -= 10;

      // 基于连接类型评分
      if (effectiveType === 'slow-2g') score -= 50;
      else if (effectiveType === '2g') score -= 35;
      else if (effectiveType === '3g') score -= 20;
      else if (effectiveType === '4g') score -= 5;

      // 基于下载速度评分
      if (downlink < 0.5) score -= 30;
      else if (downlink < 1) score -= 20;
      else if (downlink < 2) score -= 10;

      const finalScore = Math.max(score, 0);

      let level: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
      if (finalScore >= 90) level = 'excellent';
      else if (finalScore >= 70) level = 'good';
      else if (finalScore >= 50) level = 'fair';
      else level = 'poor';

      return { score: finalScore, level };
    };

    const networkQuality = calculateNetworkQuality();
    
    // 使用字段映射工具来安全获取嵌套值
    return {
      ip: String(getNestedValue(result, 'ip') || '未知'),
      ipv6: undefined, // IPv6 信息暂时不可用
      country: String(getNestedValue(result, 'ipLocation.country.name') || '未知'),
      region: String(getNestedValue(result, 'ipLocation.subdivisions.0.name') || '未知'),
      city: String(getNestedValue(result, 'ipLocation.city.name') || '未知'),
      isp: '未知', // ISP 信息暂时不可用
      asn: '未知', // ASN 信息暂时不可用
      connectionType: webrtcInfo.connection?.effectiveType || '未知',
      effectiveType: webrtcInfo.connection?.effectiveType || '未知',
      downlink: webrtcInfo.connection?.downlink || 0,
      rtt: webrtcInfo.connection?.rtt || 0,
      vpnDetected: Boolean(getNestedValue(enhancedFingerprint.data.serverData, 'currentVisit.vpn.result')),
      proxyDetected: Boolean(getNestedValue(enhancedFingerprint.data.serverData, 'currentVisit.proxy.result')),
      torDetected: Boolean(getNestedValue(enhancedFingerprint.data.serverData, 'currentVisit.tor.result')),
      dnsLeakDetected: false, // 需要实现DNS泄露检测
      webrtcIp: webrtcInfo.localIPs?.[0] || undefined,
      publicIp: String(getNestedValue(result, 'ip') || '') || undefined,
      localIp: webrtcInfo.localIPs?.[0] || undefined,
      qualityScore: networkQuality.score || 0,
    };
  }, [enhancedFingerprint.data, webrtcInfo]);

  const transformToSummaryData = useCallback(() => {
    if (!enhancedFingerprint.data.clientData?.result) return null;
    
    const result = enhancedFingerprint.data.clientData.result;
    const serverData = enhancedFingerprint.data.serverData;
    
    // 合并客户端和服务端数据
    const combinedData = {
      ...result,
      ...serverData?.currentVisit,
    };
    
    // 使用字段映射系统计算风险评估
    const riskAssessment = calculateRiskScore(combinedData);
    
    const primaryConcerns: string[] = [];
    const recommendations: string[] = [];
    const suspiciousActivities: string[] = [];
    
    // 根据检测结果生成关注点和建议
    riskAssessment.factors.forEach(factor => {
      if (factor.triggered) {
        switch (factor.key) {
          case 'vpn.result':
            primaryConcerns.push('检测到VPN使用');
            recommendations.push('验证用户身份和访问意图');
            break;
          case 'proxy.result':
            primaryConcerns.push('检测到代理服务器');
            recommendations.push('评估代理使用的合理性');
            break;
          case 'tor.result':
            primaryConcerns.push('检测到Tor网络访问');
            recommendations.push('加强身份验证措施');
            break;
          case 'incognito':
            suspiciousActivities.push('使用隐身模式访问');
            break;
          case 'tampering.result':
            primaryConcerns.push('检测到浏览器篡改');
            recommendations.push('进行安全验证');
            break;
          case 'virtualMachine.result':
            suspiciousActivities.push('虚拟机环境访问');
            break;
          case 'developerTools.result':
            suspiciousActivities.push('开发者工具活动');
            break;
        }
      }
    });
    
    // 根据置信度添加额外关注点
    const confidenceScore = getNestedValue(result, 'confidence.score');
    if (typeof confidenceScore === 'number' && confidenceScore < 0.5) {
      suspiciousActivities.push('设备指纹识别置信度较低');
    }
    
    // 映射风险等级到传统格式
    let legacyRiskLevel: 'low' | 'medium' | 'high';
    switch (riskAssessment.level) {
      case 'critical':
      case 'high':
        legacyRiskLevel = 'high';
        break;
      case 'medium':
        legacyRiskLevel = 'medium';
        break;
      default:
        legacyRiskLevel = 'low';
    }
    
    return {
      riskLevel: legacyRiskLevel,
      overallScore: Math.max(0, 100 - riskAssessment.score),
      primaryConcerns,
      recommendations,
      visitCount: Number(getNestedValue(serverData, 'visitorHistory.visits.length')) || 1,
      lastSeen: (() => {
        const lastSeenValue = getNestedValue(result, 'lastSeenAt.global');
        if (lastSeenValue && (typeof lastSeenValue === 'string' || typeof lastSeenValue === 'number')) {
          return new Date(lastSeenValue).toLocaleString();
        }
        return '刚刚';
      })(),
      isNewVisitor: !getNestedValue(result, 'visitorFound'),
      suspiciousActivities,
    };
  }, [enhancedFingerprint.data]);

  // 使用字段映射系统的安全渲染函数
  const safeRender = (value: unknown, fallback: string = '未知'): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      try {
        if (Array.isArray(value)) return value.join(', ');
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value);
  };


  // 刷新所有数据
  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await enhancedFingerprint.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [enhancedFingerprint]);


  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 移除未使用的变量和函数

  // 获取转换后的数据
  const browserInfo = transformToBrowserInfo();
  const connectionInfo = transformToConnectionInfo();
  const summaryData = transformToSummaryData();

  // 计算欺诈评分
  const calculateFraudScore = () => {
    if (!summaryData) return 0;
    return 100 - summaryData.overallScore; // 风险评分，越高越危险
  };

  const fraudScore = calculateFraudScore();
  const fraudConfidence = enhancedFingerprint.data.clientData?.result?.confidence?.score || 0;

  return (
    <div className="professional-container">
      {/* 顶部导航栏 - 现代化设计 */}
      <header className="relative z-10 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="icon-wrapper">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  浏览器指纹检测系统
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">专业的设备指纹识别与安全分析</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshAllData}
                disabled={refreshing}
                className="btn-secondary"
                title="刷新所有数据"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">刷新数据</span>
              </button>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass-effect">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300" suppressHydrationWarning>
                  {new Date().toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* IP 地址主显示区域 - 现代化设计 */}
      <div className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative">
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">您的 IP 地址</h2>
              <div className="flex items-center justify-center gap-4">
                {enhancedFingerprint.data.isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    <span className="text-5xl font-light text-gray-400">检测中...</span>
                  </div>
                ) : enhancedFingerprint.data.clientData?.error ? (
                  <div className="flex flex-col items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <span className="text-3xl text-red-400">连接失败</span>
                  </div>
                ) : enhancedFingerprint.data.clientData?.result ? (
                  <div className="group">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {safeRender(enhancedFingerprint.data.clientData.result.ip, "未知")}
                      </span>
                      {enhancedFingerprint.data.clientData.result.ip && (
                        <button
                          onClick={() => copyToClipboard(String(enhancedFingerprint.data.clientData!.result!.ip))}
                          className="p-3 rounded-xl glass-effect hover-card opacity-0 group-hover:opacity-100 transition-opacity"
                          title="复制IP地址"
                        >
                          {copied ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-5xl font-light text-gray-400">等待数据...</span>
                )}
              </div>
            </div>

            {enhancedFingerprint.data.clientData?.result?.ipLocation && (
              <div className="flex items-center justify-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">
                  {safeRender(enhancedFingerprint.data.clientData.result.ipLocation.country?.name)}
                  {enhancedFingerprint.data.clientData.result.ipLocation.subdivisions?.[0]?.name &&
                   ` • ${safeRender(enhancedFingerprint.data.clientData.result.ipLocation.subdivisions?.[0]?.name)}`}
                  {enhancedFingerprint.data.clientData.result.ipLocation.city?.name &&
                   ` • ${safeRender(enhancedFingerprint.data.clientData.result.ipLocation.city?.name)}`}
                </span>
              </div>
            )}

            {/* 快速统计 */}
            {enhancedFingerprint.data.clientData?.result && !enhancedFingerprint.data.clientData.error && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-effect rounded-xl p-4">
                  <div className="stat-value">{fraudScore}%</div>
                  <div className="stat-label">风险评分</div>
                </div>
                <div className="glass-effect rounded-xl p-4">
                  <div className="stat-value">{(fraudConfidence * 100).toFixed(0)}%</div>
                  <div className="stat-label">置信度</div>
                </div>
                <div className="glass-effect rounded-xl p-4">
                  <div className="stat-value">{summaryData?.visitCount || 1}</div>
                  <div className="stat-label">访问次数</div>
                </div>
                <div className="glass-effect rounded-xl p-4">
                  <div className="stat-value">{connectionInfo?.quality.level === 'excellent' ? '极佳' : connectionInfo?.quality.level === 'good' ? '良好' : connectionInfo?.quality.level === 'fair' ? '一般' : '未知'}</div>
                  <div className="stat-label">网络质量</div>
                </div>
              </div>
            )}

            {enhancedFingerprint.data.clientData?.error && (
              <div className="mt-8 p-6 glass-effect rounded-xl max-w-2xl mx-auto border border-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <span className="text-lg text-red-400 font-medium">连接失败</span>
                </div>
                <p className="text-gray-300 mb-4">
                  {safeRender(enhancedFingerprint.data.clientData.error?.message, "无法连接到指纹识别服务，请检查网络连接后重试。")}
                </p>
                <button
                  onClick={enhancedFingerprint.refresh}
                  className="btn-primary bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  重试连接
                </button>
              </div>
            )}

            {/* API 诊断 - 仅在有错误时显示 */}
            {enhancedFingerprint.data.clientData?.error && (
              <div className="mt-6">
                <FingerprintDiagnostics />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 三栏核心区域 */}
      <div className="three-column-layout">
        {/* 左栏：Browser模块 */}
        <div className="left-column">
          {browserInfo ? (
            <BrowserInfoCard 
              browserInfo={browserInfo}
              isLoading={enhancedFingerprint.data.isLoading}
            />
          ) : (
            <BrowserInfoCard 
              browserInfo={{
                name: '未知',
                version: '',
                userAgent: '',
                platform: '未知',
                cookiesEnabled: false,
                javaEnabled: false,
                plugins: [],
                languages: [],
                timezone: 'UTC',
                screen: { width: 0, height: 0, pixelRatio: 1, colorDepth: 24 },
                fingerprints: {}
              }}
              isLoading={true}
            />
          )}
        </div>

        {/* 中栏：Fraud Score大圆环 */}
        <div className="center-column">
          <FraudScoreDisplay
            score={fraudScore}
            confidence={fraudConfidence}
            isLoading={enhancedFingerprint.data.isLoading}
          />
        </div>

        {/* 右栏：Connection模块 */}
        <div className="right-column">
          {connectionInfo ? (
            <ConnectionInfoCard 
              connectionInfo={connectionInfo}
              isLoading={enhancedFingerprint.data.isLoading}
            />
          ) : (
            <ConnectionInfoCard 
              connectionInfo={{
                ip: '未知',
                country: '未知',
                region: '未知',
                city: '未知',
                isp: '未知',
                asn: '未知',
                connectionType: '未知',
                effectiveType: '未知',
                downlink: 0,
                rtt: 0,
                vpnDetected: false,
                proxyDetected: false,
                torDetected: false,
                dnsLeakDetected: false,
                qualityScore: 0,
              }}
              isLoading={true}
            />
          )}
        </div>
      </div>

      {/* 底部摘要区域 */}
      {summaryData && (
        <div className="summary-section">
          <SummaryCard 
            summaryData={summaryData}
            isLoading={enhancedFingerprint.data.isLoading}
          />
        </div>
      )}

      {/* 指纹详情区域 - 新增 */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <FingerprintDetails
          fingerprint={browserFingerprint}
          isLoading={!browserFingerprint}
        />
      </div>

      {/* 详细信息网格 - 保留现有功能 */}
      <div className="details-grid">
        {/* Fingerprint Pro 增强检测 */}
        {enhancedFingerprint.isAvailable && (
          <div className="professional-card">
            <div className="professional-card-header">
              <div className="professional-card-title">
                <Shield className="h-5 w-5 text-blue-400" />
                Fingerprint Pro 增强检测
                {enhancedFingerprint.data.hasServerData && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-2">
                    服务端增强
                  </span>
                )}
              </div>
              <div className="details-label">
                <span>详细</span>
              </div>
            </div>

            {enhancedFingerprint.data.isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : enhancedFingerprint.data.clientData?.error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 mb-2">Fingerprint Pro 数据获取失败</p>
                <p className="text-sm text-gray-500">{safeRender(enhancedFingerprint.data.clientData.error?.message, "未知错误")}</p>
                <button
                  onClick={enhancedFingerprint.refresh}
                  className="mt-3 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : enhancedFingerprint.data.clientData?.result ? (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <FingerprintDataDisplay data={enhancedFingerprint.data} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Fingerprint Pro 数据加载中...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
