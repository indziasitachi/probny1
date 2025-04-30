"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductGroups({ activeGroup, onSelectGroup, groups = [] }) {
  const router = useRouter();

  const scrollRef = React.useRef(null);
  useEffect(() => {
    if (groups.length === 0) {
      fetch("/api/groups-subgroups").then(r => r.json()).then(data => {
        groups = data.groups || [];
      });
    }
  }, []);
  if (!groups || groups.length === 0) return null;
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }
  };
  // Универсальный обработчик клика по группе
  const handleGroupClick = (group) => {
    if (typeof onSelectGroup === 'function') {
      onSelectGroup(group.slug || group.name || group);
    } else {
      router.push(`/catalog?group=${group.slug || group.name || group}`);
    }
  };
  return (
    <div className="relative w-full flex items-center mb-4">
      {/* Left arrow */}
      <button
        className="hidden md:flex absolute left-0 z-10 w-9 h-9 bg-gray-800/80 text-white rounded-full items-center justify-center text-2xl"
        style={{left: '-18px'}}
        onClick={() => scroll(-1)}
        tabIndex={-1}
        aria-label="Прокрутить влево"
      >
        &#8592;
      </button>
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar px-10 w-full"
        style={{scrollSnapType: 'x mandatory'}}
      >
        {groups.map((g) => (
          <div key={g.slug || g.name || g} className="flex flex-col items-center w-16">
            <button
              className={`flex items-center justify-center w-16 h-16 rounded-full transition text-4xl select-none border-2 ${activeGroup === (g.slug || g.name || g) ? "border-blue-400 bg-gray-800 text-white" : "border-transparent bg-gray-800/60 text-white/80"}`}
              style={{scrollSnapAlign: 'center'}}
              onClick={() => handleGroupClick(g)}
              title={g.name || g}
            >
              {g.icon && (
                <img
                  src={g.icon}
                  alt={g.name || g}
                  className="w-10 h-10 object-contain rounded-full"
                />
              )}
            </button>
            <span className="mt-1 text-xs text-center text-white/90 leading-tight max-w-[4rem] break-words" style={{wordBreak: 'break-word'}}>{g.name || g}</span>
          </div>
        ))}
      </div>
      {/* Right arrow */}
      <button
        className="hidden md:flex absolute right-0 z-10 w-9 h-9 bg-gray-800/80 text-white rounded-full items-center justify-center text-2xl"
        style={{right: '-18px'}}
        onClick={() => scroll(1)}
        tabIndex={-1}
        aria-label="Прокрутить вправо"
      >
        &#8594;
      </button>
    </div>
  );
}
