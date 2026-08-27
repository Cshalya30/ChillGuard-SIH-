import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldWarning } from '@phosphor-icons/react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-[8px] p-8 max-w-md w-full shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-[#0D1B2A] flex items-center justify-center mx-auto">
          <ShieldWarning size={28} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">404 - Resource Not Found</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          The requested route or operational resource could not be found on this system.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 px-4 bg-[#1D6FA4] hover:bg-[#155883] text-white text-xs font-medium rounded-[6px] transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
