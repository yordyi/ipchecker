"use client";

import { useState, useEffect, useMemo } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import { BrowserFingerprint } from "@/types";

export function useBrowserFingerprint() {
  const [fingerprint, setFingerprint] = useState<BrowserFingerprint | null>(null);

  // 使用 useMemo 来稳定配置对象，避免无限循环
  const loadOptions = useMemo(() => ({
    extendedResult: true,
    linkedId: typeof window !== 'undefined' ? window.location.hostname : undefined,
    tag: {
      userAction: 'page_visit',
      timestamp: new Date().toISOString()
    }
  }), []);

  // 集成 Fingerprint Pro API
  const {
    data: proData,
    isLoading: proLoading,
    error: proError
  } = useVisitorData(loadOptions, { immediate: true });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const generateFingerprint = async () => {
      const canvasFingerprint = generateCanvasFingerprint();
      const webglFingerprint = generateWebGLFingerprint();
      const audioFingerprint = await generateAudioFingerprint();
      const availableFonts = await detectFonts();
      const plugins = Array.from(navigator.plugins).map(p => p.name);

      const webglInfo = getWebGLInfo();
      const webglExtensions = getWebGLExtensions();

      // 创建基础本地指纹数据
      const localFp: BrowserFingerprint = {
        canvasFingerprint,
        webglFingerprint,
        audioFingerprint,
        availableFonts,
        plugins,
        webglRenderer: webglInfo.renderer,
        webglVendor: webglInfo.vendor,
        webglExtensions,
        hardwareConcurrency: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === "1",
        javaEnabled: (navigator as any).javaEnabled?.() || false,
        localStorageEnabled: checkLocalStorage(),
        sessionStorageEnabled: checkSessionStorage(),
        indexedDBEnabled: await checkIndexedDB(),
        adBlockEnabled: await checkAdBlock(),
        touchSupport: checkTouchSupport(),
        maxTouchPoints: navigator.maxTouchPoints || 0,
        speechSynthesisVoices: getSpeechSynthesisVoices(),
        proDataSource: 'local'
      };

      // 如果有 Fingerprint Pro 数据，进行合并增强
      if (proData && !proError) {
        try {
          const enhancedFp: BrowserFingerprint = {
            ...localFp,
            // Fingerprint Pro 增强数据
            visitorId: proData.visitorId,
            requestId: proData.requestId,
            confidence: proData.confidence?.score,
            firstSeenAt: (proData as any).firstSeenAt?.global || undefined,
            lastSeenAt: (proData as any).lastSeenAt?.global || undefined,
            visitorFound: (proData as any).visitorFound,
            isIncognito: (proData as any).incognito || undefined,
            vpnDetected: (proData as any).vpn?.result || undefined,
            proxyDetected: (proData as any).proxy?.result || undefined,
            torDetected: (proData as any).tor?.result || undefined,
            tamperingDetected: (proData as any).tampering?.result || undefined,
            suspectScore: (proData as any).suspectScore || undefined,
            accuracyEnhanced: true,
            proDataSource: 'hybrid'
          };
          setFingerprint(enhancedFp);
        } catch (error) {
          console.warn('合并 Fingerprint Pro 数据时出错:', error);
          setFingerprint({
            ...localFp,
            proErrorMessage: '数据合并失败',
            proDataSource: 'local'
          });
        }
      } else if (proError) {
        // Pro API 出错，使用本地数据并记录错误
        setFingerprint({
          ...localFp,
          proErrorMessage: proError.message || 'Fingerprint Pro API 不可用',
          proDataSource: 'local'
        });
      } else {
        // Pro 数据还在加载中，先显示本地数据
        setFingerprint(localFp);
      }
    };

    generateFingerprint();
  }, []);

  // 监听 Fingerprint Pro 数据变化，动态更新指纹
  useEffect(() => {
    if (!fingerprint) return; // 等待基础指纹生成完成
    
    if (proData && !proError && !proLoading) {
      // Pro 数据可用，更新指纹
      try {
        const enhancedFp: BrowserFingerprint = {
          ...fingerprint,
          visitorId: proData.visitorId,
          requestId: proData.requestId,
          confidence: proData.confidence?.score,
          firstSeenAt: (proData as any).firstSeenAt?.global || undefined,
          lastSeenAt: (proData as any).lastSeenAt?.global || undefined,
          visitorFound: (proData as any).visitorFound,
          isIncognito: (proData as any).incognito || undefined,
          vpnDetected: (proData as any).vpn?.result || undefined,
          proxyDetected: (proData as any).proxy?.result || undefined,
          torDetected: (proData as any).tor?.result || undefined,
          tamperingDetected: (proData as any).tampering?.result || undefined,
          suspectScore: (proData as any).suspectScore || undefined,
          accuracyEnhanced: true,
          proDataSource: 'hybrid',
          proErrorMessage: undefined
        };
        setFingerprint(enhancedFp);
      } catch (error) {
        console.warn('更新 Fingerprint Pro 数据时出错:', error);
        setFingerprint(prev => prev ? {
          ...prev,
          proErrorMessage: '数据更新失败',
          proDataSource: 'local'
        } : null);
      }
    } else if (proError) {
      // Pro API 出错
      setFingerprint(prev => prev ? {
        ...prev,
        proErrorMessage: proError.message || 'Fingerprint Pro API 不可用',
        proDataSource: 'local',
        accuracyEnhanced: false
      } : null);
    }
  }, [proData, proError, proLoading, fingerprint]);

  return fingerprint;
}

