# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构

这是一个使用 Next.js 15 和 TypeScript 构建的现代 IP 检测应用，集成了 Fingerprint Pro 进行高级设备指纹识别和风险检测。

### 技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **组件库**: shadcn/ui 组件配置 (New York 风格)
- **主题**: next-themes 支持深色/浅色主题
- **指纹识别**: Fingerprint Pro React SDK
- **工具**: ESLint、React 19、Vercel Functions

### 核心功能模块
- **IP 检测**: 基于 Fingerprint Pro 的精准 IP 地理位置定位
- **设备指纹**: 浏览器指纹识别和设备信息收集
- **风险检测**: VPN、代理、Tor 检测和安全分析
- **网络诊断**: WebRTC 连接信息和网络质量评估
- **实时更新**: 支持数据刷新和动态状态更新

### 应用架构
- **混合渲染**: 客户端为主，配合服务端 API 路由实现数据融合
- **数据层**: 三层数据架构（客户端检测 → Fingerprint Pro → 服务端增强）
- **Hook 系统**: 自定义 Hook 封装功能逻辑，支持独立状态管理
- **组件化**: 模块化设计，支持主题切换和响应式布局
- **安全架构**: 客户端+服务端双重验证，支持多区域部署

### 目录结构
- `app/` - Next.js App Router 主要应用代码
  - `layout.tsx` - 根布局，包含主题和 Fingerprint Pro 配置
  - `page.tsx` - 主页面（重定向到 modern-page.tsx）
  - `modern-page.tsx` - 核心应用页面，包含所有功能
  - `api/` - API 路由
    - `ip-info/` - IP 信息 API
    - `fingerprint/` - Fingerprint Pro 相关 API
      - `health/` - 服务健康检查和配置验证
      - `visitor/[visitorId]/` - 访问者历史记录和模式分析
      - `event/[requestId]/` - 特定事件详情
    - `http-headers/` - HTTP 头部信息 API
- `hooks/` - 自定义 React Hook
  - `use-enhanced-fingerprint.ts` - 增强版指纹数据管理（客户端+服务端融合）
  - `use-fingerprint-pro.ts` - Fingerprint Pro 客户端 SDK 封装
  - `use-device-info.ts` - 设备信息检测
  - `use-webrtc-info.ts` - WebRTC 网络信息
  - `use-browser-fingerprint.ts` - 浏览器指纹
  - `use-system-hardware.ts` - 系统硬件信息
  - `use-battery-info.ts` - 设备电池状态
  - `use-html5-features.ts` - HTML5 功能检测
- `components/` - 可重用组件
  - `fingerprint-diagnostics.tsx` - 指纹诊断组件
  - `info-card.tsx` - 信息卡片组件
  - `theme-toggle.tsx` - 主题切换组件
  - 其他 UI 组件
- `lib/` - 共享工具函数
  - `utils.ts` - 包含 shadcn/ui 的 `cn` 样式合并函数
- `types/` - TypeScript 类型定义

## 开发命令

```bash
# 开发服务器 (使用 Turbopack)
npm run dev

# 生产构建
npm run build

# 生产服务器
npm run start

# 代码检查
npm run lint
```

**注意**: 项目支持多种包管理器（npm、yarn、bun），但建议使用 npm 以保持一致性。

## 环境配置

### 必需的环境变量
```env
NEXT_PUBLIC_FINGERPRINT_API_KEY=your_fingerprint_api_key
NEXT_PUBLIC_FINGERPRINT_REGION=us|eu|ap
FINGERPRINT_SECRET_KEY=your_fingerprint_secret_key
```

### Fingerprint Pro 区域配置
- `us`: https://api.fpjs.io
- `eu`: https://eu.api.fpjs.io  
- `ap`: https://ap.api.fpjs.io (默认)

## 开发须知

### 样式系统
- 使用 Tailwind CSS v4 作为主要样式系统
- 配置了 shadcn/ui 组件库，使用 New York 风格
- 组件别名：`@/components`、`@/lib/utils`、`@/ui`、`@/hooks`
- 图标库：Lucide React
- 支持深色/浅色主题切换

### 路径别名
- `@/*` 指向项目根目录
- TypeScript 配置支持绝对路径导入

### 代码标准
- 使用 Next.js 和 TypeScript 的 ESLint 配置
- 严格的 TypeScript 设置
- 支持 JSX 和现代 ES 特性

### 字体配置
- 主字体：Geist Sans (`--font-geist-sans`)
- 等宽字体：Geist Mono (`--font-geist-mono`)

### 数据流架构
- **三层数据处理**: 客户端检测 → Fingerprint Pro → 服务端增强
- **状态管理**: 基于 React Hook 的状态管理，支持加载状态和错误处理
- **数据同步**: 支持手动刷新和自动重新获取数据
- **安全渲染**: 使用 `safeRender` 函数确保数据安全显示

### 错误处理
- 分层错误处理：客户端、服务端、网络层
- 降级处理：Fingerprint Pro 服务不可用时的备用方案
- 开发环境模拟数据支持
- 详细的错误信息和诊断功能

### 性能优化
- React 19 和 Next.js 15 的最新优化特性
- 组件懒加载和代码分割
- 缓存策略和数据预获取
- Vercel Functions 优化的 API 路由

## 重要架构设计

### Hook 系统架构
- **核心 Hook**: `useEnhancedFingerprint` 作为主要数据管理中心
- **功能 Hook**: 各种专门的检测 Hook（设备、网络、浏览器等）
- **状态隔离**: 每个 Hook 管理独立的状态和错误处理
- **数据融合**: 客户端和服务端数据在 Hook 层面进行融合

### 安全和隐私
- **客户端优先**: 优先使用客户端数据，减少服务端依赖
- **敏感数据过滤**: API 响应中过滤敏感信息
- **多区域支持**: 支持 US、EU、AP 区域的 Fingerprint Pro 服务
- **环境变量管理**: 安全的 API 密钥管理机制

## 开发工作流

### 数据流理解
1. **客户端初始化**: `modern-page.tsx` 加载多个 Hook
2. **数据收集**: 各个 Hook 并行收集不同维度的数据
3. **数据融合**: `useEnhancedFingerprint` 将客户端和服务端数据融合
4. **UI 渲染**: 使用 `safeRender` 函数安全渲染数据
5. **实时更新**: 支持刷新和重新获取数据

### 添加新功能
1. 如需新的检测功能，创建新的 Hook（参考现有 Hook 模式）
2. 如需新的 API 端点，在 `app/api/` 下创建新的路由
3. 如需新的 UI 组件，在 `components/` 下创建（使用 shadcn/ui 风格）
4. 所有新功能都应支持加载状态、错误处理和主题切换

### 调试技巧
- 使用浏览器开发者工具检查 Fingerprint Pro 网络请求
- 检查 `useEnhancedFingerprint` 的状态变化
- 使用 `FingerprintDiagnostics` 组件查看详细诊断信息
- 环境变量配置错误时，应用会显示相应的错误信息