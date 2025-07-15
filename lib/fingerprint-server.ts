/**
 * Fingerprint Pro 服务端 API 客户端
 * 用于安全地调用 Fingerprint Pro 的服务端 API
 */

export interface FingerprintServerConfig {
  secretKey: string;
  region?: string;
  baseUrl?: string;
}

export interface VisitorHistoryRequest {
  visitor_id: string;
  request_id?: string;
  linked_id?: string;
  limit?: number;
  before?: number;
}

export interface VisitorHistoryResponse {
  visitorId: string;
  visits: VisitorHistoryVisit[];
  lastTimestamp?: number;
  paginationKey?: string;
}

export interface VisitorHistoryVisit {
  requestId: string;
  browserDetails: {
    browserName: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    userAgent: string;
  };
  incognito: boolean;
  ip: string;
  ipLocation?: {
    accuracyRadius?: number;
    latitude?: number;
    longitude?: number;
    postalCode?: string;
    timezone?: string;
    city?: {
      name?: string;
    };
    country?: {
      code?: string;
      name?: string;
    };
    continent?: {
      code?: string;
      name?: string;
    };
    subdivisions?: Array<{
      isoCode?: string;
      name?: string;
    }>;
  };
  timestamp: number;
  time: string;
  url: string;
  tag?: Record<string, unknown>;
  linkedId?: string;
  confidence: {
    score: number;
    revision?: string;
  };
  visitorFound: boolean;
  firstSeenAt: {
    global: string | null;
    subscription: string | null;
  };
  lastSeenAt: {
    global: string | null;
    subscription: string | null;
  };
  // 扩展检测数据
  vpn?: {
    result: boolean;
    confidence: string;
    methods: {
      timezoneMismatch: boolean;
      publicVPN: boolean;
      auxiliaryMobile: boolean;
      osMismatch: boolean;
    };
  };
  proxy?: {
    result: boolean;
    confidence: string;
  };
  tor?: {
    result: boolean;
    confidence: string;
  };
  tampering?: {
    result: boolean;
    confidence: string;
  };
  clonedApp?: {
    result: boolean;
    confidence: string;
  };
  factoryReset?: {
    result: boolean;
    confidence: string;
  };
  jailbroken?: {
    result: boolean;
    confidence: string;
  };
  frida?: {
    result: boolean;
    confidence: string;
  };
  privacySettings?: {
    result: boolean;
    confidence: string;
  };
  virtualMachine?: {
    result: boolean;
    confidence: string;
  };
  rawDeviceAttributes?: {
    result: boolean;
    confidence: string;
  };
  highActivity?: {
    result: boolean;
    confidence: string;
    dailyRequests: number;
  };
  locationSpoofing?: {
    result: boolean;
    confidence: string;
  };
  suspectScore?: number;
  remoteControl?: {
    result: boolean;
    confidence: string;
  };
  velocity?: {
    result: boolean;
    confidence: string;
    intervals: Array<{
      interval: string;
      count: number;
    }>;
  };
  developerTools?: {
    result: boolean;
    confidence: string;
  };
}

export interface FingerprintServerError {
  error: {
    code: string;
    message: string;
  };
}

export class FingerprintServerClient {
  private config: FingerprintServerConfig;
  private baseUrl: string;

  constructor(config: FingerprintServerConfig) {
    this.config = config;
    
    // 根据区域设置基础 URL
    const region = config.region || 'us';
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else if (region === 'ap') {
      this.baseUrl = 'https://ap.api.fpjs.io';
    } else if (region === 'eu') {
      this.baseUrl = 'https://eu.api.fpjs.io';
    } else {
      this.baseUrl = 'https://api.fpjs.io';
    }
  }

  /**
   * 获取访问者的历史记录和详细信息
   */
  async getVisitorHistory(params: VisitorHistoryRequest): Promise<VisitorHistoryResponse> {
    const url = new URL('/visitors/' + params.visitor_id, this.baseUrl);
    
    // 添加查询参数
    if (params.request_id) {
      url.searchParams.append('request_id', params.request_id);
    }
    if (params.linked_id) {
      url.searchParams.append('linked_id', params.linked_id);
    }
    if (params.limit) {
      url.searchParams.append('limit', params.limit.toString());
    }
    if (params.before) {
      url.searchParams.append('before', params.before.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Auth-API-Key': this.config.secretKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: FingerprintServerError = await response.json();
      throw new Error(`Fingerprint Server API Error: ${errorData.error.code} - ${errorData.error.message}`);
    }

    return await response.json();
  }

  /**
   * 获取单个访问记录的详细信息
   */
  async getVisitDetails(requestId: string): Promise<VisitorHistoryVisit> {
    const url = new URL('/events/' + requestId, this.baseUrl);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Auth-API-Key': this.config.secretKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: FingerprintServerError = await response.json();
      throw new Error(`Fingerprint Server API Error: ${errorData.error.code} - ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.products;
  }
}

/**
 * 创建 Fingerprint 服务端客户端实例
 */
export function createFingerprintServerClient(): FingerprintServerClient | null {
  const secretKey = process.env.FINGERPRINT_SECRET_KEY;
  const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION;

  if (!secretKey) {
    console.warn('FINGERPRINT_SECRET_KEY not found in environment variables');
    return null;
  }

  return new FingerprintServerClient({
    secretKey,
    region,
  });
}
