"use client";
import React from 'react';
import { clsx } from 'clsx';
import { getAvatarColor, getInitials } from '../../lib/helpers';

interface Props { name?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string; }

export default function AvatarInitials({ name, size = 'md', className }: Props) {
  const { bg, text, border } = getAvatarColor(name);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-11 h-11 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-20 h-20 text-[24px]',
  };

  return (
    <div
      className={clsx('flex items-center justify-center rounded-xl font-bold border shrink-0', sizeClasses[size], className)}
      style={{ backgroundColor: bg, color: text, borderColor: border }}
    >
      {initials}
    </div>
  );
}
