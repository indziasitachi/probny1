import React from "react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between h-16 px-4 py-2" style={{
      background: "linear-gradient(90deg, #4AC6B7 0%, #AEE1D5 100%)",
      boxShadow: "0 4px 16px 0 #4AC6B755",
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18
    }}>
      <div className="flex items-center gap-2">
        <Logo />
        <div className="ml-2 text-white text-xs font-semibold flex flex-col leading-tight">
          <span>г. Сухум, ул. Ленина, 1</span>
          <span className="text-[10px] font-normal opacity-80">Доставка сегодня</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl px-2 py-1" style={{background: "#E3CBA6cc"}}>
          <svg width="18" height="18" fill="none" stroke="#4AC6B7" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="9" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="ml-1 text-[#35706a] text-xs font-medium">Бонусы</span>
          <span className="ml-1 bg-[#4AC6B7] text-white rounded-full px-2 py-0.5 text-xs font-bold">99</span>
        </div>
        <button className="relative">
          <svg width="22" height="22" fill="none" stroke="#4AC6B7" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0h-6"/></svg>
          <span className="absolute -top-1 -right-1 bg-[#B99A7C] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">9</span>
        </button>
      </div>
    </header>
  );
}
