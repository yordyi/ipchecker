"use client";

import { useState, useEffect } from "react";
import { InfoCard, InfoItem } from "./info-card";

interface TimezoneInfoProps {
  timezone?: string;
}

export function TimezoneInfo({ timezone }: TimezoneInfoProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [localTimezone, setLocalTimezone] = useState<string>("");
  const [utcOffset, setUtcOffset] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // 获取本地时区信息
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTimezone(localTz);
      
      // 计算UTC偏移
      const offset = -now.getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      setUtcOffset(`UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      
      // 格式化当前时间
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <InfoCard title="时区信息">
      <InfoItem label="当前时间" value={currentTime} copyable />
      <InfoItem label="时区" value={timezone || localTimezone} copyable />
      <InfoItem label="UTC偏移" value={utcOffset} copyable />
    </InfoCard>
  );
}