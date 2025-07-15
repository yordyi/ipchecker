"use client";

import { Monitor, Smartphone, Tablet, Chrome } from "lucide-react";

interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  platform: string;
  cookiesEnabled: boolean;
  javaEnabled: boolean;
  webglRenderer?: string;
  webglVendor?: string;
  plugins: string[];
  languages: string[];
  timezone: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  };
  fingerprints: {
    canvas?: string;
    webgl?: string;
    audio?: string;
  };
}

interface BrowserInfoCardProps {
  browserInfo: BrowserInfo;
  isLoading?: boolean;
  className?: string;
}

export function BrowserInfoCard({ browserInfo, isLoading = false, className = "" }: BrowserInfoCardProps) {
  const getBrowserIcon = (browserName: string) => {
    const name = browserName.toLowerCase();
    if (name.includes('chrome')) return <Chrome className="h-4 w-4" />;
    // 对于其他浏览器，使用通用图标
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('mobile') || p.includes('android') || p.includes('ios')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (p.includes('tablet') || p.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatFingerprint = (fingerprint: string) => {
    return fingerprint.substring(0, 8) + '...' + fingerprint.substring(fingerprint.length - 8);
  };

  const getSecurityScore = () => {
    let score = 100;
    
    // 基于各种因素计算安全评分
    if (!browserInfo.cookiesEnabled) score -= 10;
    if (browserInfo.javaEnabled) score -= 5;
    if (browserInfo.plugins.length > 10) score -= 10;
    if (!browserInfo.fingerprints.canvas) score -= 15;
    if (!browserInfo.fingerprints.webgl) score -= 10;
    
    return Math.max(score, 0);
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: 'high', color: 'text-green-400', text: '高' };
    if (score >= 60) return { level: 'medium', color: 'text-yellow-400', text: '中' };
    return { level: 'low', color: 'text-red-400', text: '低' };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  if (isLoading) {
    return (
      <div className={`professional-card ${className}`}>
        <div className="professional-card-header">
          <div className="professional-card-title">
            <Monitor className="h-5 w-5 text-purple-400" />
            浏览器信息
          </div>
          <div className="advanced-label">
            <span>高级</span>
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
          {getDeviceIcon(browserInfo.platform)}
          浏览器信息
        </div>
        <div className="advanced-label">
          <span>高级</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 基本信息 */}
        <div className="space-y-3">
          <div className="info-item">
            <span className="info-label flex items-center gap-2">
              {getBrowserIcon(browserInfo.name)}
              浏览器
            </span>
            <span className="info-value">
              {browserInfo.name} {browserInfo.version}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">平台</span>
            <span className="info-value">{browserInfo.platform}</span>
          </div>

          <div className="info-item">
            <span className="info-label">屏幕分辨率</span>
            <span className="info-value">
              {browserInfo.screen.width}×{browserInfo.screen.height}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">像素比</span>
            <span className="info-value">{browserInfo.screen.pixelRatio}x</span>
          </div>

          <div className="info-item">
            <span className="info-label">色彩深度</span>
            <span className="info-value">{browserInfo.screen.colorDepth}位</span>
          </div>

          <div className="info-item">
            <span className="info-label">时区</span>
            <span className="info-value">{browserInfo.timezone}</span>
          </div>
        </div>

        {/* 功能支持 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-300 mb-3">功能支持</div>
          <div className="space-y-2">
            <div className="info-item">
              <span className="info-label">Cookies</span>
              <span className={`info-value ${browserInfo.cookiesEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {browserInfo.cookiesEnabled ? '启用' : '禁用'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Java</span>
              <span className={`info-value ${browserInfo.javaEnabled ? 'text-yellow-400' : 'text-green-400'}`}>
                {browserInfo.javaEnabled ? '启用' : '禁用'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">插件数量</span>
              <span className="info-value">{browserInfo.plugins.length}</span>
            </div>

            <div className="info-item">
              <span className="info-label">语言</span>
              <span className="info-value">{browserInfo.languages.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* 硬件信息 */}
        {browserInfo.webglRenderer && (
          <div className="border-t border-gray-700 pt-4">
            <div className="text-sm font-medium text-gray-300 mb-3">硬件信息</div>
            <div className="space-y-2">
              <div className="info-item">
                <span className="info-label">WebGL 渲染器</span>
                <span className="info-value text-xs">{browserInfo.webglRenderer}</span>
              </div>

              {browserInfo.webglVendor && (
                <div className="info-item">
                  <span className="info-label">GPU 厂商</span>
                  <span className="info-value">{browserInfo.webglVendor}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 指纹信息 */}
        {Object.keys(browserInfo.fingerprints).length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <div className="text-sm font-medium text-gray-300 mb-3">设备指纹</div>
            <div className="space-y-2">
              {browserInfo.fingerprints.canvas && (
                <div className="info-item">
                  <span className="info-label">Canvas</span>
                  <span className="info-value font-mono text-xs">
                    {formatFingerprint(browserInfo.fingerprints.canvas)}
                  </span>
                </div>
              )}

              {browserInfo.fingerprints.webgl && (
                <div className="info-item">
                  <span className="info-label">WebGL</span>
                  <span className="info-value font-mono text-xs">
                    {formatFingerprint(browserInfo.fingerprints.webgl)}
                  </span>
                </div>
              )}

              {browserInfo.fingerprints.audio && (
                <div className="info-item">
                  <span className="info-label">Audio</span>
                  <span className="info-value font-mono text-xs">
                    {formatFingerprint(browserInfo.fingerprints.audio)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 安全评分 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="info-item">
            <span className="info-label">安全评分</span>
            <span className={`info-value ${securityLevel.color}`}>
              {securityScore}/100 ({securityLevel.text})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}