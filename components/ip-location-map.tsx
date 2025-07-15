"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Crosshair, Globe } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
  accuracyRadius?: number;
  timezone?: string;
  postalCode?: string;
}

interface IpLocationMapProps {
  location: LocationData;
  className?: string;
}

export function IpLocationMap({ location, className = "" }: IpLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // 动态加载 Leaflet 和相关 CSS
    const loadLeaflet = async () => {
      try {
        // 动态导入 Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // 动态导入 Leaflet JS
        const L = (await import('leaflet')).default;
        
        // 修复默认图标问题
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current && location.latitude && location.longitude) {
          // 清除现有地图
          mapRef.current.innerHTML = '';

          // 创建地图
          const map = L.map(mapRef.current).setView([location.latitude, location.longitude], 10);

          // 添加地图图层
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          // 添加位置标记
          const marker = L.marker([location.latitude, location.longitude]).addTo(map);
          
          // 创建弹出窗口内容
          const popupContent = `
            <div class="text-sm">
              <div class="font-semibold text-gray-900 mb-2">📍 IP 地理位置</div>
              <div class="space-y-1">
                ${location.city ? `<div><strong>城市:</strong> ${location.city}</div>` : ''}
                ${location.region ? `<div><strong>地区:</strong> ${location.region}</div>` : ''}
                ${location.country ? `<div><strong>国家:</strong> ${location.country}</div>` : ''}
                <div><strong>坐标:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</div>
                ${location.accuracyRadius ? `<div><strong>精度:</strong> ±${location.accuracyRadius}km</div>` : ''}
                ${location.timezone ? `<div><strong>时区:</strong> ${location.timezone}</div>` : ''}
                ${location.postalCode ? `<div><strong>邮编:</strong> ${location.postalCode}</div>` : ''}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          // 如果有精度半径，添加圆形覆盖层
          if (location.accuracyRadius && location.accuracyRadius > 0) {
            const circle = L.circle([location.latitude, location.longitude], {
              color: '#ff6b6b',
              fillColor: '#ff6b6b',
              fillOpacity: 0.1,
              radius: location.accuracyRadius * 1000, // 转换为米
            }).addTo(map);

            circle.bindPopup(`<div class="text-sm"><strong>位置精度范围</strong><br/>半径: ±${location.accuracyRadius}km</div>`);
          }

          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('地图加载失败');
      }
    };

    loadLeaflet();
  }, [location]);

  if (mapError) {
    return (
      <div className={`professional-card ${className}`}>
        <div className="professional-card-header">
          <div className="professional-card-title">
            <Globe className="h-5 w-5 text-green-400" />
            地理位置地图
          </div>
          <div className="advanced-label">
            <span>高级</span>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ {mapError}</div>
          <div className="text-sm text-gray-500">地图服务暂时不可用</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`professional-card ${className}`}>
      <div className="professional-card-header">
        <div className="professional-card-title">
          <Globe className="h-5 w-5 text-green-400" />
          地理位置地图
        </div>
        <div className="advanced-label">
          <span>高级</span>
        </div>
      </div>

      {/* 地理信息摘要 */}
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div className="info-item">
          <span className="info-label flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            坐标
          </span>
          <span className="info-value font-mono text-xs">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
        {location.accuracyRadius && (
          <div className="info-item">
            <span className="info-label flex items-center gap-1">
              <Crosshair className="h-3 w-3" />
              精度
            </span>
            <span className="info-value">±{location.accuracyRadius}km</span>
          </div>
        )}
        {location.timezone && (
          <div className="info-item">
            <span className="info-label flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              时区
            </span>
            <span className="info-value">{location.timezone}</span>
          </div>
        )}
        {location.postalCode && (
          <div className="info-item">
            <span className="info-label">邮编</span>
            <span className="info-value">{location.postalCode}</span>
          </div>
        )}
      </div>

      {/* 地图容器 */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg overflow-hidden bg-gray-800"
          style={{ minHeight: '256px' }}
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-gray-400">加载地图中...</div>
            </div>
          </div>
        )}
      </div>

      {/* 地理数据详情 */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">地理数据详情</div>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {location.city && (
            <div className="flex justify-between">
              <span className="text-gray-500">城市:</span>
              <span className="text-white">{location.city}</span>
            </div>
          )}
          {location.region && (
            <div className="flex justify-between">
              <span className="text-gray-500">地区:</span>
              <span className="text-white">{location.region}</span>
            </div>
          )}
          {location.country && (
            <div className="flex justify-between">
              <span className="text-gray-500">国家:</span>
              <span className="text-white">{location.country}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}