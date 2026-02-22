import React from 'react';
import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { GlassCard } from '../ui/GlassCard';

interface DataPoint {
    subject: string;
    A: number;
    fullMark: number;
}

interface RadarChartProps {
    data: DataPoint[];
    title?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0A0F1F]/90 border border-[#818CF8]/50 p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(129,140,248,0.2)]">
                <p className="text-white font-medium">{payload[0].payload.subject}</p>
                <p className="text-[#818CF8] font-bold">Score: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export const RadarChart: React.FC<RadarChartProps> = ({ data, title = "Skill Proficiency" }) => {
    return (
        <GlassCard className="h-[400px] flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Student"
                            dataKey="A"
                            stroke="#818CF8"
                            fill="#818CF8"
                            fillOpacity={0.4}
                            isAnimationActive={true}
                            animationBegin={200}
                            animationDuration={1500}
                        />
                    </RechartsRadarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};
