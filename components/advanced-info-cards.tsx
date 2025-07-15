"use client";

import { InfoCard, InfoItem } from "./info-card";
import { HTTPHeaders, WebRTCInfo, SystemHardwareInfo, HTML5Features, BatteryInfo, FingerprintProData, EnhancedFingerprintProData } from "@/types";
import {
  Network,
  Router,
  Cpu,
  Code,
  Battery,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  RefreshCw,
  Server,
  History,
  TrendingUp,
  Copy
} from "lucide-react";
import { formatConfidenceScore, formatTimestamp, getRiskLevel } from "@/hooks/use-fingerprint-pro";
import { 
  getFormattedField, 
  safeRender, 
  getCopyText,
  calculateRiskScore,
  getRiskLevelColor,
  getRiskLevelLabel
} from "@/lib/field-utils";
import { useState } from "react";

interface HTTPHeadersCardProps {
  headers: HTTPHeaders | null;
  loading?: boolean;
}

export function HTTPHeadersCard({ headers, loading }: HTTPHeadersCardProps) {
  return (
    <InfoCard title="HTTP请求头">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5 text-blue-500" />
        <span className="font-medium">浏览器发送的请求头信息</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : headers ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <InfoItem label="User-Agent" value={headers.userAgent} copyable />
          <InfoItem label="Accept" value={headers.accept} copyable />
          <InfoItem label="Accept-Language" value={headers.acceptLanguage} copyable />
          <InfoItem label="Accept-Encoding" value={headers.acceptEncoding} copyable />
          <InfoItem label="Connection" value={headers.connection} copyable />
          <InfoItem label="Host" value={headers.host} copyable />
          <InfoItem label="Referer" value={headers.referer} copyable />
          <InfoItem label="Origin" value={headers.origin} copyable />
          <InfoItem label="Sec-Fetch-Site" value={headers.secFetchSite} copyable />
          <InfoItem label="Sec-Fetch-Mode" value={headers.secFetchMode} copyable />
          <InfoItem label="DNT" value={headers.dnt} copyable />
          
          {headers.rawHeaders && Object.keys(headers.rawHeaders).length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                所有请求头 ({Object.keys(headers.rawHeaders).length}个)
              </summary>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(headers.rawHeaders).map(([key, value]) => (
                  <InfoItem key={key} label={key} value={value} copyable />
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">无法获取请求头信息</p>
      )}
    </InfoCard>
  );
}

interface WebRTCCardProps {
  webrtc: WebRTCInfo | null;
  loading?: boolean;
}

export function WebRTCCard({ webrtc, loading }: WebRTCCardProps) {
  return (
    <InfoCard title="WebRTC信息">
      <div className="flex items-center gap-2 mb-4">
        <Router className="h-5 w-5 text-purple-500" />
        <span className="font-medium">实时通信技术检测</span>
        {webrtc?.leakDetected && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : webrtc ? (
        <div className="space-y-3">
          <InfoItem 
            label="WebRTC支持" 
            value={webrtc.supported ? "支持" : "不支持"} 
          />
          {webrtc.supported && (
            <>
              <InfoItem 
                label="本地IP地址" 
                value={webrtc.localIPs.length > 0 ? webrtc.localIPs.join(", ") : "未检测到"} 
                copyable 
              />
              <InfoItem 
                label="公网IP地址" 
                value={webrtc.publicIPs.length > 0 ? webrtc.publicIPs.join(", ") : "未检测到"} 
                copyable 
              />
              <InfoItem 
                label="IP泄露风险" 
                value={webrtc.leakDetected ? "是" : "否"} 
              />
              <InfoItem 
                label="ICE候选数量" 
                value={webrtc.candidates.length} 
              />
              
              {webrtc.candidates.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    ICE候选详情 ({webrtc.candidates.length}个)
                  </summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto text-xs text-gray-600 dark:text-gray-400">
                    {webrtc.candidates.map((candidate, index) => (
                      <div key={index} className="break-all">
                        {candidate.candidate}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">WebRTC信息加载中...</p>
      )}
    </InfoCard>
  );
}

interface SystemHardwareCardProps {
  systemInfo: SystemHardwareInfo | null;
  loading?: boolean;
}

export function SystemHardwareCard({ systemInfo, loading }: SystemHardwareCardProps) {
  return (
    <InfoCard title="系统硬件信息">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="h-5 w-5 text-green-500" />
        <span className="font-medium">底层系统和硬件特性</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : systemInfo ? (
        <div className="space-y-3">
          <InfoItem label="平台" value={systemInfo.platform} copyable />
          <InfoItem label="CPU类型" value={systemInfo.cpuClass} copyable />
          <InfoItem label="OS CPU" value={systemInfo.oscpu} copyable />
          <InfoItem label="产品" value={systemInfo.product} copyable />
          <InfoItem label="厂商" value={systemInfo.vendor} copyable />
          <InfoItem label="最大触摸点" value={systemInfo.maxTouchPoints} />
          <InfoItem label="媒体设备数量" value={systemInfo.mediaDevices} />
          <InfoItem label="蓝牙支持" value={systemInfo.bluetooth ? "支持" : "不支持"} />
          <InfoItem label="USB支持" value={systemInfo.usb ? "支持" : "不支持"} />
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">系统信息加载中...</p>
      )}
    </InfoCard>
  );
}

interface HTML5FeaturesCardProps {
  features: HTML5Features | null;
  loading?: boolean;
}

export function HTML5FeaturesCard({ features, loading }: HTML5FeaturesCardProps) {
  const getFeatureIcon = (supported: boolean) => 
    supported ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <InfoCard title="HTML5特性支持" className="lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Code className="h-5 w-5 text-orange-500" />
        <span className="font-medium">现代Web API和特性</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : features ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">存储技术</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.localStorage)}
                <span>LocalStorage</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.sessionStorage)}
                <span>SessionStorage</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.indexedDB)}
                <span>IndexedDB</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webSQL)}
                <span>WebSQL</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">图形技术</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.canvas)}
                <span>Canvas</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.svg)}
                <span>SVG</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webGL)}
                <span>WebGL</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webGL2)}
                <span>WebGL2</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">多线程技术</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webWorkers)}
                <span>Web Workers</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.sharedWorkers)}
                <span>Shared Workers</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.serviceWorkers)}
                <span>Service Workers</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">设备API</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.geolocation)}
                <span>地理位置</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.vibration)}
                <span>振动</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.battery)}
                <span>电池状态</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.gamepad)}
                <span>游戏手柄</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">通信技术</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webRTC)}
                <span>WebRTC</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.notifications)}
                <span>通知</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">媒体技术</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.webAudio)}
                <span>Web Audio</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.speechSynthesis)}
                <span>语音合成</span>
              </div>
              <div className="flex items-center gap-2">
                {getFeatureIcon(features.speechRecognition)}
                <span>语音识别</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">HTML5特性检测中...</p>
      )}
    </InfoCard>
  );
}

