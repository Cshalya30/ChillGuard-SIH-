import React from 'react';

interface SkeletonLoaderProps {
  height?: string;
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 'h-16',
  className = '',
  count = 1
}) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full rounded-[8px] skeleton-shimmer ${height} ${className}`}
        />
      ))}
    </div>
  );
};
