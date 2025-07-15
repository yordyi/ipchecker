/**
 * Fingerprint Pro 字段映射配置
 * 为所有 Fingerprint Pro API 字段提供统一的显示配置和元数据
 */

import { LucideIcon, 
  Globe, MapPin, Monitor, Smartphone, Shield, 
  AlertTriangle, Clock, Hash, User, Eye, Wifi as VpnIcon,
  Activity, Bug, HardDrive, Navigation,
  Chrome, Settings, Lock, Unlock,
  Server, Database, Code, Gauge, Star,
  Zap, Flag, Search, Calendar, BarChart3
} from 'lucide-react';

/** 字段分组类型 */
export type FieldGroup = '基础信息' | '设备信息' | '网络信息' | '风险检测' | '浏览器信息' | '系统信息' | '高级检测' | '其他信息';

/** 字段值类型 */
export type FieldValueType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'url' | 'ip' | 'score' | 'confidence';

/** 字段显示配置 */
export interface FieldConfig {
  /** 字段路径 (支持嵌套，如 'ipLocation.country.name') */
  key: string;
  /** 中文显示标签 */
  label: string;
  /** 英文显示标签 */
  labelEn?: string;
  /** 字段描述 */
  description?: string;
  /** 字段分组 */
  group: FieldGroup;
  /** 是否为关键字段（风控/合规重要） */
  critical: boolean;
  /** 字段值类型 */
  valueType: FieldValueType;
  /** 显示图标 */
  icon?: LucideIcon;
  /** 是否可复制 */
  copyable?: boolean;
  /** 是否隐藏空值 */
  hideEmpty?: boolean;
  /** 格式化函数名 */
  formatter?: string;
  /** 风险等级计算权重 */
  riskWeight?: number;
}