function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("IP检测 🔍", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Canvas指纹", 4, 35);

    return canvas.toDataURL();
  } catch {
    return "";
  }
}

function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return "";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }

    return gl.getParameter(gl.VERSION) || "";
  } catch {
    return "";
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return {};

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    }

    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
    };
  } catch {
    return {};
  }
}

async function detectFonts(): Promise<string[]> {
  const fonts = [
    "Arial", "Arial Black", "Arial Narrow", "Arial Unicode MS",
    "Calibri", "Cambria", "Candara", "Consolas", "Constantia", "Corbel",
    "Courier New", "Franklin Gothic Medium", "Futura", "Garamond",
    "Geneva", "Georgia", "Gill Sans", "Helvetica", "Helvetica Neue",
    "Impact", "Lucida Console", "Lucida Grande", "Lucida Sans Unicode",
    "Microsoft Sans Serif", "Palatino", "Segoe UI", "Tahoma", "Times",
    "Times New Roman", "Trebuchet MS", "Verdana",
  ];

  const availableFonts: string[] = [];

  for (const font of fonts) {
    if (await isFontAvailable(font)) {
      availableFonts.push(font);
    }
  }

  return availableFonts;
}

async function isFontAvailable(font: string): Promise<boolean> {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const baseWidths = baseFonts.map(baseFont => {
      ctx.font = `${testSize} ${baseFont}`;
      return ctx.measureText(testString).width;
    });

    return baseFonts.some((baseFont, index) => {
      ctx.font = `${testSize} ${font}, ${baseFont}`;
      return ctx.measureText(testString).width !== baseWidths[index];
    });
  } catch {
    return false;
  }
}

async function generateAudioFingerprint(): Promise<string> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = function(bins) {
        const buffer = bins.inputBuffer.getChannelData(0);
        const sum = buffer.reduce((acc, val) => acc + Math.abs(val), 0);
        oscillator.stop();
        scriptProcessor.disconnect();
        audioContext.close();
        resolve(sum.toString());
      };
    });
  } catch {
    return "";
  }
}

function getWebGLExtensions(): string[] {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return [];

    return gl.getSupportedExtensions() || [];
  } catch {
    return [];
  }
}

function checkLocalStorage(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkSessionStorage(): boolean {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

async function checkIndexedDB(): Promise<boolean> {
  try {
    return 'indexedDB' in window && indexedDB !== null;
  } catch {
    return false;
  }
}

async function checkAdBlock(): Promise<boolean> {
  try {
    const testElement = document.createElement('div');
    testElement.innerHTML = '&nbsp;';
    testElement.className = 'adsbox';
    testElement.style.position = 'absolute';
    testElement.style.left = '-999px';
    document.body.appendChild(testElement);
    
    const isBlocked = testElement.offsetHeight === 0;
    document.body.removeChild(testElement);
    
    return isBlocked;
  } catch {
    return false;
  }
}

function checkTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
}

function getSpeechSynthesisVoices(): number {
  try {
    return speechSynthesis.getVoices().length;
  } catch {
    return 0;
  }
}