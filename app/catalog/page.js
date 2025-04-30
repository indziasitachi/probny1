"use client";
import React, { useEffect, useState } from "react";
import ProductsList from "../ProductsList";
import SearchBar from "../SearchBar";

// --- Группируем группы по parentId для быстрого доступа ---
function groupByParent(groups) {
  const map = {};
  groups.forEach(g => {
    const parentId = g.productFolder && g.productFolder.meta && g.productFolder.meta.href
      ? g.productFolder.meta.href.split('/').pop()
      : null;
    if (!map[parentId]) map[parentId] = [];
    map[parentId].push(g);
  });
  return map;
}

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentGroup, setCurrentGroup] = useState(null); // текущая выбранная категория

  useEffect(() => {
    Promise.all([
      fetch("/api/ms-products").then(r => r.json()),
      fetch("/api/ms-groups").then(r => r.json())
    ]).then(([prod, grp]) => {
      setProducts(prod.products || []);
      setGroups(grp.groups || []);
      setLoading(false);
    });
  }, []);

  // --- Получить id текущей группы (или null для корня) ---
  const currentGroupId = currentGroup ? currentGroup.id : null;

  // --- Группировка групп по parentId ---
  const groupMap = groupByParent(groups);
  const subGroups = groupMap[currentGroupId] || [];

  // --- Собираем id всех подгрупп текущей группы рекурсивно ---
  function collectAllSubgroupIds(groupId) {
    let ids = [];
    const children = groupMap[groupId] || [];
    for (const child of children) {
      ids.push(child.id);
      ids = ids.concat(collectAllSubgroupIds(child.id));
    }
    return ids;
  }
  const allSubgroupIds = currentGroupId ? collectAllSubgroupIds(currentGroupId) : [];

  // --- Фильтрация товаров по текущей группе и всем её подгруппам ---
  const groupProducts = products.filter(p => {
    if (!currentGroupId) return false;
    const folderId = p.productFolder && p.productFolder.id;
    return folderId === currentGroupId || allSubgroupIds.includes(folderId);
  });

  // Для поиска по группам и товарам
  const filteredSubGroups = search.trim()
    ? subGroups.filter(g => g.name.toLowerCase().includes(search.trim().toLowerCase()))
    : subGroups;
  const filteredProducts = search.trim()
    ? products.filter(p => (p.name && p.name.toLowerCase().includes(search.trim().toLowerCase())) || (p.article && p.article.toLowerCase().includes(search.trim().toLowerCase())))
    : (currentGroupId ? groupProducts : []);

  if (loading) return <div>Загрузка каталога...</div>;

  return (
    <div className="p-3 md:p-8 max-w-5xl mx-auto">
      {/* Поиск */}
      <div className="mb-5">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Секция: Категории (группы и подгруппы) */}
      {filteredSubGroups.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2 mt-4">Категории</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {filteredSubGroups.map(group => (
              <button
                key={group.id}
                className="bg-white rounded-xl shadow flex flex-col items-stretch p-0 hover:shadow-md transition border border-[#F0F1F3] min-h-[80px] overflow-hidden"
                onClick={() => setCurrentGroup(group)}
                style={{ aspectRatio: '1/1' }}
              >
                <div className="flex-1 w-full h-full flex items-center justify-center">
                  <img
                    src={group.image || "/category-placeholder.svg"}
                    alt={group.name}
                    className="object-cover w-full h-full min-h-0 min-w-0"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.onerror = null; e.target.src = '/category-placeholder.svg'; }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900 text-center line-clamp-2 p-1 bg-white/80 w-full z-10" style={{ marginTop: '-1.5rem', position: 'relative' }}>{group.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {/* Секция: Товары */}
      {filteredProducts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2 mt-4">Товары</h3>
          <ProductsList products={filteredProducts} />
        </>
      )}
      {/* Если ничего не найдено */}
      {filteredSubGroups.length === 0 && filteredProducts.length === 0 && (
        <div className="text-center text-gray-400 py-8">Нет подкатегорий и товаров</div>
      )}
    </div>
  );
}
