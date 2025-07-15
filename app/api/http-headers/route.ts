import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string> = {};
    
    // 获取所有请求头
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 格式化常见的请求头
    const httpHeaders = {
      userAgent: headers['user-agent'] || '',
      accept: headers['accept'] || '',
      acceptLanguage: headers['accept-language'] || '',
      acceptEncoding: headers['accept-encoding'] || '',
      connection: headers['connection'] || '',
      upgradeInsecureRequests: headers['upgrade-insecure-requests'],
      secFetchSite: headers['sec-fetch-site'],
      secFetchMode: headers['sec-fetch-mode'],
      secFetchUser: headers['sec-fetch-user'],
      secFetchDest: headers['sec-fetch-dest'],
      referer: headers['referer'],
      origin: headers['origin'],
      host: headers['host'],
      xForwardedFor: headers['x-forwarded-for'],
      xRealIp: headers['x-real-ip'],
      cfConnectingIp: headers['cf-connecting-ip'],
      cfRay: headers['cf-ray'],
      cfIpCountry: headers['cf-ipcountry'],
      xForwardedProto: headers['x-forwarded-proto'],
      xForwardedPort: headers['x-forwarded-port'],
      dnt: headers['dnt'],
      pragma: headers['pragma'],
      cacheControl: headers['cache-control'],
      ifModifiedSince: headers['if-modified-since'],
      ifNoneMatch: headers['if-none-match'],
      acceptCharset: headers['accept-charset'],
      te: headers['te'],
      via: headers['via'],
      xRequestedWith: headers['x-requested-with'],
      authorization: headers['authorization'] ? '[隐藏]' : undefined,
      cookie: headers['cookie'] ? '[隐藏]' : undefined,
      // 包含所有原始请求头（除了敏感信息）
      rawHeaders: Object.fromEntries(
        Object.entries(headers).filter(([key]) => 
          !['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())
        )
      )
    };

    return NextResponse.json(httpHeaders);
  } catch (error) {
    console.error('获取HTTP请求头时出错:', error);
    return NextResponse.json(
      { error: '获取HTTP请求头失败' },
      { status: 500 }
    );
  }
}