"use client";
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin_auth") === "1";
      if (!isAuth && window.location.pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    }
  }, [router]);
  return children;
}
