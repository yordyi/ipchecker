import { NextRequest, NextResponse } from "next/server";

/**
 * IP信息API - 基于Fingerprint Pro数据
 * 注意：这个API主要用于服务端获取IP信息
 * 主要的IP和地理位置数据应该来自Fingerprint Pro客户端
 */
export async function GET(request: NextRequest) {
  try {
    // 从请求参数中获取Fingerprint Pro数据
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const requestId = searchParams.get('requestId');

    // 如果没有提供Fingerprint数据，返回基础IP信息
    if (!visitorId) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 request.headers.get('cf-connecting-ip') ||
                 '127.0.0.1';

      // 开发环境返回模拟数据
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          ip,
          country: '中国',
          countryCode: 'CN',
          region: '北京市',
          city: '北京',
          latitude: 39.9042,
          longitude: 116.4074,
          timezone: 'Asia/Shanghai',
          isp: '本地网络',
          asn: 'AS0 本地网络',
          source: 'development'
        });
      }

      // 生产环境下只返回基础IP
      return NextResponse.json({
        ip,
        source: 'basic',
        note: '完整的IP信息请通过Fingerprint Pro客户端获取'
      });
    }

    // 如果有Fingerprint数据，通过服务端API获取详细信息
    const secretKey = process.env.FINGERPRINT_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Fingerprint服务端API未配置' },
        { status: 500 }
      );
    }

    try {
      // 构建Fingerprint Pro服务端API URL
      const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION || 'us';
      const baseUrl = region === 'ap' ? 'https://ap.api.fpjs.io' :
                     region === 'eu' ? 'https://eu.api.fpjs.io' :
                     'https://api.fpjs.io';

      let url: string;
      if (requestId) {
        // 获取特定请求的详细信息
        url = `${baseUrl}/events/${requestId}`;
      } else {
        // 获取访问者历史（最新一条）
        url = `${baseUrl}/visitors/${visitorId}?limit=1`;
      }

      const response = await fetch(url, {
        headers: {
          'Auth-API-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Fingerprint API error: ${response.status}`);
      }

      const fingerprintData = await response.json();
      
      // 从Fingerprint数据中提取IP信息
      let visit;
      if (requestId) {
        visit = fingerprintData.products;
      } else {
        visit = fingerprintData.visits?.[0];
      }

      if (!visit) {
        return NextResponse.json(
          { error: '未找到访问数据' },
          { status: 404 }
        );
      }

      // 构建IP信息响应
      const ipInfo = {
        ip: visit.ip,
        country: visit.ipLocation?.country?.name || null,
        countryCode: visit.ipLocation?.country?.code || null,
        region: visit.ipLocation?.subdivisions?.[0]?.name || null,
        city: visit.ipLocation?.city?.name || null,
        latitude: visit.ipLocation?.latitude || null,
        longitude: visit.ipLocation?.longitude || null,
        timezone: visit.ipLocation?.timezone || null,
        accuracyRadius: visit.ipLocation?.accuracyRadius || null,
        postalCode: visit.ipLocation?.postalCode || null,
        source: 'fingerprint-pro',
        visitorId,
        requestId: visit.requestId,
        timestamp: visit.timestamp,
        confidence: visit.confidence?.score
      };

      return NextResponse.json(ipInfo);

    } catch (fingerprintError) {
      console.error('Fingerprint API错误:', fingerprintError);
      return NextResponse.json(
        { error: '获取Fingerprint数据失败', details: fingerprintError instanceof Error ? fingerprintError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API路由错误:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}