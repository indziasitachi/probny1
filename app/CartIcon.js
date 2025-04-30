import React from 'react';
import Link from "next/link";

export default function CartIcon() {
  return (
    <Link href="/cart" className="ml-4 flex items-center group" aria-label="Корзина">
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
        <path d="M6 6h15l-1.5 9h-13z" stroke="#7baaf7" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="9" cy="20" r="1.5" fill="#7baaf7"/>
        <circle cx="17" cy="20" r="1.5" fill="#7baaf7"/>
      </svg>
    </Link>
  );
}
