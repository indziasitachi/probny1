"use client";
import React, { useEffect, useState } from 'react';
import SearchBar from "./SearchBar";
import BannerCarousel from "./BannerCarousel";
import ProductsList from "./ProductsList";
import CategorySliderMobile from "./CategorySliderMobile";

// Helper function (copied from app/catalog/page.js or can be moved to a utils file)
function groupByParent(groups) {
  const map = {};
  if (!Array.isArray(groups)) {
    // console.warn("groupByParent: input is not an array", groups); // Можно раскомментировать для отладки
    return map;
  }
  groups.forEach(g => {
    // Предполагаем, что группы из ms-groups имеют структуру { id: '...', name: '...', productFolder: { meta: { href: '...' } } } для родительских связей
    // или просто { id: '...', name: '...', parentId: '...' }
    // Адаптируем под структуру данных из /api/ms-groups
    // Если productFolder содержит ID родителя, используем его
    let parentId = null;
    if (g.productFolder && g.productFolder.meta && g.productFolder.meta.href) {
         // Пример: "https://api.moysklad.ru/api/remap/1.2/entity/productfolder/uuid123"
        const parts = g.productFolder.meta.href.split('/');
        parentId = parts[parts.length -1];
    } else if (g.parentId) { // Если есть прямое поле parentId
        parentId = g.parentId;
    }
    // Группы верхнего уровня могут не иметь productFolder или их productFolder.meta.href может быть ссылкой на саму группу или корневой каталог
    // Для таких случаев parentId останется null, что корректно для groupByParent

    if (!map[parentId]) map[parentId] = [];
    map[parentId].push(g);
  });
  return map;
}

// Helper function (copied from app/catalog/page.js or can be moved to a utils file)
function collectAllSubgroupIds(groupId, groupMap) {
  let ids = [];
  const children = groupMap[groupId] || [];
  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(collectAllSubgroupIds(child.id, groupMap));
  }
  return ids;
}

export default function Home() {
  const [allOriginalProducts, setAllOriginalProducts] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/ms-products").then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch ms-products: ${res.status}`))),
      fetch("/api/ms-groups").then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch ms-groups: ${res.status}`)))
    ]).then(([productsResponse, groupsResponse]) => {
      const fetchedProducts = productsResponse.products || productsResponse || []; // Адаптация под возможные форматы ответа
      const fetchedGroups = groupsResponse.groups || groupsResponse || [];       // Адаптация под возможные форматы ответа
      
      setAllOriginalProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      setAllGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
      setDisplayedProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      setIsLoading(false);
    }).catch(error => {
      console.error("Error fetching data for Home page:", error);
      setAllOriginalProducts([]);
      setAllGroups([]);
      setDisplayedProducts([]);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isLoading) return; // Не фильтровать, если данные еще загружаются

    if (!searchQuery.trim()) {
      setDisplayedProducts(allOriginalProducts);
      return;
    }

    const lowerSearchQuery = searchQuery.toLowerCase().trim();
    
    // 1. Фильтруем товары по названию или артикулу
    const productsMatchingText = allOriginalProducts.filter(p =>
      (p.name && p.name.toLowerCase().includes(lowerSearchQuery)) ||
      (p.article && p.article.toLowerCase().includes(lowerSearchQuery))
    );

    // 2. Фильтруем товары по названию группы/подгруппы
    const groupMap = groupByParent(allGroups);
    const matchedGroupAndSubgroupIds = new Set();

    allGroups.forEach(group => {
      if (group.name && group.name.toLowerCase().includes(lowerSearchQuery)) {
        matchedGroupAndSubgroupIds.add(group.id);
        const subgroupIds = collectAllSubgroupIds(group.id, groupMap);
        subgroupIds.forEach(id => matchedGroupAndSubgroupIds.add(id));
      }
    });
    
    const productsInMatchingGroups = allOriginalProducts.filter(p => {
      // Предполагаем, что товар p имеет поле productFolder.id, связывающее его с группой
      const folderId = p.productFolder && (p.productFolder.id || (p.productFolder.meta && p.productFolder.meta.href && p.productFolder.meta.href.split('/').pop()));
      return folderId && matchedGroupAndSubgroupIds.has(folderId);
    });

    // Объединяем результаты и удаляем дубликаты
    const combinedResults = [...new Map([...productsMatchingText, ...productsInMatchingGroups].map(item => [item.id, item])).values()];
    setDisplayedProducts(combinedResults);

  }, [searchQuery, allOriginalProducts, allGroups, isLoading]);

  // Очищаем комментарии в конце файла, которые могли вызывать проблемы
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col" style={{ gap: '8px' }}>
      <SearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <BannerCarousel />
      <CategorySliderMobile /> {/* Этот компонент может потребовать обновления/скрытия в зависимости от результатов поиска */}
      
      {isLoading && <div className="text-center text-gray-500 py-8">Загрузка товаров...</div>}
      
      {!isLoading && displayedProducts.length === 0 && searchQuery.trim() && (
        <div className="text-center text-gray-500 py-8">{`По вашему запросу "${searchQuery}" ничего не найдено.`}</div> 
      )}
      
      {!isLoading && displayedProducts.length > 0 && (
        <ProductsList products={displayedProducts} />
      )}
      
      {/* Случай, когда НЕ идет загрузка, НЕТ результатов И НЕТ поискового запроса (т.е. изначально нет товаров) */}
      {!isLoading && displayedProducts.length === 0 && !searchQuery.trim() && allOriginalProducts.length === 0 && (
         <div className="text-center text-gray-500 py-8">Товары не найдены.</div>
      )}
    </main>
  );
}
// Полностью удалены комментарии "// ... existing code ..." и "// dummy change for git" из конца файла.
