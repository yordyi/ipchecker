import { NextRequest, NextResponse } from 'next/server';
import { createFingerprintServerClient } from '@/lib/fingerprint-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params;
    const { searchParams } = new URL(request.url);
    
    // 验证 visitorId
    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid visitor ID' },
        { status: 400 }
      );
    }

    // 创建服务端客户端
    const client = createFingerprintServerClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Fingerprint server client not configured' },
        { status: 500 }
      );
    }

    // 解析查询参数
    const requestId = searchParams.get('request_id') || undefined;
    const linkedId = searchParams.get('linked_id') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const before = searchParams.get('before') ? parseInt(searchParams.get('before')!) : undefined;

    // 获取访问者历史记录
    const visitorHistory = await client.getVisitorHistory({
      visitor_id: visitorId,
      request_id: requestId,
      linked_id: linkedId,
      limit: limit || 10, // 默认限制为 10 条记录
      before,
    });

    return NextResponse.json(visitorHistory);
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    
    if (error instanceof Error) {
      // 检查是否是 Fingerprint API 错误
      if (error.message.includes('Fingerprint Server API Error')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
