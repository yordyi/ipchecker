import { NextRequest, NextResponse } from 'next/server';
import { createFingerprintServerClient } from '@/lib/fingerprint-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    
    // 验证 requestId
    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request ID' },
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

    // 获取访问记录详细信息
    const visitDetails = await client.getVisitDetails(requestId);

    return NextResponse.json(visitDetails);
  } catch (error) {
    console.error('Error fetching visit details:', error);
    
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
