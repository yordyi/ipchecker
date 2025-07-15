"use client";

import { useState, useEffect } from "react";
import { WebRTCInfo } from "@/types";

export function useWebRTCInfo() {
  const [webrtcInfo, setWebrtcInfo] = useState<WebRTCInfo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectWebRTC = async () => {
      const info: WebRTCInfo = {
        publicIPs: [],
        localIPs: [],
        supported: false,
        candidates: [],
        leakDetected: false,
      };

      try {
        // 检查WebRTC是否支持
        if (!window.RTCPeerConnection) {
          setWebrtcInfo(info);
          return;
        }

        info.supported = true;

        // 创建RTCPeerConnection来检测IP地址
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        });

        const ipRegex = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;
        const ipv6Regex = /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/;

        const addedIPs = new Set<string>();

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            info.candidates.push(event.candidate.toJSON());
            
            const candidateString = event.candidate.candidate;
            
            // 提取IPv4地址
            const ipv4Match = candidateString.match(ipRegex);
            if (ipv4Match) {
              const ip = ipv4Match[0];
              if (!addedIPs.has(ip)) {
                addedIPs.add(ip);
                
                // 判断是否为本地IP
                if (isLocalIP(ip)) {
                  info.localIPs.push(ip);
                } else {
                  info.publicIPs.push(ip);
                  info.leakDetected = true;
                }
              }
            }

            // 提取IPv6地址
            const ipv6Match = candidateString.match(ipv6Regex);
            if (ipv6Match) {
              const ip = ipv6Match[0];
              if (!addedIPs.has(ip)) {
                addedIPs.add(ip);
                
                if (isLocalIPv6(ip)) {
                  info.localIPs.push(ip);
                } else {
                  info.publicIPs.push(ip);
                  info.leakDetected = true;
                }
              }
            }
          }
        };

        // 创建数据通道来触发ICE候选
        pc.createDataChannel("test");

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
        } catch (error) {
          console.error("创建WebRTC offer失败:", error);
        }

        // 添加网络连接信息检测
        if ('connection' in navigator) {
          const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
          if (connection) {
            info.connection = {
              rtt: connection.rtt,
              downlink: connection.downlink,
              effectiveType: connection.effectiveType,
              saveData: connection.saveData
            };
          }
        }

        // 等待一段时间收集候选者
        setTimeout(() => {
          pc.close();
          setWebrtcInfo(info);
        }, 2000);

      } catch (error) {
        console.error("WebRTC检测失败:", error);
        setWebrtcInfo(info);
      }
    };

    detectWebRTC();
  }, []);

  return webrtcInfo;
}

function isLocalIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  
  // 检查是否为私有IP地址范围
  return (
    // 10.0.0.0 - 10.255.255.255
    parts[0] === 10 ||
    // 172.16.0.0 - 172.31.255.255  
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    // 192.168.0.0 - 192.168.255.255
    (parts[0] === 192 && parts[1] === 168) ||
    // 127.0.0.0 - 127.255.255.255 (回环)
    parts[0] === 127 ||
    // 169.254.0.0 - 169.254.255.255 (链路本地)
    (parts[0] === 169 && parts[1] === 254)
  );
}

function isLocalIPv6(ip: string): boolean {
  const lowerIP = ip.toLowerCase();
  
  return (
    // 回环地址
    lowerIP === "::1" ||
    // 链路本地地址
    lowerIP.startsWith("fe80:") ||
    // 唯一本地地址
    lowerIP.startsWith("fc00:") ||
    lowerIP.startsWith("fd00:")
  );
}