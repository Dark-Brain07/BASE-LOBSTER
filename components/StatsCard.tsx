"use client";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    imageIcon?: string;
    imageAnimation?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatsCard({ title, value, subtitle, icon, imageIcon, imageAnimation, trend }: StatsCardProps) {
    return (
        <div className="stat-card group hover:scale-105 transition-transform duration-300">
            {imageIcon ? (
                <img
                    src={imageIcon}
                    alt={title}
                    className={`w-16 h-16 mb-3 mx-auto object-contain ${imageAnimation || ''}`}
                />
            ) : icon && (
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            )}
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {title}
            </h3>
            <div className="stat-value mt-2">{value}</div>
            {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
                <div
                    className={`flex items-center justify-center gap-1 mt-2 text-sm ${trend.isPositive ? "text-green-500" : "text-red-500"
                        }`}
                >
                    <span>{trend.isPositive ? "↑" : "↓"}</span>
                    <span>{Math.abs(trend.value)}%</span>
                </div>
            )}
        </div>
    );
}
