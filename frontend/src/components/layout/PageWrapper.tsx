import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar 240px fixed */}
      <Sidebar />

      {/* Main Content Area offset by 240px */}
      <div className="pl-[240px] flex-1 flex flex-col min-w-0">
        <TopBar title={title} subtitle={subtitle} />

        {/* Framer Motion page enter transition */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-6 flex-1 space-y-6 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};
