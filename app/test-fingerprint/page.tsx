"use client";

import { useEnhancedFingerprint } from "@/hooks/use-enhanced-fingerprint";
import { useDeviceInfo } from "@/hooks/use-device-info";
import { useState, useEffect } from "react";

export default function TestFingerprintPage() {
  const enhancedFingerprint = useEnhancedFingerprint();
  const deviceInfo = useDeviceInfo();
  const [ipInfo, setIpInfo] = useState<unknown>(null);
  const [ipLoading, setIpLoading] = useState(true);

  // 测试IP API
  useEffect(() => {
    fetch('/api/ip-info')
      .then(res => res.json())
      .then(data => {
        console.log('IP API Response:', data);
        setIpInfo(data);
        setIpLoading(false);
      })
      .catch(err => {
        console.error('IP API Error:', err);
        setIpLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Fingerprint API 测试页面</h1>
      
      {/* IP信息测试 */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">IP 信息 API</h2>
        {ipLoading ? (
          <p>加载中...</p>
        ) : (
          <pre className="text-sm bg-gray-700 p-3 rounded overflow-auto">
            {JSON.stringify(ipInfo, null, 2)}
          </pre>
        )}
      </div>

      {/* 设备信息测试 */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">设备信息</h2>
        {deviceInfo ? (
          <pre className="text-sm bg-gray-700 p-3 rounded overflow-auto">
            {JSON.stringify(deviceInfo, null, 2)}
          </pre>
        ) : (
          <p>获取中...</p>
        )}
      </div>

      {/* Fingerprint Pro客户端数据 */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Fingerprint Pro 客户端数据</h2>
        <div className="space-y-2 mb-4">
          <p>加载状态: {enhancedFingerprint.data.clientData?.isLoading ? '是' : '否'}</p>
          <p>有错误: {enhancedFingerprint.data.clientData?.error ? '是' : '否'}</p>
          <p>有数据: {enhancedFingerprint.data.clientData?.result ? '是' : '否'}</p>
          <p>访问者ID: {enhancedFingerprint.visitorId || '无'}</p>
        </div>
        
        {enhancedFingerprint.data.clientData?.error && (
          <div className="mb-4 p-3 bg-red-900 rounded">
            <h3 className="font-semibold text-red-300">错误信息:</h3>
            <p>{enhancedFingerprint.data.clientData.error.message}</p>
          </div>
        )}
        
        {enhancedFingerprint.data.clientData?.result && (
          <pre className="text-sm bg-gray-700 p-3 rounded overflow-auto max-h-96">
            {JSON.stringify(enhancedFingerprint.data.clientData.result, null, 2)}
          </pre>
        )}
      </div>

      {/* 服务端增强数据 */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">服务端增强数据</h2>
        <div className="space-y-2 mb-4">
          <p>有服务端数据: {enhancedFingerprint.data.hasServerData ? '是' : '否'}</p>
          <p>服务端加载中: {enhancedFingerprint.data.serverData?.isLoading ? '是' : '否'}</p>
          <p>服务端错误: {enhancedFingerprint.data.serverData?.error ? '是' : '否'}</p>
        </div>
        
        {enhancedFingerprint.data.serverData?.error && (
          <div className="mb-4 p-3 bg-red-900 rounded">
            <h3 className="font-semibold text-red-300">服务端错误:</h3>
            <p>{enhancedFingerprint.data.serverData.error.message}</p>
          </div>
        )}
        
        {enhancedFingerprint.data.serverData && (
          <pre className="text-sm bg-gray-700 p-3 rounded overflow-auto max-h-96">
            {JSON.stringify(enhancedFingerprint.data.serverData, null, 2)}
          </pre>
        )}
      </div>

      {/* 刷新按钮 */}
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          刷新页面
        </button>
        <button
          onClick={enhancedFingerprint.refresh}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          刷新 Fingerprint 数据
        </button>
      </div>
    </div>
  );
}