/** 所有字段配置映射 */
export const FIELD_MAPPINGS: Record<string, FieldConfig> = {
  // ==================== 基础信息 ====================
  'visitorId': {
    key: 'visitorId',
    label: '访问者ID',
    labelEn: 'Visitor ID',
    description: '唯一标识访问者的永久ID',
    group: '基础信息',
    critical: true,
    valueType: 'string',
    icon: User,
    copyable: true,
  },
  'requestId': {
    key: 'requestId',
    label: '请求ID',
    labelEn: 'Request ID',
    description: '当前请求的唯一标识符',
    group: '基础信息',
    critical: false,
    valueType: 'string',
    icon: Hash,
    copyable: true,
  },
  'confidence.score': {
    key: 'confidence.score',
    label: '识别置信度',
    labelEn: 'Confidence Score',
    description: '访问者识别的准确度评分',
    group: '基础信息',
    critical: true,
    valueType: 'confidence',
    icon: Star,
    formatter: 'formatConfidence',
  },
  'visitorFound': {
    key: 'visitorFound',
    label: '已知访问者',
    labelEn: 'Visitor Found',
    description: '是否为已知的访问者',
    group: '基础信息',
    critical: false,
    valueType: 'boolean',
    icon: Search,
    formatter: 'formatBoolean',
  },
  'firstSeenAt.global': {
    key: 'firstSeenAt.global',
    label: '首次访问时间',
    labelEn: 'First Seen At',
    description: '全局范围内首次检测到该访问者的时间',
    group: '基础信息',
    critical: false,
    valueType: 'date',
    icon: Calendar,
    formatter: 'formatTimestamp',
  },
  'lastSeenAt.global': {
    key: 'lastSeenAt.global',
    label: '最近访问时间',
    labelEn: 'Last Seen At',
    description: '全局范围内最近一次检测到该访问者的时间',
    group: '基础信息',
    critical: false,
    valueType: 'date',
    icon: Clock,
    formatter: 'formatTimestamp',
  },

  // ==================== 网络信息 ====================
  'ip': {
    key: 'ip',
    label: 'IP地址',
    labelEn: 'IP Address',
    description: '访问者的IP地址',
    group: '网络信息',
    critical: true,
    valueType: 'ip',
    icon: Globe,
    copyable: true,
  },
  'ipLocation.country.name': {
    key: 'ipLocation.country.name',
    label: '国家',
    labelEn: 'Country',
    description: 'IP地址对应的国家',
    group: '网络信息',
    critical: true,
    valueType: 'string',
    icon: Flag,
    copyable: true,
  },
  'ipLocation.country.code': {
    key: 'ipLocation.country.code',
    label: '国家代码',
    labelEn: 'Country Code',
    description: 'ISO 3166-1 alpha-2 国家代码',
    group: '网络信息',
    critical: false,
    valueType: 'string',
    icon: Flag,
    copyable: true,
  },
  'ipLocation.city.name': {
    key: 'ipLocation.city.name',
    label: '城市',
    labelEn: 'City',
    description: 'IP地址对应的城市',
    group: '网络信息',
    critical: false,
    valueType: 'string',
    icon: MapPin,
    copyable: true,
  },
  'ipLocation.latitude': {
    key: 'ipLocation.latitude',
    label: '纬度',
    labelEn: 'Latitude',
    description: 'IP地址对应的地理纬度',
    group: '网络信息',
    critical: false,
    valueType: 'number',
    icon: Navigation,
    formatter: 'formatCoordinate',
  },
  'ipLocation.longitude': {
    key: 'ipLocation.longitude',
    label: '经度',
    labelEn: 'Longitude',
    description: 'IP地址对应的地理经度',
    group: '网络信息',
    critical: false,
    valueType: 'number',
    icon: Navigation,
    formatter: 'formatCoordinate',
  },
  'ipLocation.timezone': {
    key: 'ipLocation.timezone',
    label: '时区',
    labelEn: 'Timezone',
    description: 'IP地址对应的时区',
    group: '网络信息',
    critical: false,
    valueType: 'string',
    icon: Clock,
    copyable: true,
  },
  'ipLocation.accuracyRadius': {
    key: 'ipLocation.accuracyRadius',
    label: '定位精度半径',
    labelEn: 'Accuracy Radius',
    description: '地理位置的精度半径（公里）',
    group: '网络信息',
    critical: false,
    valueType: 'number',
    icon: MapPin,
    formatter: 'formatDistance',
  },

  // ==================== 浏览器信息 ====================
  'browser.name': {
    key: 'browser.name',
    label: '浏览器',
    labelEn: 'Browser',
    description: '浏览器名称',
    group: '浏览器信息',
    critical: false,
    valueType: 'string',
    icon: Chrome,
    copyable: true,
  },
  'browser.version': {
    key: 'browser.version',
    label: '浏览器版本',
    labelEn: 'Browser Version',
    description: '浏览器版本号',
    group: '浏览器信息',
    critical: false,
    valueType: 'string',
    icon: Settings,
    copyable: true,
  },
  'browserDetails.browserName': {
    key: 'browserDetails.browserName',
    label: '浏览器详情',
    labelEn: 'Browser Details',
    description: '详细的浏览器信息',
    group: '浏览器信息',
    critical: false,
    valueType: 'string',
    icon: Chrome,
    copyable: true,
  },
  'browserDetails.browserFullVersion': {
    key: 'browserDetails.browserFullVersion',
    label: '完整版本号',
    labelEn: 'Full Version',
    description: '浏览器完整版本号',
    group: '浏览器信息',
    critical: false,
    valueType: 'string',
    icon: Settings,
    copyable: true,
  },
  'userAgent': {
    key: 'userAgent',
    label: 'User Agent',
    labelEn: 'User Agent',
    description: '浏览器用户代理字符串',
    group: '浏览器信息',
    critical: false,
    valueType: 'string',
    icon: Code,
    copyable: true,
    hideEmpty: false,
  },
  'incognito': {
    key: 'incognito',
    label: '隐身模式',
    labelEn: 'Incognito Mode',
    description: '是否处于隐身/私人浏览模式',
    group: '浏览器信息',
    critical: true,
    valueType: 'boolean',
    icon: Eye,
    formatter: 'formatBoolean',
    riskWeight: 10,
  },

  // ==================== 设备信息 ====================
  'os.name': {
    key: 'os.name',
    label: '操作系统',
    labelEn: 'Operating System',
    description: '设备操作系统名称',
    group: '设备信息',
    critical: false,
    valueType: 'string',
    icon: Monitor,
    copyable: true,
  },
  'os.version': {
    key: 'os.version',
    label: '系统版本',
    labelEn: 'OS Version',
    description: '操作系统版本',
    group: '设备信息',
    critical: false,
    valueType: 'string',
    icon: Settings,
    copyable: true,
  },
  'device': {
    key: 'device',
    label: '设备类型',
    labelEn: 'Device Type',
    description: '设备类型分类',
    group: '设备信息',
    critical: false,
    valueType: 'string',
    icon: Smartphone,
    copyable: true,
  },
  'browserDetails.device': {
    key: 'browserDetails.device',
    label: '设备详情',
    labelEn: 'Device Details',
    description: '详细的设备信息',
    group: '设备信息',
    critical: false,
    valueType: 'string',
    icon: Smartphone,
    copyable: true,
  },

  // ==================== 风险检测 ====================
  'vpn.result': {
    key: 'vpn.result',
    label: 'VPN检测',
    labelEn: 'VPN Detection',
    description: '是否检测到VPN使用',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: VpnIcon,
    formatter: 'formatRiskBoolean',
    riskWeight: 25,
  },
  'vpn.methods.timezoneMismatch': {
    key: 'vpn.methods.timezoneMismatch',
    label: '时区不匹配',
    labelEn: 'Timezone Mismatch',
    description: 'VPN检测：时区与IP地理位置不匹配',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: Clock,
    formatter: 'formatBoolean',
  },
  'vpn.methods.publicVPN': {
    key: 'vpn.methods.publicVPN',
    label: '公共VPN',
    labelEn: 'Public VPN',
    description: 'VPN检测：检测到公共VPN服务',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: VpnIcon,
    formatter: 'formatBoolean',
  },
  'proxy.result': {
    key: 'proxy.result',
    label: '代理检测',
    labelEn: 'Proxy Detection',
    description: '是否检测到代理服务器使用',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: Server,
    formatter: 'formatRiskBoolean',
    riskWeight: 20,
  },
  'tor.result': {
    key: 'tor.result',
    label: 'Tor网络检测',
    labelEn: 'Tor Detection',
    description: '是否检测到Tor匿名网络使用',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: Shield,
    formatter: 'formatRiskBoolean',
    riskWeight: 30,
  },
  'tampering.result': {
    key: 'tampering.result',
    label: '浏览器篡改',
    labelEn: 'Browser Tampering',
    description: '是否检测到浏览器篡改行为',
    group: '风险检测',
    critical: true,
    valueType: 'boolean',
    icon: Bug,
    formatter: 'formatRiskBoolean',
    riskWeight: 35,
  },
  'tampering.anomalyScore': {
    key: 'tampering.anomalyScore',
    label: '异常评分',
    labelEn: 'Anomaly Score',
    description: '浏览器篡改的异常程度评分',
    group: '风险检测',
    critical: true,
    valueType: 'score',
    icon: Gauge,
    formatter: 'formatScore',
  },
  'suspectScore': {
    key: 'suspectScore',
    label: '可疑活动评分',
    labelEn: 'Suspect Score',
    description: '综合可疑活动评分 (0-100)',
    group: '风险检测',
    critical: true,
    valueType: 'score',
    icon: AlertTriangle,
    formatter: 'formatScore',
  },

  // ==================== 高级检测 ====================
  'highActivity.result': {
    key: 'highActivity.result',
    label: '高频活动',
    labelEn: 'High Activity',
    description: '是否检测到异常高频的访问活动',
    group: '高级检测',
    critical: true,
    valueType: 'boolean',
    icon: Activity,
    formatter: 'formatRiskBoolean',
    riskWeight: 20,
  },
  'highActivity.dailyRequests': {
    key: 'highActivity.dailyRequests',
    label: '日请求数',
    labelEn: 'Daily Requests',
    description: '当日的请求次数',
    group: '高级检测',
    critical: false,
    valueType: 'number',
    icon: BarChart3,
    formatter: 'formatNumber',
  },
  'locationSpoofing.result': {
    key: 'locationSpoofing.result',
    label: '位置欺骗',
    labelEn: 'Location Spoofing',
    description: '是否检测到地理位置欺骗',
    group: '高级检测',
    critical: true,
    valueType: 'boolean',
    icon: Navigation,
    formatter: 'formatRiskBoolean',
    riskWeight: 25,
  },
  'virtualMachine.result': {
    key: 'virtualMachine.result',
    label: '虚拟机检测',
    labelEn: 'Virtual Machine',
    description: '是否检测到虚拟机环境',
    group: '高级检测',
    critical: true,
    valueType: 'boolean',
    icon: HardDrive,
    formatter: 'formatRiskBoolean',
    riskWeight: 25,
  },
  'developerTools.result': {
    key: 'developerTools.result',
    label: '开发者工具',
    labelEn: 'Developer Tools',
    description: '是否检测到开发者工具的使用',
    group: '高级检测',
    critical: false,
    valueType: 'boolean',
    icon: Code,
    formatter: 'formatBoolean',
    riskWeight: 15,
  },
  'remoteControl.result': {
    key: 'remoteControl.result',
    label: '远程控制',
    labelEn: 'Remote Control',
    description: '是否检测到远程控制软件',
    group: '高级检测',
    critical: true,
    valueType: 'boolean',
    icon: Monitor,
    formatter: 'formatRiskBoolean',
    riskWeight: 40,
  },
  'velocity.result': {
    key: 'velocity.result',
    label: '速度检测',
    labelEn: 'Velocity Detection',
    description: '是否检测到异常的访问速度模式',
    group: '高级检测',
    critical: true,
    valueType: 'boolean',
    icon: Zap,
    formatter: 'formatRiskBoolean',
    riskWeight: 20,
  },

  // ==================== 系统信息 ====================
  'rootApps.result': {
    key: 'rootApps.result',
    label: 'Root应用检测',
    labelEn: 'Root Apps Detection',
    description: '是否检测到Root权限应用',
    group: '系统信息',
    critical: true,
    valueType: 'boolean',
    icon: Unlock,
    formatter: 'formatRiskBoolean',
    riskWeight: 30,
  },
  'emulator.result': {
    key: 'emulator.result',
    label: '模拟器检测',
    labelEn: 'Emulator Detection',
    description: '是否在模拟器环境中运行',
    group: '系统信息',
    critical: true,
    valueType: 'boolean',
    icon: Smartphone,
    formatter: 'formatRiskBoolean',
    riskWeight: 25,
  },
  'clonedApp.result': {
    key: 'clonedApp.result',
    label: '克隆应用检测',
    labelEn: 'Cloned App Detection',
    description: '是否检测到应用克隆',
    group: '系统信息',
    critical: true,
    valueType: 'boolean',
    icon: Settings,
    formatter: 'formatRiskBoolean',
    riskWeight: 30,
  },
  'factoryReset.timestamp': {
    key: 'factoryReset.timestamp',
    label: '工厂重置时间',
    labelEn: 'Factory Reset Time',
    description: '设备最近一次工厂重置的时间',
    group: '系统信息',
    critical: false,
    valueType: 'date',
    icon: Settings,
    formatter: 'formatTimestamp',
  },
  'jailbroken.result': {
    key: 'jailbroken.result',
    label: '越狱检测',
    labelEn: 'Jailbreak Detection',
    description: '是否检测到设备越狱',
    group: '系统信息',
    critical: true,
    valueType: 'boolean',
    icon: Unlock,
    formatter: 'formatRiskBoolean',
    riskWeight: 30,
  },
  'frida.result': {
    key: 'frida.result',
    label: 'Frida检测',
    labelEn: 'Frida Detection',
    description: '是否检测到Frida动态分析工具',
    group: '系统信息',
    critical: true,
    valueType: 'boolean',
    icon: Bug,
    formatter: 'formatRiskBoolean',
    riskWeight: 35,
  },
  'privacySettings.result': {
    key: 'privacySettings.result',
    label: '隐私设置',
    labelEn: 'Privacy Settings',
    description: '隐私设置异常检测',
    group: '系统信息',
    critical: false,
    valueType: 'boolean',
    icon: Lock,
    formatter: 'formatBoolean',
  },

  // ==================== 其他信息 ====================
  'linkedId': {
    key: 'linkedId',
    label: '关联ID',
    labelEn: 'Linked ID',
    description: '自定义关联标识符',
    group: '其他信息',
    critical: false,
    valueType: 'string',
    icon: Hash,
    copyable: true,
    hideEmpty: true,
  },
  'tag': {
    key: 'tag',
    label: '标签信息',
    labelEn: 'Tag Information',
    description: '自定义标签数据',
    group: '其他信息',
    critical: false,
    valueType: 'object',
    icon: Settings,
    hideEmpty: true,
    formatter: 'formatObject',
  },
  'rawDeviceAttributes': {
    key: 'rawDeviceAttributes',
    label: '原始设备属性',
    labelEn: 'Raw Device Attributes',
    description: '原始设备属性数据',
    group: '其他信息',
    critical: false,
    valueType: 'object',
    icon: Database,
    hideEmpty: true,
    formatter: 'formatObject',
  },
};

/** 根据分组获取字段列表 */
export function getFieldsByGroup(group: FieldGroup): FieldConfig[] {
  return Object.values(FIELD_MAPPINGS).filter(field => field.group === group);
}

/** 获取所有分组 */
export function getAllGroups(): FieldGroup[] {
  const groups = new Set<FieldGroup>();
  Object.values(FIELD_MAPPINGS).forEach(field => groups.add(field.group));
  return Array.from(groups);
}

/** 获取关键字段 */
export function getCriticalFields(): FieldConfig[] {
  return Object.values(FIELD_MAPPINGS).filter(field => field.critical);
}

/** 获取具有风险权重的字段 */
export function getRiskFields(): FieldConfig[] {
  return Object.values(FIELD_MAPPINGS).filter(field => field.riskWeight && field.riskWeight > 0);
}

/** 根据字段路径获取配置 */
export function getFieldConfig(key: string): FieldConfig | undefined {
  return FIELD_MAPPINGS[key];
}

/** 检查字段是否存在 */
export function hasFieldConfig(key: string): boolean {
  return key in FIELD_MAPPINGS;
}