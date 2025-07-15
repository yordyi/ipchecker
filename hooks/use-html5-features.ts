"use client";

import { useState, useEffect } from "react";
import { HTML5Features } from "@/types";

export function useHTML5Features() {
  const [features, setFeatures] = useState<HTML5Features | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectFeatures = () => {
      const html5Features: HTML5Features = {
        localStorage: checkLocalStorage(),
        sessionStorage: checkSessionStorage(),
        indexedDB: checkIndexedDB(),
        webSQL: checkWebSQL(),
        canvas: checkCanvas(),
        svg: checkSVG(),
        webGL: checkWebGL(),
        webGL2: checkWebGL2(),
        webWorkers: checkWebWorkers(),
        sharedWorkers: checkSharedWorkers(),
        serviceWorkers: checkServiceWorkers(),
        geolocation: checkGeolocation(),
        notifications: checkNotifications(),
        vibration: checkVibration(),
        battery: checkBattery(),
        gamepad: checkGamepad(),
        webRTC: checkWebRTC(),
        webAudio: checkWebAudio(),
        speechSynthesis: checkSpeechSynthesis(),
        speechRecognition: checkSpeechRecognition(),
      };

      setFeatures(html5Features);
    };

    detectFeatures();
  }, []);

  return features;
}

function checkLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function checkSessionStorage(): boolean {
  try {
    return typeof sessionStorage !== 'undefined';
  } catch {
    return false;
  }
}

function checkIndexedDB(): boolean {
  try {
    return 'indexedDB' in window;
  } catch {
    return false;
  }
}

function checkWebSQL(): boolean {
  try {
    return 'openDatabase' in window;
  } catch {
    return false;
  }
}

function checkCanvas(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch {
    return false;
  }
}

function checkSVG(): boolean {
  try {
    return !!(document.createElementNS && 
      document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
  } catch {
    return false;
  }
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function checkWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

function checkWebWorkers(): boolean {
  try {
    return 'Worker' in window;
  } catch {
    return false;
  }
}

function checkSharedWorkers(): boolean {
  try {
    return 'SharedWorker' in window;
  } catch {
    return false;
  }
}

function checkServiceWorkers(): boolean {
  try {
    return 'serviceWorker' in navigator;
  } catch {
    return false;
  }
}

function checkGeolocation(): boolean {
  try {
    return 'geolocation' in navigator;
  } catch {
    return false;
  }
}

function checkNotifications(): boolean {
  try {
    return 'Notification' in window;
  } catch {
    return false;
  }
}

function checkVibration(): boolean {
  try {
    return 'vibrate' in navigator;
  } catch {
    return false;
  }
}

function checkBattery(): boolean {
  try {
    const nav = navigator as any;
    return 'getBattery' in nav || 'battery' in nav || 'mozBattery' in nav;
  } catch {
    return false;
  }
}

function checkGamepad(): boolean {
  try {
    return 'getGamepads' in navigator;
  } catch {
    return false;
  }
}

function checkWebRTC(): boolean {
  try {
    return 'RTCPeerConnection' in window || 'webkitRTCPeerConnection' in window;
  } catch {
    return false;
  }
}

function checkWebAudio(): boolean {
  try {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  } catch {
    return false;
  }
}

function checkSpeechSynthesis(): boolean {
  try {
    return 'speechSynthesis' in window;
  } catch {
    return false;
  }
}

function checkSpeechRecognition(): boolean {
  try {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  } catch {
    return false;
  }
}