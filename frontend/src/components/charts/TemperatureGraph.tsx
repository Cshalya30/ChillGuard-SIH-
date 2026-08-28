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
import { ChartLineUp } from '@phosphor-icons/react';

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
    <div className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D6FA4]/10 flex items-center justify-center">
            <ChartLineUp size={16} weight="fill" className="text-[#1D6FA4]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Thermal Trajectory & Predictor</h3>
            <p className="text-[11px] text-gray-400">Historical telemetry & 40-minute predictive extrapolation</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-[3px] rounded-full bg-[#1D6FA4]" />
            <span className="text-gray-500">Actual (°C)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-[3px] rounded-full bg-gray-400 border-t-2 border-dashed border-gray-500" />
            <span className="text-gray-500">Forecast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-[3px] rounded-full bg-red-400" />
            <span className="text-gray-500">Limits</span>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="time" stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis domain={[yDomainMin, yDomainMax]} stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="°C" />
            
            {/* Shaded danger zone above max and below min */}
            <ReferenceArea y1={maxTemp} y2={yDomainMax} fill="#FEE2E2" fillOpacity={0.3} />
            <ReferenceArea y1={yDomainMin} y2={minTemp} fill="#DBEAFE" fillOpacity={0.3} />

            {/* Threshold Reference Lines */}
            <ReferenceLine y={maxTemp} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Max: ${maxTemp}°C`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={minTemp} stroke="#3B82F6" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Min: ${minTemp}°C`, fill: '#3B82F6', fontSize: 10, position: 'insideBottomRight' }} />
            <ReferenceLine y={setpointTemp} stroke="#94A3B8" strokeDasharray="2 2" strokeWidth={1} />

            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0D1B2A', 
                borderColor: 'rgba(255,255,255,0.08)', 
                color: '#FFF', 
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#94A3B8', fontWeight: '600', fontSize: '11px' }}
              itemStyle={{ fontSize: '11px' }}
            />

            {/* Actual Temperature Readings Line */}
            <Line
              type="monotone"
              dataKey="actualTemp"
              stroke="#1D6FA4"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#1D6FA4', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#1D6FA4', strokeWidth: 2, fill: '#FFF' }}
              isAnimationActive={false}
            />

            {/* Predicted Trajectory Line (dashed) */}
            <Line
              type="monotone"
              dataKey="predictedTemp"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2, fill: '#94A3B8', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
