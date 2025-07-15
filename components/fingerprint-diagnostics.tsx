"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface DiagnosticsData {
  status: 'ok' | 'warning' | 'error' | 'partial';
  message: string;
  details: {
    clientApiKey?: string;
    serverApiKey?: string;
    region?: string;
    endpoint?: string;
    serverApiStatus?: string;
    serverApiStatusCode?: number;
    serverError?: string;
  };
}

export function FingerprintDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fingerprint/health');
      const data = await response.json();
      setDiagnostics(data);
    } catch {
      setDiagnostics({
        status: 'error',
        message: '无法连接到诊断 API',
        details: {}
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
      default:
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'border-green-500/20 bg-green-500/10';
      case 'warning':
      case 'partial':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'error':
      default:
        return 'border-red-500/20 bg-red-500/10';
    }
  };

  if (!diagnostics && !loading) return null;

  return (
    <div className={`mt-4 p-4 rounded-lg border ${diagnostics ? getStatusColor(diagnostics.status) : 'border-gray-500/20 bg-gray-500/10'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <span className="font-medium text-gray-200">API 诊断</span>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          title="重新检查"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">检查中...</span>
        </div>
      ) : diagnostics ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(diagnostics.status)}
            <span className="text-sm text-gray-200">{diagnostics.message}</span>
          </div>

          {diagnostics.details && (
            <div className="text-xs text-gray-400 space-y-1">
              {diagnostics.details.clientApiKey && (
                <div>客户端密钥: {diagnostics.details.clientApiKey}</div>
              )}
              {diagnostics.details.serverApiKey && (
                <div>服务端密钥: {diagnostics.details.serverApiKey}</div>
              )}
              {diagnostics.details.region && (
                <div>区域: {diagnostics.details.region}</div>
              )}
              {diagnostics.details.endpoint && (
                <div>端点: {diagnostics.details.endpoint}</div>
              )}
              {diagnostics.details.serverApiStatus && (
                <div>服务端状态: {String(diagnostics.details.serverApiStatus)}</div>
              )}
              {diagnostics.details.serverApiStatusCode && (
                <div>状态码: {String(diagnostics.details.serverApiStatusCode)}</div>
              )}
              {diagnostics.details.serverError && (
                <div className="text-red-400">服务端错误: {diagnostics.details.serverError}</div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}