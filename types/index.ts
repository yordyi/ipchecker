export interface IpInfo {
  ip: string;
  ipv6?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  asn?: string;
  connectionType?: string;
}

export interface DeviceInfo {
  os: string;
  osVersion?: string;
  browser: string;
  browserVersion?: string;
  deviceType: string;
  userAgent: string;
  language: string;
  languages: string[];
  screenResolution: string;
  pixelRatio: number;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
}

export interface BrowserFingerprint {
  // 现有本地检测字段
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  availableFonts: string[];
  plugins: string[];
  webglRenderer?: string;
  webglVendor?: string;
  webglExtensions?: string[];
  hardwareConcurrency?: number;
  memory?: number;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  javaEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
  indexedDBEnabled: boolean;
  adBlockEnabled: boolean;
  touchSupport: boolean;
  maxTouchPoints: number;
  speechSynthesisVoices: number;
  
  // Fingerprint Pro 增强字段
  visitorId?: string;           // 唯一访问者ID
  requestId?: string;           // 请求ID
  confidence?: number;          // 识别置信度 (0-1)
  firstSeenAt?: string;         // 首次访问时间
  lastSeenAt?: string;          // 最近访问时间
  visitorFound?: boolean;       // 是否为已知访问者
  isIncognito?: boolean;        // 隐身模式检测（Pro版本更准确）
  vpnDetected?: boolean;        // VPN检测
  proxyDetected?: boolean;      // 代理检测
  torDetected?: boolean;        // Tor检测
  tamperingDetected?: boolean;  // 篡改检测
  suspectScore?: number;        // 可疑活动评分 (0-100)
  accuracyEnhanced?: boolean;   // 标识是否经过Pro增强
  proDataSource?: 'local' | 'pro' | 'hybrid'; // 数据来源
  proErrorMessage?: string;     // Pro API错误信息（如果有）
}

export interface HTTPHeaders {
  userAgent: string;
  accept: string;
  acceptLanguage: string;
  acceptEncoding: string;
  connection: string;
  upgradeInsecureRequests?: string;
  secFetchSite?: string;
  secFetchMode?: string;
  secFetchUser?: string;
  secFetchDest?: string;
  referer?: string;
  origin?: string;
  [key: string]: string | undefined;
}

export interface WebRTCInfo {
  publicIPs: string[];
  localIPs: string[];
  supported: boolean;
  candidates: RTCIceCandidateInit[];
  leakDetected: boolean;
  connection?: {
    rtt?: number;
    downlink?: number;
    effectiveType?: string;
    saveData?: boolean;
  };
}

export interface SystemHardwareInfo {
  platform: string;
  cpuClass?: string;
  oscpu?: string;
  buildID?: string;
  product?: string;
  productSub?: string;
  vendor?: string;
  vendorSub?: string;
  maxTouchPoints: number;
  msMaxTouchPoints?: number;
  pointerEnabled?: boolean;
  msPointerEnabled?: boolean;
  mediaDevices?: number;
  bluetooth?: boolean;
  usb?: boolean;
}

export interface HTML5Features {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webSQL: boolean;
  canvas: boolean;
  svg: boolean;
  webGL: boolean;
  webGL2: boolean;
  webWorkers: boolean;
  sharedWorkers: boolean;
  serviceWorkers: boolean;
  geolocation: boolean;
  notifications: boolean;
  vibration: boolean;
  battery: boolean;
  gamepad: boolean;
  webRTC: boolean;
  webAudio: boolean;
  speechSynthesis: boolean;
  speechRecognition: boolean;
}

export interface SSLTLSInfo {
  protocol: string;
  cipher?: string;
  keyExchange?: string;
  authentication?: string;
  encryption?: string;
  mac?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  fingerprint?: string;
}

export interface BatteryInfo {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  supported: boolean;
}

// Fingerprint Pro 相关类型
export interface FingerprintProResult {
  visitorId: string;
  requestId: string;
  confidence: {
    score: number;
    comment?: string;
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
}

export interface FingerprintProExtendedResult extends FingerprintProResult {
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
  os: {
    name: string;
    version: string;
  };
  osVersion: string;
  device: string;
  browser: {
    name: string;
    version: string;
  };
  browserVersion: string;
  browserDetails: {
    browserName: string;
    browserMajorVersion: string;
    browserFullVersion: string;
    os: string;
    osVersion: string;
    device: string;
    userAgent: string;
  };
  incognito: boolean;
  userAgent: string;
  rootApps?: {
    result: boolean;
  };
  emulator?: {
    result: boolean;
  };
  clonedApp?: {
    result: boolean;
  };
  factoryReset?: {
    timestamp: number;
  };
  jailbroken?: {
    result: boolean;
  };
  frida?: {
    result: boolean;
  };
  vpn?: {
    result: boolean;
    originTimezone?: string;
    originCountry?: string;
    methods?: {
      timezoneMismatch: boolean;
      publicVPN: boolean;
      auxiliaryMobile: boolean;
      osMismatch: boolean;
    };
  };
  proxy?: {
    result: boolean;
  };
  tor?: {
    result: boolean;
  };
  tampering?: {
    result: boolean;
    anomalyScore: number;
  };
  highActivity?: {
    result: boolean;
    dailyRequests: number;
  };
  locationSpoofing?: {
    result: boolean;
  };
  suspectScore?: number;
  rawDeviceAttributes?: {
    [key: string]: unknown;
  };
  linkedId?: string;
  tag?: {
    [key: string]: unknown;
  };
}

export interface FingerprintProData {
  result?: FingerprintProExtendedResult;
  error?: {
    message: string;
    code?: string;
  };
  isLoading: boolean;
}

// 服务端增强数据类型
export interface FingerprintServerData {
  visitorHistory?: VisitorHistoryResponse;
  currentVisit?: VisitorHistoryVisit;
  isLoading: boolean;
  error?: {
    message: string;
    code?: string;
  };
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
  // 扩展检测数据（仅服务端可用）
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

// 增强的 Fingerprint Pro 数据，结合客户端和服务端数据
export interface EnhancedFingerprintProData {
  clientData?: FingerprintProData;
  serverData?: FingerprintServerData;
  isLoading: boolean;
  hasServerData: boolean;
}

export interface NetworkInfo {
  ip: IpInfo;
  device: DeviceInfo;
  fingerprint: BrowserFingerprint;
  fingerprintPro?: FingerprintProData;
  httpHeaders: HTTPHeaders;
  webrtc: WebRTCInfo;
  systemHardware: SystemHardwareInfo;
  html5Features: HTML5Features;
  sslInfo?: SSLTLSInfo;
  batteryInfo?: BatteryInfo;
  timestamp: number;
}