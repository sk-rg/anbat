/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CreatureSvgProps {
  type: 'camel' | 'falcon' | 'ibex' | 'scorpion';
  className?: string;
}

export const CreatureSvg: React.FC<CreatureSvgProps> = ({ type, className = 'w-16 h-16' }) => {
  switch (type) {
    case 'camel':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="50" r="46" fill="#F6EEE1" stroke="#C8963E" strokeWidth="3" />
          <path d="M26 68L28 54C28 48 32 44 38 44C42 44 45 47 48 51C51 46 56 42 62 42C69 42 74 47 74 54L76 68" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <path d="M30 46L24 34C22 30 25 24 30 24C34 24 37 27 38 31L42 44" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <circle cx="32" cy="28" r="2.5" fill="#7A2E1D" />
          <line x1="34" y1="68" x2="34" y2="82" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <line x1="42" y1="68" x2="42" y2="82" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <line x1="62" y1="68" x2="62" y2="82" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="68" x2="70" y2="82" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" />
          <path d="M48 50L54 50" stroke="#C8963E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="50" r="40" stroke="#1F6E68" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );

    case 'falcon':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="50" r="46" fill="#F6EEE1" stroke="#C8963E" strokeWidth="3" />
          <path d="M18 48C30 38 42 34 50 44C58 34 70 38 82 48C74 60 62 62 50 56C38 62 26 60 18 48Z" fill="#C8963E" fillOpacity="0.2" stroke="#7A2E1D" strokeWidth="3" />
          <path d="M50 30C46 30 43 34 43 38C43 45 50 54 50 54C50 54 57 45 57 38C57 34 54 30 50 30Z" fill="#7A2E1D" />
          <path d="M50 36L56 38L50 40" stroke="#C8963E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="47" cy="35" r="1.5" fill="#F6EEE1" />
          <path d="M42 58L50 78L58 58" stroke="#7A2E1D" strokeWidth="3" strokeLinejoin="round" />
          <path d="M22 46L12 36M78 46L88 36" stroke="#1F6E68" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'ibex':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="50" r="46" fill="#F6EEE1" stroke="#C8963E" strokeWidth="3" />
          {/* Majestic Curved Horns */}
          <path d="M46 38C40 24 30 18 16 22C14 28 24 32 38 40" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M54 38C60 24 70 18 84 22C86 28 76 32 62 40" stroke="#7A2E1D" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Horn Ridges */}
          <line x1="28" y1="22" x2="31" y2="26" stroke="#C8963E" strokeWidth="2" />
          <line x1="34" y1="26" x2="37" y2="30" stroke="#C8963E" strokeWidth="2" />
          <line x1="72" y1="22" x2="69" y2="26" stroke="#C8963E" strokeWidth="2" />
          <line x1="66" y1="26" x2="63" y2="30" stroke="#C8963E" strokeWidth="2" />
          {/* Head & Beard */}
          <path d="M42 42L50 56L58 42C58 38 42 38 42 42Z" fill="#7A2E1D" />
          <path d="M47 56L50 68L53 56" stroke="#C8963E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="45" cy="45" r="2" fill="#F6EEE1" />
          <circle cx="55" cy="45" r="2" fill="#F6EEE1" />
          {/* Royal Sun Aura */}
          <circle cx="50" cy="50" r="42" stroke="#C8963E" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M50 12L50 16M50 84L50 88M12 50L16 50M84 50L88 50" stroke="#1F6E68" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'scorpion':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="50" r="46" fill="#F6EEE1" stroke="#C8963E" strokeWidth="3" />
          {/* Segmented body */}
          <ellipse cx="50" cy="55" rx="10" ry="14" fill="#7A2E1D" />
          {/* Pincers */}
          <path d="M44 48L32 40L24 46M32 40L22 34" stroke="#7A2E1D" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 48L68 40L76 46M68 40L78 34" stroke="#7A2E1D" strokeWidth="3" strokeLinecap="round" />
          {/* Arched Tail & Stinger */}
          <path d="M50 69C50 78 64 82 66 70C68 62 58 58 56 64" stroke="#C8963E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <polygon points="53,63 59,62 56,58" fill="#1F6E68" />
          {/* Legs */}
          <path d="M40 54L28 56M40 60L28 66M60 54L72 56M60 60L72 66" stroke="#7A2E1D" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