interface BatteryCardProps {
  batteryInfo: BatteryInfo | null;
  loading?: boolean;
}

export function BatteryCard({ batteryInfo, loading }: BatteryCardProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds === 0) return "未知";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  return (
    <InfoCard title="电池信息">
      <div className="flex items-center gap-2 mb-4">
        <Battery className="h-5 w-5 text-green-500" />
        <span className="font-medium">设备电池状态</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : batteryInfo ? (
        batteryInfo.supported ? (
          <div className="space-y-3">
            <InfoItem 
              label="电量" 
              value={`${batteryInfo.level}%`} 
            />
            <InfoItem 
              label="充电状态" 
              value={batteryInfo.charging ? "充电中" : "未充电"} 
            />
            <InfoItem 
              label="充电时间" 
              value={formatTime(batteryInfo.chargingTime)} 
            />
            <InfoItem 
              label="放电时间" 
              value={formatTime(batteryInfo.dischargingTime)} 
            />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">此设备不支持电池API</p>
        )
      ) : (
        <p className="text-gray-500 dark:text-gray-400">电池信息加载中...</p>
      )}
    </InfoCard>
  );
}

interface FingerprintProCardProps {
  fingerprintData: FingerprintProData;
  onRefresh?: () => void;
}

export function FingerprintProCard({ fingerprintData, onRefresh }: FingerprintProCardProps) {
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      default: return '未知';
    }
  };

  return (
    <InfoCard title="Fingerprint Pro 检测" className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <span className="font-medium">专业指纹识别和风险检测</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={fingerprintData.isLoading}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`h-4 w-4 ${fingerprintData.isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {fingerprintData.isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : fingerprintData.error ? (
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-red-500 dark:text-red-400 mb-2">
            {fingerprintData.error.message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            错误代码: {fingerprintData.error.code}
          </p>
        </div>
      ) : fingerprintData.result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基础识别信息 */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              访问者识别
            </h4>
            <InfoItem
              label="访问者ID"
              value={fingerprintData.result.visitorId}
              copyable
            />
            <InfoItem
              label="请求ID"
              value={fingerprintData.result.requestId}
              copyable
            />
            <InfoItem
              label="识别置信度"
              value={fingerprintData.result.confidence ?
                `${(fingerprintData.result.confidence.score * 100).toFixed(1)}% (${formatConfidenceScore(fingerprintData.result.confidence.score)})` :
                '未知'
              }
            />
            <InfoItem
              label="访问者状态"
              value={fingerprintData.result.visitorFound ? '已知访问者' : '新访问者'}
            />
            <InfoItem
              label="首次访问"
              value={formatTimestamp(fingerprintData.result.firstSeenAt?.global || null)}
            />
            <InfoItem
              label="最近访问"
              value={formatTimestamp(fingerprintData.result.lastSeenAt?.global || null)}
            />
          </div>

          {/* 风险检测信息 */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              风险评估
            </h4>

            {/* 计算风险等级 */}
            {(() => {
              const result = fingerprintData.result;
              const riskLevel = getRiskLevel(
                result.incognito || false,
                result.vpn,
                result.proxy,
                result.tor,
                result.tampering,
                result.suspectScore
              );

              return (
                <InfoItem
                  label="综合风险等级"
                  value={
                    <span className={getRiskColor(riskLevel)}>
                      {getRiskText(riskLevel)}
                    </span>
                  }
                />
              );
            })()}

            <InfoItem
              label="隐身模式"
              value={fingerprintData.result?.incognito ? '是' : '否'}
            />
            <InfoItem
              label="VPN检测"
              value={fingerprintData.result?.vpn?.result ? '检测到' : '未检测到'}
            />
            <InfoItem
              label="代理检测"
              value={fingerprintData.result?.proxy?.result ? '检测到' : '未检测到'}
            />
            <InfoItem
              label="Tor检测"
              value={fingerprintData.result?.tor?.result ? '检测到' : '未检测到'}
            />
            <InfoItem
              label="篡改检测"
              value={fingerprintData.result?.tampering?.result ? '检测到' : '未检测到'}
            />
            <InfoItem
              label="可疑评分"
              value={fingerprintData.result?.suspectScore ?
                `${fingerprintData.result.suspectScore}/100` :
                '未知'
              }
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Fingerprint Pro 数据加载中...</p>
      )}
    </InfoCard>
  );
}

interface EnhancedFingerprintProCardProps {
  enhancedData: EnhancedFingerprintProData;
  onRefresh?: () => void;
  onRefreshServerData?: () => void;
}

export function EnhancedFingerprintProCard({
  enhancedData,
  onRefresh,
  onRefreshServerData
}: EnhancedFingerprintProCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);


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

  // 合并客户端和服务端数据
  const combinedData = {
    ...enhancedData.clientData?.result,
    ...enhancedData.serverData?.currentVisit,
  };

  // 计算增强风险评估
  const enhancedRisk = calculateRiskScore(combinedData);

  // 获取要显示的主要字段
  const mainFields = [
    'visitorId',
    'requestId', 
    'confidence.score',
    'visitorFound',
    'vpn.result',
    'proxy.result',
    'tor.result',
    'tampering.result',
    'suspectScore'
  ];

  return (
    <InfoCard title="Fingerprint Pro 增强检测" className="lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <span className="font-medium">专业指纹识别和风险检测</span>
          {enhancedData.hasServerData && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <Server className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">服务端增强</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onRefreshServerData && enhancedData.hasServerData && (
            <button
              onClick={onRefreshServerData}
              disabled={enhancedData.serverData?.isLoading}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="刷新服务端数据"
            >
              <Server className={`h-4 w-4 ${enhancedData.serverData?.isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={enhancedData.isLoading}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="刷新所有数据"
            >
              <RefreshCw className={`h-4 w-4 ${enhancedData.isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {enhancedData.isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : enhancedData.clientData?.error ? (
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-red-500 dark:text-red-400 mb-2">
            {enhancedData.clientData.error.message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            错误代码: {enhancedData.clientData.error.code}
          </p>
        </div>
      ) : enhancedData.clientData?.result ? (
        <div className="space-y-6">
          {/* 增强风险评估 */}
          <div className={`rounded-lg p-4 border ${getRiskLevelColor(enhancedRisk.level)}`}>
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              增强风险评估
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {enhancedRisk.score}
                </div>
                <div className="text-sm text-gray-500">风险评分</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {getRiskLevelLabel(enhancedRisk.level)}
                </div>
                <div className="text-sm text-gray-500">风险等级</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {enhancedRisk.factors.filter(f => f.triggered).length}
                </div>
                <div className="text-sm text-gray-500">风险因素</div>
              </div>
            </div>
            {enhancedRisk.factors.filter(f => f.triggered).length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">检测到的风险因素:</div>
                <div className="flex flex-wrap gap-1">
                  {enhancedRisk.factors
                    .filter(factor => factor.triggered)
                    .map((factor) => (
                      <span
                        key={factor.key}
                        className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full"
                      >
                        {factor.label} (+{factor.weight})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 主要字段显示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainFields.map((fieldKey) => {
              const { field, rawValue, shouldShow } = getFormattedField(combinedData, fieldKey);
              
              if (!field || !shouldShow) return null;
              
              return (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      {field.icon && <field.icon className="h-3 w-3" />}
                      {field.label}
                      {field.critical && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    {field.copyable && rawValue != null && (
                      <button
                        onClick={() => handleCopy(field.key, rawValue)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
                        title="复制"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedField === field.key && (
                          <span className="absolute -top-8 -left-4 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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

          {/* 访问历史 */}
          {enhancedData.hasServerData && enhancedData.serverData?.visitorHistory && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <History className="h-4 w-4" />
                访问历史 ({enhancedData.serverData.visitorHistory.visits.length} 次访问)
              </h4>
              {enhancedData.serverData.visitorHistory.visits.length > 1 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {enhancedData.serverData.visitorHistory.visits.slice(0, 5).map((visit) => (
                    <div key={visit.requestId} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded text-sm">
                      <div>
                        <div className="font-medium">
                          {new Date(visit.timestamp * 1000).toLocaleDateString()} {new Date(visit.timestamp * 1000).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {visit.browserDetails?.browserName} - {visit.ipLocation?.country?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-blue-500">{visit.ip}</div>
                        <div className="text-xs text-gray-500">
                          置信度: {(visit.confidence.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Fingerprint Pro 数据加载中...</p>
      )}
    </InfoCard>
  );
}