"use client";

import { useState, useEffect } from "react";
import { DeviceInfo } from "@/types";

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getDeviceInfo = async () => {
      const { UAParser } = await import("ua-parser-js");
      const parser = new UAParser();
      const result = parser.getResult();

      const info: DeviceInfo = {
        os: result.os.name || "Unknown",
        osVersion: result.os.version,
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version,
        deviceType: result.device.type || "desktop",
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
        screenResolution: `${screen.width}x${screen.height}`,
        pixelRatio: window.devicePixelRatio || 1,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
      };

      setDeviceInfo(info);
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
}