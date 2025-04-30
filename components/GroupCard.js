import React from "react";

export default function GroupCard({ name, imgUrl, onClick, active }) {
  return (
    <div
      className={
        "flex flex-col items-center bg-[#23242A] rounded-2xl shadow-xl p-4 cursor-pointer min-h-[170px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 " +
        (active ? "ring-2 ring-blue-400" : "")
      }
      onClick={onClick}
      style={{ boxShadow: '0 2px 16px 0 #181a2033' }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={name}
          className="w-20 h-20 object-contain rounded-xl mb-3 bg-[#181A20]"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl mb-3 flex items-center justify-center bg-[#181A20] text-3xl text-gray-500">
          🗂️
        </div>
      )}
      <span className="font-semibold text-base text-center mt-auto mb-2 whitespace-normal break-words">
        {name}
      </span>
    </div>
  );
}
