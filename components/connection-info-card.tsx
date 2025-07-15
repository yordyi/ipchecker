"use client";

import { Wifi, Signal, Globe, Zap, Gauge, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface ConnectionInfo {
  ip: string;
  ipv6?: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  asn: string;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  vpnDetected: boolean;
  proxyDetected: boolean;
  torDetected: boolean;
  dnsLeakDetected: boolean;
  webrtcIp?: string;
  publicIp?: string;
  localIp?: string;
  qualityScore: number;
}

interface ConnectionInfoCardProps {
  connectionInfo: ConnectionInfo;
  isLoading?: boolean;
  className?: string;
}

export function ConnectionInfoCard({ connectionInfo, isLoading = false, className = "" }: ConnectionInfoCardProps) {
  const getConnectionTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (t.includes('4g') || t.includes('5g')) return <Signal className="h-4 w-4" />;
    if (t.includes('ethernet')) return <Globe className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getSpeedColor = (speed: number) => {
    if (speed >= 10) return 'text-green-400';
    if (speed >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return 'text-green-400';
    if (latency <= 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityText = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '较差';
  };

  const getConnectionQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (score >= 60) return <Gauge className="h-4 w-4 text-yellow-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  const getThreatCount = () => {
    let count = 0;
    if (connectionInfo.vpnDetected) count++;
    if (connectionInfo.proxyDetected) count++;
    if (connectionInfo.torDetected) count++;
    if (connectionInfo.dnsLeakDetected) count++;
    return count;
  };

  const threatCount = getThreatCount();

  if (isLoading) {
    return (
      <div className={`professional-card ${className}`}>
        <div className="professional-card-header">
          <div className="professional-card-title">
            <Signal className="h-5 w-5 text-blue-400" />
            连接信息
          </div>
          <div className="pro-label">
            <span>专业</span>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`professional-card ${className}`}>
      <div className="professional-card-header">
        <div className="professional-card-title">
          {getConnectionTypeIcon(connectionInfo.connectionType)}
          连接信息
        </div>
        <div className="pro-label">
          <span>专业</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 网络质量评分 */}
        <div className="text-center py-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getConnectionQualityIcon(connectionInfo.qualityScore)}
            <span className="text-sm text-gray-400">网络质量</span>
          </div>
          <div className={`text-2xl font-bold ${getQualityColor(connectionInfo.qualityScore)}`}>
            {connectionInfo.qualityScore}/100
          </div>
          <div className="text-sm text-gray-400">
            {getQualityText(connectionInfo.qualityScore)}
          </div>
        </div>

        {/* 基本连接信息 */}
        <div className="space-y-3">
          <div className="info-item">
            <span className="info-label">连接类型</span>
            <span className="info-value">{connectionInfo.connectionType}</span>
          </div>

          <div className="info-item">
            <span className="info-label">网络类型</span>
            <span className="info-value">{connectionInfo.effectiveType.toUpperCase()}</span>
          </div>

          <div className="info-item">
            <span className="info-label">ISP</span>
            <span className="info-value">{connectionInfo.isp}</span>
          </div>

          <div className="info-item">
            <span className="info-label">ASN</span>
            <span className="info-value">{connectionInfo.asn}</span>
          </div>
        </div>

        {/* 性能指标 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300 mb-3">性能指标</div>
          <div className="space-y-2">
            <div className="info-item">
              <span className="info-label flex items-center gap-2">
                <Zap className="h-4 w-4" />
                下载速度
              </span>
              <span className={`info-value ${getSpeedColor(connectionInfo.downlink)}`}>
                {connectionInfo.downlink} Mbps
              </span>
            </div>

            <div className="info-item">
              <span className="info-label flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                延迟
              </span>
              <span className={`info-value ${getLatencyColor(connectionInfo.rtt)}`}>
                {connectionInfo.rtt} ms
              </span>
            </div>
          </div>
        </div>

        {/* 地理位置 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300 mb-3">地理位置</div>
          <div className="space-y-2">
            <div className="info-item">
              <span className="info-label">国家</span>
              <span className="info-value">{connectionInfo.country}</span>
            </div>

            <div className="info-item">
              <span className="info-label">地区</span>
              <span className="info-value">{connectionInfo.region}</span>
            </div>

            <div className="info-item">
              <span className="info-label">城市</span>
              <span className="info-value">{connectionInfo.city}</span>
            </div>
          </div>
        </div>

        {/* IP 地址信息 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300 mb-3">IP 地址</div>
          <div className="space-y-2">
            <div className="info-item">
              <span className="info-label">公网 IP</span>
              <span className="info-value font-mono">{connectionInfo.ip}</span>
            </div>

            {connectionInfo.ipv6 && (
              <div className="info-item">
                <span className="info-label">IPv6</span>
                <span className="info-value font-mono text-xs">{connectionInfo.ipv6}</span>
              </div>
            )}

            {connectionInfo.webrtcIp && (
              <div className="info-item">
                <span className="info-label">WebRTC IP</span>
                <span className="info-value font-mono">{connectionInfo.webrtcIp}</span>
              </div>
            )}

            {connectionInfo.localIp && (
              <div className="info-item">
                <span className="info-label">本地 IP</span>
                <span className="info-value font-mono">{connectionInfo.localIp}</span>
              </div>
            )}
          </div>
        </div>

        {/* 安全威胁检测 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-300">安全威胁</div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              threatCount === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <Shield className="h-3 w-3" />
              {threatCount === 0 ? '安全' : `${threatCount}个威胁`}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="info-item">
              <span className="info-label">VPN</span>
              <span className={`info-value ${connectionInfo.vpnDetected ? 'text-red-400' : 'text-green-400'}`}>
                {connectionInfo.vpnDetected ? '检测到' : '未检测'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">代理</span>
              <span className={`info-value ${connectionInfo.proxyDetected ? 'text-red-400' : 'text-green-400'}`}>
                {connectionInfo.proxyDetected ? '检测到' : '未检测'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Tor</span>
              <span className={`info-value ${connectionInfo.torDetected ? 'text-red-400' : 'text-green-400'}`}>
                {connectionInfo.torDetected ? '检测到' : '未检测'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">DNS 泄露</span>
              <span className={`info-value ${connectionInfo.dnsLeakDetected ? 'text-red-400' : 'text-green-400'}`}>
                {connectionInfo.dnsLeakDetected ? '检测到' : '未检测'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}