"use client";

import { useState, useEffect } from "react";
import { SystemHardwareInfo } from "@/types";

export function useSystemHardware() {
  const [systemInfo, setSystemInfo] = useState<SystemHardwareInfo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getSystemInfo = async () => {
      const nav = navigator as any;
      
      const info: SystemHardwareInfo = {
        platform: navigator.platform,
        cpuClass: nav.cpuClass,
        oscpu: nav.oscpu,
        buildID: nav.buildID,
        product: nav.product,
        productSub: nav.productSub,
        vendor: navigator.vendor,
        vendorSub: nav.vendorSub,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        msMaxTouchPoints: nav.msMaxTouchPoints,
        pointerEnabled: nav.pointerEnabled,
        msPointerEnabled: nav.msPointerEnabled,
        mediaDevices: await getMediaDevicesCount(),
        bluetooth: await checkBluetoothSupport(),
        usb: await checkUSBSupport(),
      };

      setSystemInfo(info);
    };

    getSystemInfo();
  }, []);

  return systemInfo;
}

async function getMediaDevicesCount(): Promise<number> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return 0;
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.length;
  } catch {
    return 0;
  }
}

async function checkBluetoothSupport(): Promise<boolean> {
  try {
    return 'bluetooth' in navigator;
  } catch {
    return false;
  }
}

async function checkUSBSupport(): Promise<boolean> {
  try {
    return 'usb' in navigator;
  } catch {
    return false;
  }
}