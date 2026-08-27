import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { TelemetryReading } from '../../types';
import { formatTimeHHMM } from '../../utils/formatting';

interface TemperatureGraphProps {
  readings: TelemetryReading[];
  predictedTemps?: number[];
  setpointTemp: number;
  minTemp: number;
  maxTemp: number;
}

export const TemperatureGraph: React.FC<TemperatureGraphProps> = ({
  readings,
  predictedTemps = [],
  setpointTemp,
  minTemp,
  maxTemp
}) => {
  // Combine historical readings + projected trajectory into unified chart data
  const chartData = readings.map((r) => ({
    time: formatTimeHHMM(r.timestamp),
    actualTemp: r.temperature,
    predictedTemp: null as number | null,
    doorOpen: r.door_open === 1,
    humidity: r.humidity
  }));

  // Append 8 predicted steps into the future
  if (readings.length > 0 && predictedTemps.length > 0) {
    const lastTime = new Date(readings[readings.length - 1].timestamp).getTime();
    // Connect actual line to predicted line seamlessly
    if (chartData.length > 0) {
      chartData[chartData.length - 1].predictedTemp = chartData[chartData.length - 1].actualTemp;
    }

    predictedTemps.forEach((pTemp, idx) => {
      const futureTs = new Date(lastTime + (idx + 1) * 5 * 60 * 1000).toISOString();
      chartData.push({
        time: formatTimeHHMM(futureTs),
        actualTemp: null,
        predictedTemp: pTemp,
        doorOpen: false,
        humidity: null as any
      });
    });
  }

  const yDomainMin = Math.floor(Math.min(minTemp - 4, setpointTemp - 8));
  const yDomainMax = Math.ceil(Math.max(maxTemp + 4, setpointTemp + 8));

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Thermal Trajectory & Predictor</h3>
          <p className="text-xs text-gray-500">Historical telemetry & 40-minute predictive extrapolation</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#1D6FA4]" />
            <span className="text-gray-600">Actual (°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-gray-400 border-t border-dashed border-gray-500" />
            <span className="text-gray-600">Forecast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-red-500" />
            <span className="text-gray-600">Upper Limit ({maxTemp}°C)</span>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <YAxis domain={[yDomainMin, yDomainMax]} stroke="#94A3B8" tick={{ fontSize: 11 }} unit="°C" />
            
            {/* Shaded danger zone above max and below min per PRD */}
            <ReferenceArea y1={maxTemp} y2={yDomainMax} fill="#FEE2E2" fillOpacity={0.4} />
            <ReferenceArea y1={yDomainMin} y2={minTemp} fill="#FEE2E2" fillOpacity={0.4} />

            {/* Threshold Reference Lines */}
            <ReferenceLine y={maxTemp} stroke="#DC2626" strokeDasharray="4 4" label={{ value: `Max: ${maxTemp}°C`, fill: '#DC2626', fontSize: 11, position: 'insideTopRight' }} />
            <ReferenceLine y={minTemp} stroke="#2563EB" strokeDasharray="4 4" label={{ value: `Min: ${minTemp}°C`, fill: '#2563EB', fontSize: 11, position: 'insideBottomRight' }} />
            <ReferenceLine y={setpointTemp} stroke="#94A3B8" strokeDasharray="2 2" />

            <Tooltip
              contentStyle={{ backgroundColor: '#0D1B2A', borderColor: '#1E293B', color: '#FFF', borderRadius: '6px' }}
              labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
            />

            {/* Actual Temperature Readings Line */}
            <Line
              type="monotone"
              dataKey="actualTemp"
              stroke="#1D6FA4"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1D6FA4' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />

            {/* Predicted Trajectory Line (dashed) */}
            <Line
              type="monotone"
              dataKey="predictedTemp"
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2, fill: '#64748B' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
