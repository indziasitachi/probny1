import React from "react";

const navItems = [
  {
    label: "Главная",
    href: "/",
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
    ),
    active: true
  },
  {
    label: "Каталог",
    href: "/catalog",
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
    )
  },
  {
    label: "Корзина",
    href: "/cart",
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    )
  },
  {
    label: "Избранное",
    href: "/favorites",
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3A5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"/></svg>
    )
  },
  {
    label: "Войти",
    href: "/login",
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/></svg>
    )
  }
];

export default function BottomNavMobile() {
  return (
    <nav className="block md:hidden fixed bottom-0 left-0 w-full bg-[#181A20] border-t border-[#23242A] z-50" style={{boxShadow:'0 -2px 16px 0 #0008'}}>
      <div className="flex justify-between items-center px-2">
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 flex-1 ${item.active ? 'text-white font-bold' : 'text-gray-400'}`}
            style={{minWidth: 0, position: 'relative'}}
          >
            <div className="relative flex items-center justify-center">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5" style={{fontSize: '11px'}}>{item.badge}</span>
              )}
            </div>
            <span className="text-xs mt-0.5 leading-tight text-center" style={{maxWidth: 60}}>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
