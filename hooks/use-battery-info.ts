"use client";

import { useState, useEffect } from "react";
import { BatteryInfo } from "@/types";

export function useBatteryInfo() {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getBatteryInfo = async () => {
      try {
        const nav = navigator as any;
        
        // 检查是否支持电池API
        if (!('getBattery' in nav) && !('battery' in nav) && !('mozBattery' in nav)) {
          setBatteryInfo({
            charging: false,
            chargingTime: 0,
            dischargingTime: 0,
            level: 0,
            supported: false,
          });
          return;
        }

        let battery;
        
        // 尝试不同的电池API方法
        if ('getBattery' in nav) {
          battery = await nav.getBattery();
        } else if ('battery' in nav) {
          battery = nav.battery;
        } else if ('mozBattery' in nav) {
          battery = nav.mozBattery;
        }

        if (battery) {
          const info: BatteryInfo = {
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: Math.round(battery.level * 100),
            supported: true,
          };

          setBatteryInfo(info);

          // 监听电池状态变化
          const updateInfo = () => {
            setBatteryInfo({
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
              level: Math.round(battery.level * 100),
              supported: true,
            });
          };

          battery.addEventListener?.('chargingchange', updateInfo);
          battery.addEventListener?.('levelchange', updateInfo);
          battery.addEventListener?.('chargingtimechange', updateInfo);
          battery.addEventListener?.('dischargingtimechange', updateInfo);

          // 清理事件监听器
          return () => {
            battery.removeEventListener?.('chargingchange', updateInfo);
            battery.removeEventListener?.('levelchange', updateInfo);
            battery.removeEventListener?.('chargingtimechange', updateInfo);
            battery.removeEventListener?.('dischargingtimechange', updateInfo);
          };
        } else {
          setBatteryInfo({
            charging: false,
            chargingTime: 0,
            dischargingTime: 0,
            level: 0,
            supported: false,
          });
        }
      } catch (error) {
        console.error('获取电池信息失败:', error);
        setBatteryInfo({
          charging: false,
          chargingTime: 0,
          dischargingTime: 0,
          level: 0,
          supported: false,
        });
      }
    };

    getBatteryInfo();
  }, []);

  return batteryInfo;
}