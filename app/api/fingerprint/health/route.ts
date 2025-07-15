import { NextResponse } from "next/server";

/**
 * Fingerprint Pro API 健康检查端点
 * 测试 API 连接和配置是否正确
 */
export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY;
    const secretKey = process.env.FINGERPRINT_SECRET_KEY;
    const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION || 'ap';

    // 检查基本配置
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: '客户端 API 密钥未配置',
        details: 'NEXT_PUBLIC_FINGERPRINT_API_KEY 环境变量缺失'
      }, { status: 500 });
    }

    if (!secretKey) {
      return NextResponse.json({
        status: 'warning',
        message: '服务端 API 密钥未配置',
        details: 'FINGERPRINT_SECRET_KEY 环境变量缺失，服务端增强功能将不可用',
        clientApiStatus: 'ok'
      });
    }

    // 构建 endpoint
    const getEndpoint = (region: string) => {
      switch (region) {
        case 'ap':
          return 'https://ap.api.fpjs.io';
        case 'eu':
          return 'https://eu.api.fpjs.io';
        case 'us':
        default:
          return 'https://api.fpjs.io';
      }
    };

    const endpoint = getEndpoint(region);

    // 测试服务端 API 连接
    try {
      const testUrl = `${endpoint}/visitors?limit=1`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Auth-API-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      const healthStatus = {
        status: 'ok',
        message: 'Fingerprint Pro API 连接正常',
        details: {
          clientApiKey: apiKey ? `${apiKey.substring(0, 8)}...` : '未配置',
          serverApiKey: secretKey ? `${secretKey.substring(0, 8)}...` : '未配置',
          region,
          endpoint,
          serverApiStatus: response.ok ? 'ok' : 'error',
          serverApiStatusCode: response.status
        }
      };

      return NextResponse.json(healthStatus);
    } catch (serverError) {
      return NextResponse.json({
        status: 'partial',
        message: '客户端 API 可用，服务端 API 连接失败',
        details: {
          clientApiKey: apiKey ? `${apiKey.substring(0, 8)}...` : '未配置',
          serverApiKey: secretKey ? `${secretKey.substring(0, 8)}...` : '未配置',
          region,
          endpoint,
          serverApiStatus: 'error',
          serverError: serverError instanceof Error ? serverError.message : 'Unknown error'
        }
      });
    }

  } catch (error) {
    console.error('Fingerprint API 健康检查失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '健康检查失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}