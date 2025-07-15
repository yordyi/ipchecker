"use client";

import { useState } from "react";
import { ModernCard, InfoItem } from "./modern-card";
import { Skeleton } from "./loading-skeleton";
import { 
  Fingerprint, 
  Palette, 
  Cpu, 
  Volume2, 
  Globe,
  Monitor,
  Shield,
  ChevronDown,
  ChevronUp,
  Hash,
  Eye,
  EyeOff
} from "lucide-react";
interface FingerprintDetailsProps {
  fingerprint: {
    canvasFingerprint?: string;
    webglFingerprint?: string;
    audioFingerprint?: string;
    webglVendor?: string;
    webglRenderer?: string;
    webglExtensions?: string[];
    plugins?: Array<{ name: string; version?: string }>;
    fonts?: string[];
    mediaDevices?: {
      audioInput: number;
      audioOutput: number;
      videoInput: number;
    };
    permissions?: Record<string, PermissionState>;
  } | null;
  isLoading?: boolean;
}

export function FingerprintDetails({ fingerprint, isLoading }: FingerprintDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    canvas: true,
    webgl: true,
    audio: true,
    fonts: false,
    plugins: false
  });

  const [showRawData, setShowRawData] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <ModernCard 
        title="设备指纹详情" 
        icon={<Fingerprint className="h-5 w-5 text-purple-400" />}
        gradient
        glowColor="purple"
      >
        <div className="space-y-4">
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard 
      title="设备指纹详情" 
      icon={<Fingerprint className="h-5 w-5 text-purple-400" />}
      gradient
      glowColor="purple"
    >
      <div className="space-y-4">
        {/* Canvas 指纹 */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('canvas')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-blue-400" />
              <span className="font-medium">Canvas 指纹</span>
              {fingerprint?.canvasFingerprint && (
                <span className="tag tag-info">已获取</span>
              )}
            </div>
            {expandedSections.canvas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.canvas && (
            <div className="p-4 pt-0">
              {fingerprint?.canvasFingerprint ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">指纹哈希</p>
                      <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono break-all">
                        {fingerprint.canvasFingerprint}
                      </code>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Canvas指纹通过绘制文本和图形来识别设备，准确率高达99.5%
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">未能获取Canvas指纹</p>
              )}
            </div>
          )}
        </div>

        {/* WebGL 指纹 */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('webgl')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4 text-green-400" />
              <span className="font-medium">WebGL 指纹</span>
              {fingerprint?.webglFingerprint && (
                <span className="tag tag-success">已获取</span>
              )}
            </div>
            {expandedSections.webgl ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.webgl && (
            <div className="p-4 pt-0 space-y-3">
              {fingerprint?.webglFingerprint ? (
                <>
                  <InfoItem 
                    label="渲染器" 
                    value={fingerprint.webglRenderer || "未知"}
                    icon={<Monitor className="h-3 w-3" />}
                  />
                  <InfoItem 
                    label="供应商" 
                    value={fingerprint.webglVendor || "未知"}
                    icon={<Cpu className="h-3 w-3" />}
                  />
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">WebGL 哈希</p>
                      <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono break-all">
                        {fingerprint.webglFingerprint}
                      </code>
                    </div>
                  </div>
                  {fingerprint.webglExtensions && fingerprint.webglExtensions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">支持的扩展 ({fingerprint.webglExtensions.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {fingerprint.webglExtensions.slice(0, 5).map((ext: string, idx: number) => (
                          <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded">
                            {ext}
                          </span>
                        ))}
                        {fingerprint.webglExtensions.length > 5 && (
                          <span className="text-xs text-gray-400">
                            +{fingerprint.webglExtensions.length - 5} 更多
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">未能获取WebGL指纹</p>
              )}
            </div>
          )}
        </div>

        {/* Audio 指纹 */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('audio')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">Audio 指纹</span>
              {fingerprint?.audioFingerprint && (
                <span className="tag tag-warning">已获取</span>
              )}
            </div>
            {expandedSections.audio ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.audio && (
            <div className="p-4 pt-0">
              {fingerprint?.audioFingerprint ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">音频指纹</p>
                      <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono break-all">
                        {fingerprint.audioFingerprint}
                      </code>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    通过Web Audio API生成的独特音频信号指纹
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">未能获取Audio指纹</p>
              )}
            </div>
          )}
        </div>

        {/* 字体列表 */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('fonts')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span className="font-medium">可用字体</span>
              {fingerprint?.fonts && (
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                  {fingerprint.fonts.length} 种
                </span>
              )}
            </div>
            {expandedSections.fonts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.fonts && fingerprint?.fonts && (
            <div className="p-4 pt-0">
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {fingerprint.fonts.map((font, idx) => (
                  <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded">
                    {font}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 浏览器插件 */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('plugins')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-red-400" />
              <span className="font-medium">浏览器插件</span>
              {fingerprint?.plugins && (
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                  {fingerprint.plugins.length} 个
                </span>
              )}
            </div>
            {expandedSections.plugins ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.plugins && fingerprint?.plugins && (
            <div className="p-4 pt-0">
              {fingerprint.plugins.length > 0 ? (
                <div className="space-y-1">
                  {fingerprint.plugins.map((plugin, idx) => (
                    <div key={idx} className="text-sm text-gray-300">
                      • {plugin.name}{plugin.version ? ` (${plugin.version})` : ''}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">未检测到浏览器插件</p>
              )}
            </div>
          )}
        </div>

        {/* 原始数据切换 */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showRawData ? "隐藏" : "显示"}原始数据
          </button>
          
          {showRawData && (
            <pre className="mt-4 p-4 bg-black/30 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(fingerprint, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </ModernCard>
  );
}