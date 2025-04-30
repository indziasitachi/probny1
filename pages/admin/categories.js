import React from 'react';
import dynamic from "next/dynamic";

const AdminCategories = dynamic(() => import("../../app/admin/AdminCategories.jsx"), { ssr: false });

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
