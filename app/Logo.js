"use client";
import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center">
      <svg width="110" height="36" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="32" height="40" rx="6" fill="white"/>
        <rect x="18" y="16" width="36" height="8" rx="2" fill="white"/>
        <text x="60" y="46" fontFamily="Arial, Helvetica, sans-serif" fontSize="28" fill="white" fontWeight="bold" letterSpacing="2">
          Apsny pack
        </text>
        <rect x="32" y="36" width="18" height="8" fill="#35706a"/>
      </svg>
    </div>
  );
}
