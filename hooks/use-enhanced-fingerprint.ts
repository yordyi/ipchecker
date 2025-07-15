"use client";

import { useState, useEffect, useCallback } from "react";
import { useFingerprintPro } from "./use-fingerprint-pro";
import { EnhancedFingerprintProData, FingerprintServerData, VisitorHistoryResponse, VisitorHistoryVisit } from "@/types";

/**
 * 增强的 Fingerprint Pro hook，结合客户端和服务端数据
 */
export function useEnhancedFingerprint() {
  const clientFingerprint = useFingerprintPro();
  const [serverData, setServerData] = useState<FingerprintServerData>({
    isLoading: false,
  });
  const [hasServerData, setHasServerData] = useState(false);


  // 获取服务端数据
  const fetchServerData = useCallback(async (visitorId: string, requestId?: string) => {
    setServerData(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // 获取访问者历史记录
      const historyParams = new URLSearchParams({
        limit: '5', // 获取最近 5 次访问记录
      });
      if (requestId) {
        historyParams.append('request_id', requestId);
      }

      const [historyResponse, currentVisitResponse] = await Promise.allSettled([
        fetch(`/api/fingerprint/visitor/${visitorId}?${historyParams}`),
        requestId ? fetch(`/api/fingerprint/event/${requestId}`) : Promise.resolve(null),
      ]);

      let visitorHistory: VisitorHistoryResponse | undefined;
      let currentVisit: VisitorHistoryVisit | undefined;

      // 处理历史记录响应
      if (historyResponse.status === 'fulfilled' && historyResponse.value.ok) {
        visitorHistory = await historyResponse.value.json();
      } else if (historyResponse.status === 'rejected') {
        console.warn('Failed to fetch visitor history:', historyResponse.reason);
      }

      // 处理当前访问响应
      if (currentVisitResponse && 
          currentVisitResponse.status === 'fulfilled' && 
          currentVisitResponse.value && 
          currentVisitResponse.value.ok) {
        currentVisit = await currentVisitResponse.value.json();
      } else if (currentVisitResponse && currentVisitResponse.status === 'rejected') {
        console.warn('Failed to fetch current visit details:', currentVisitResponse.reason);
      }

      setServerData({
        visitorHistory,
        currentVisit,
        isLoading: false,
      });
      setHasServerData(true);
    } catch (error) {
      console.error('Error fetching server data:', error);
      setServerData({
        isLoading: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch server data',
          code: 'SERVER_FETCH_ERROR',
        },
      });
    }
  }, []);

  // 当客户端数据可用时，自动获取服务端数据
  useEffect(() => {
    if (clientFingerprint.data.result && !clientFingerprint.data.isLoading) {
      const visitorId = clientFingerprint.data.result.visitorId;
      const requestId = clientFingerprint.data.result.requestId;
      
      if (visitorId) {
        fetchServerData(visitorId, requestId);
      }
    }
  }, [clientFingerprint.data.result, clientFingerprint.data.isLoading, fetchServerData]);

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    // 先刷新客户端数据
    await clientFingerprint.refresh();
    
    // 如果有访问者 ID，也刷新服务端数据
    if (clientFingerprint.data.result?.visitorId) {
      await fetchServerData(
        clientFingerprint.data.result.visitorId,
        clientFingerprint.data.result.requestId
      );
    }
  }, [clientFingerprint, fetchServerData]);

  // 仅刷新服务端数据
  const refreshServerData = useCallback(async () => {
    if (clientFingerprint.data.result?.visitorId) {
      await fetchServerData(
        clientFingerprint.data.result.visitorId,
        clientFingerprint.data.result.requestId
      );
    }
  }, [clientFingerprint.data.result, fetchServerData]);

  const enhancedData: EnhancedFingerprintProData = {
    clientData: clientFingerprint.data,
    serverData,
    isLoading: clientFingerprint.data.isLoading || serverData.isLoading,
    hasServerData,
  };

  return {
    data: enhancedData,
    isAvailable: clientFingerprint.isAvailable,
    refresh: refreshAll,
    refreshServerData,
    // 便捷访问器
    visitorId: clientFingerprint.data.result?.visitorId,
    requestId: clientFingerprint.data.result?.requestId,
    confidence: clientFingerprint.data.result?.confidence?.score,
    // 服务端增强数据访问器
    visitorHistory: serverData.visitorHistory,
    currentVisit: serverData.currentVisit,
    hasExtendedData: hasServerData && !!serverData.currentVisit,
  };
}

/**
 * 获取增强的风险评估，结合客户端和服务端数据
 */
export function getEnhancedRiskLevel(
  clientData?: any,
  serverData?: VisitorHistoryVisit
): {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: string[];
  details: Record<string, any>;
} {
  const factors: string[] = [];
  const details: Record<string, any> = {};
  let score = 0;

  // 客户端基础检测
  if (clientData?.incognito) {
    factors.push('隐身模式');
    score += 10;
    details.incognito = true;
  }

  // 服务端增强检测
  if (serverData) {
    if (serverData.vpn?.result) {
      factors.push('VPN 使用');
      score += 25;
      details.vpn = serverData.vpn;
    }

    if (serverData.proxy?.result) {
      factors.push('代理服务器');
      score += 20;
      details.proxy = serverData.proxy;
    }

    if (serverData.tor?.result) {
      factors.push('Tor 网络');
      score += 30;
      details.tor = serverData.tor;
    }

    if (serverData.tampering?.result) {
      factors.push('浏览器篡改');
      score += 35;
      details.tampering = serverData.tampering;
    }

    if (serverData.virtualMachine?.result) {
      factors.push('虚拟机环境');
      score += 25;
      details.virtualMachine = serverData.virtualMachine;
    }

    if (serverData.developerTools?.result) {
      factors.push('开发者工具');
      score += 15;
      details.developerTools = serverData.developerTools;
    }

    if (serverData.highActivity?.result) {
      factors.push('高频活动');
      score += 20;
      details.highActivity = serverData.highActivity;
    }

    if (serverData.locationSpoofing?.result) {
      factors.push('位置欺骗');
      score += 25;
      details.locationSpoofing = serverData.locationSpoofing;
    }

    if (serverData.remoteControl?.result) {
      factors.push('远程控制');
      score += 40;
      details.remoteControl = serverData.remoteControl;
    }

    if (serverData.suspectScore && serverData.suspectScore > 50) {
      factors.push('可疑行为评分高');
      score += Math.min(serverData.suspectScore / 2, 30);
      details.suspectScore = serverData.suspectScore;
    }
  }

  // 确定风险等级
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 80) {
    level = 'critical';
  } else if (score >= 50) {
    level = 'high';
  } else if (score >= 20) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    level,
    score: Math.min(score, 100),
    factors,
    details,
  };
}
