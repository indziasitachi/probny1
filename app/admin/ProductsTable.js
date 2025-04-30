"use client";
import React from 'react';
import { useState } from "react";

const initialProducts = [
  { id: 1, name: "Товар 1", price: 1000, image: "", desc: "Описание товара 1" },
  { id: 2, name: "Товар 2", price: 1500, image: "", desc: "Описание товара 2" },
];

export default function ProductsTable() {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", desc: "", image: "" });
  const [imagePreview, setImagePreview] = useState("");

  function handleEdit(product) {
    setEditing(product.id);
    setForm(product);
    setImagePreview(product.image);
  }
  function handleDelete(id) {
    setProducts(products.filter(p => p.id !== id));
  }
  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = e => setImagePreview(e.target.result);
      reader.readAsDataURL(files[0]);
      setForm(f => ({ ...f, image: files[0].name }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleSave(e) {
    e.preventDefault();
    if (editing) {
      setProducts(products.map(p => p.id === editing ? { ...form, id: editing, image: imagePreview } : p));
      setEditing(null);
      setForm({ name: "", price: "", desc: "", image: "" });
      setImagePreview("");
    } else {
      setProducts([
        ...products,
        { ...form, id: Date.now(), image: imagePreview }
      ]);
      setForm({ name: "", price: "", desc: "", image: "" });
      setImagePreview("");
    }
  }
  return (
    <section className="mb-10">
      <h3 className="text-xl font-bold mb-4">Товары</h3>
      <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4 mb-4 items-end">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Название" className="px-2 py-1 border rounded" required />
        <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="Цена" className="px-2 py-1 border rounded" required />
        <input name="desc" value={form.desc} onChange={handleChange} placeholder="Описание" className="px-2 py-1 border rounded" />
        <input name="image" onChange={handleChange} type="file" accept="image/*" className="px-2 py-1 border rounded" />
        {imagePreview && <img src={imagePreview} alt="preview" className="w-12 h-12 object-cover rounded" />}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? "Сохранить" : "Добавить"}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", price: "", desc: "", image: "" }); setImagePreview(""); }} className="ml-2 px-2 py-1 border rounded">Отмена</button>}
      </form>
      <table className="w-full bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Название</th>
            <th className="p-2">Цена</th>
            <th className="p-2">Описание</th>
            <th className="p-2">Изображение</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.price}</td>
              <td className="p-2">{p.desc}</td>
              <td className="p-2">{p.image && <img src={p.image} alt="img" className="w-12 h-12 object-cover rounded" />}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(p)} className="mr-2 px-2 py-1 border rounded">Редактировать</button>
                <button onClick={() => handleDelete(p.id)} className="px-2 py-1 border rounded text-red-500">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
