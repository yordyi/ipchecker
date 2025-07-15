"use client";

import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { useEffect, useState, useMemo } from "react";
import { FingerprintProData, FingerprintProExtendedResult } from "@/types";

export function useFingerprintPro() {
  const [fingerprintProData, setFingerprintProData] = useState<FingerprintProData>({
    isLoading: true
  });
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  // 使用 useMemo 来稳定配置对象，避免无限循环
  const loadOptions = useMemo(() => ({
    extendedResult: true,
    linkedId: typeof window !== 'undefined' ? window.location.hostname : undefined,
    tag: {
      userAction: 'page_visit',
      timestamp: new Date().toISOString()
    }
  }), []);

  const {
    data,
    isLoading,
    error,
    getData
  } = useVisitorData(loadOptions, { immediate: true });

  // 添加超时处理
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !data && !error) {
        console.error('🔥 Fingerprint Pro 加载超时 (10秒)');
        setTimeoutError('Fingerprint Pro 加载超时，请检查网络连接');
        setFingerprintProData({
          isLoading: false,
          error: {
            message: 'Fingerprint Pro 加载超时，请检查网络连接或API配置',
            code: 'TIMEOUT_ERROR'
          }
        });
      }
    }, 10000); // 10秒超时

    return () => clearTimeout(timeout);
  }, [isLoading, data, error]);

  useEffect(() => {
    console.log('🔍 Fingerprint Pro 状态:', {
      isLoading,
      hasData: !!data,
      hasError: !!error,
      timeoutError,
      apiKey: process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY ? '已配置' : '未配置',
      region: process.env.NEXT_PUBLIC_FINGERPRINT_REGION || 'ap'
    });
    
    if (isLoading) {
      console.log('⏳ Fingerprint Pro 数据加载中...');
      setFingerprintProData({ isLoading: true });
      return;
    }

    if (error) {
      console.error('❌ Fingerprint Pro 错误:', error);
      setFingerprintProData({
        isLoading: false,
        error: {
          message: error.message || '获取Fingerprint Pro数据时发生错误',
          code: 'code' in error ? String(error.code) : 'UNKNOWN_ERROR'
        }
      });
      return;
    }

    if (data) {
      console.log('✅ Fingerprint Pro 数据加载成功:', data);
      console.log('📊 数据结构详情:', {
        visitorId: data.visitorId,
        requestId: data.requestId,
        confidence: data.confidence,
        hasIpLocation: !!data.ipLocation,
        hasIncognito: !!data.incognito,
        hasBrowserName: !!data.browserName,
        hasDevice: !!data.device,
        ipLocationKeys: data.ipLocation ? Object.keys(data.ipLocation) : [],
        allKeys: Object.keys(data)
      });
      setTimeoutError(null);
      setFingerprintProData({
        isLoading: false,
        result: data as FingerprintProExtendedResult
      });
    }
  }, [data, isLoading, error, timeoutError]);

  const refresh = async () => {
    console.log('🔄 开始刷新 Fingerprint Pro 数据...');
    setTimeoutError(null);
    setFingerprintProData({ isLoading: true });
    
    try {
      const newData = await getData({ ignoreCache: true });
      console.log('✅ Fingerprint Pro 刷新成功:', newData);
      setFingerprintProData({
        isLoading: false,
        result: newData as any
      });
    } catch (err) {
      console.error('❌ Fingerprint Pro 刷新失败:', err);
      setFingerprintProData({
        isLoading: false,
        error: {
          message: (err as Error).message || '刷新数据时发生错误',
          code: 'REFRESH_ERROR'
        }
      });
    }
  };

  return {
    data: fingerprintProData,
    refresh,
    isAvailable: !error && !!process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY,
    hasTimeoutError: !!timeoutError
  };
}

export function formatConfidenceScore(score: number): string {
  if (score >= 0.9) return '极高';
  if (score >= 0.8) return '高';
  if (score >= 0.6) return '中等';
  if (score >= 0.4) return '较低';
  return '低';
}

export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return '未知';
  
  try {
    const date = new Date(timestamp);
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
}

export function getRiskLevel(
  incognito: boolean,
  vpn?: { result: boolean },
  proxy?: { result: boolean },
  tor?: { result: boolean },
  tampering?: { result: boolean },
  suspectScore?: number
): 'low' | 'medium' | 'high' {
  const risks = [
    incognito,
    vpn?.result,
    proxy?.result,
    tor?.result,
    tampering?.result,
    (suspectScore || 0) > 50
  ].filter(Boolean).length;

  if (risks >= 3) return 'high';
  if (risks >= 1) return 'medium';
  return 'low';
}