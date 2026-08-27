import React, { useState } from 'react';
import { FilePdf, ArrowSquareOut, DownloadSimple } from '@phosphor-icons/react';
import axios from 'axios';

interface ReportGeneratorProps {
  shipmentId: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ shipmentId }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(10);
    setStatusText('Fetching telemetry & custody records...');
    setPdfBlobUrl(null);

    try {
      setTimeout(() => { setProgress(35); setStatusText('Calculating Arrhenius MKT values...'); }, 500);
      setTimeout(() => { setProgress(65); setStatusText('Executing ReportLab PDF engine...'); }, 1100);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/compliance/${shipmentId}/report`,
        { responseType: 'blob' }
      );

      setTimeout(() => {
        setProgress(100);
        setStatusText('PDF Report Generated Successfully');
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoading(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setLoading(false);
      setStatusText('Error generating PDF report');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <FilePdf size={20} className="text-[#1D6FA4]" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Automated Report Generator</h3>
        </div>
        <span className="text-xs font-mono text-gray-500">FORMAT: PDF/A-1b</span>
      </div>

      <div className="space-y-4">
        {!loading && !pdfBlobUrl && (
          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-[#1D6FA4] hover:bg-[#155883] text-white font-medium text-sm rounded-[6px] transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <FilePdf size={18} />
            <span>Generate GDP-Compliant Report</span>
          </button>
        )}

        {/* Progress bar loader with text updates per PRD (no spinner) */}
        {loading && (
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-[6px]">
            <div className="flex justify-between text-xs font-mono text-gray-700">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D6FA4] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Generated PDF Actions */}
        {pdfBlobUrl && !loading && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[6px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 font-mono">
                DOCUMENT READY: chillguard-gdp-report-{shipmentId}.pdf
              </span>
              <button
                onClick={handleGenerate}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Regenerate
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-[6px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ArrowSquareOut size={16} />
                <span>Open PDF in New Tab</span>
              </a>

              <a
                href={pdfBlobUrl}
                download={`chillguard-gdp-report-${shipmentId}.pdf`}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-[6px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <DownloadSimple size={16} />
                <span>Download Report</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
