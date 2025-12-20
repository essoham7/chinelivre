import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 ${className || ''}`} />
)

export const SkeletonLine: React.FC<{ width?: string; className?: string }> = ({ width = 'w-full', className }) => (
  <div className={`animate-pulse bg-gray-200 h-4 ${width} rounded ${className || ''}`} />
)

export const SkeletonCircle: React.FC<{ size?: string; className?: string }> = ({ size = 'h-10 w-10', className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-full ${size} ${className || ''}`} />
)

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-start gap-4">
      <SkeletonCircle />
      <div className="flex-1">
        <SkeletonLine width="w-3/5" />
        <div className="mt-2 space-y-2">
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-4/5" />
          <SkeletonLine width="w-2/5" />
        </div>
      </div>
    </div>
  </div>
)
