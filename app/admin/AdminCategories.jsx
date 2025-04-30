import React, { useEffect, useState } from "react";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ label: "", icon: "" });
  const [editIdx, setEditIdx] = useState(null);
  const [editCat, setEditCat] = useState({ label: "", icon: "" });
  const [loading, setLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  // Save categories to API
  const saveCategories = async (cats) => {
    setLoading(true);
    setCategories(cats);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cats),
    });
    setLoading(false);
  };

  const handleAdd = () => {
    if (!newCat.label.trim() || !newCat.icon.trim()) return;
    const updated = [...categories, newCat];
    saveCategories(updated);
    setNewCat({ label: "", icon: "" });
  };

  const handleDelete = (idx) => {
    const updated = categories.filter((_, i) => i !== idx);
    saveCategories(updated);
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditCat(categories[idx]);
  };

  const handleEditSave = () => {
    const updated = categories.map((cat, i) => (i === editIdx ? editCat : cat));
    saveCategories(updated);
    setEditIdx(null);
  };

  const handleMove = (idx, dir) => {
    const updated = [...categories];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= categories.length) return;
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    saveCategories(updated);
  };

  const handleNewCatFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await readFileAsDataUrl(file);
      setNewCat({ ...newCat, icon: url });
    }
  };

  const handleEditCatFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await readFileAsDataUrl(file);
      setEditCat({ ...editCat, icon: url });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Категории (панель для главной)</h2>
      <ul className="mb-4">
        {categories.map((cat, idx) => (
          <li key={idx} className="flex items-center gap-2 mb-2 bg-gray-50 rounded p-2">
            {cat.icon && cat.icon.startsWith('data:') ? (
              <img src={cat.icon} alt="icon" className="w-8 h-8 rounded-full bg-gray-200" />
            ) : (
              <img src={cat.icon} alt="icon" className="w-8 h-8 rounded-full bg-gray-200" />
            )}
            {editIdx === idx ? (
              <>
                <input
                  value={editCat.label}
                  onChange={e => setEditCat({ ...editCat, label: e.target.value })}
                  className="border rounded px-2 py-1 text-sm mr-2"
                  placeholder="Название"
                />
                <input
                  value={editCat.icon}
                  onChange={e => setEditCat({ ...editCat, icon: e.target.value })}
                  className="border rounded px-2 py-1 text-sm mr-2"
                  placeholder="URL иконки"
                />
                <input type="file" accept="image/*" className="text-xs" onChange={handleEditCatFile} />
                <button className="text-green-600 font-bold mr-1" onClick={handleEditSave}>✔</button>
                <button className="text-gray-500 font-bold" onClick={() => setEditIdx(null)}>✖</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{cat.label}</span>
                <span className="text-xs text-gray-400">{cat.icon && cat.icon.startsWith('data:') ? 'Фото' : cat.icon}</span>
                <button className="text-blue-600 text-xs ml-1" onClick={() => handleEdit(idx)}>Изм.</button>
                <button className="text-red-500 text-xs ml-1" onClick={() => handleDelete(idx)}>Удалить</button>
                <button className="text-gray-500 text-xs ml-1" onClick={() => handleMove(idx, -1)} disabled={idx===0}>↑</button>
                <button className="text-gray-500 text-xs ml-1" onClick={() => handleMove(idx, 1)} disabled={idx===categories.length-1}>↓</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 mb-2">
        <input
          value={newCat.label}
          onChange={e => setNewCat({ ...newCat, label: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
          placeholder="Название категории"
        />
        <input
          value={newCat.icon}
          onChange={e => setNewCat({ ...newCat, icon: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
          placeholder="URL иконки"
        />
        <input type="file" accept="image/*" className="text-xs" onChange={handleNewCatFile} />
        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold" onClick={handleAdd} disabled={loading}>
          {loading ? 'Сохр...' : 'Добавить'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">* Можно загрузить фото с устройства или указать URL иконки. Изменения сохраняются на сервере и сразу отображаются на сайте.</p>
    </div>
  );
}
