"use client";
import React, { useState, useEffect, useCallback } from 'react';

export default function GroupIconsManager() {
  const [groups, setGroups] = useState([]); // Группы из МойСклад
  const [iconsMap, setIconsMap] = useState({}); // Текущие иконки {id: url}
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingIcons, setLoadingIcons] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // Хранит ID группы, для которой идет загрузка
  const [filter, setFilter] = useState('');

  // Загрузка групп из МойСклад
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch('/api/ms-groups');
      if (!res.ok) throw new Error(`Failed to fetch groups: ${res.statusText}`);
      const data = await res.json();
      // Сортируем группы по имени для удобства
      const sortedGroups = (data.groups || []).sort((a, b) => a.name.localeCompare(b.name));
      setGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      alert(`Ошибка загрузки списка групп: ${error.message}`);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  // Загрузка текущих иконок
  const fetchIcons = useCallback(async () => {
    setLoadingIcons(true);
    try {
      const res = await fetch('/api/group-icons');
      if (!res.ok) throw new Error(`Failed to fetch icons: ${res.statusText}`);
      const data = await res.json();
      setIconsMap(data || {});
    } catch (error) {
      console.error("Error fetching icons:", error);
      alert(`Ошибка загрузки иконок: ${error.message}`);
    } finally {
      setLoadingIcons(false);
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchGroups();
    fetchIcons();
  }, [fetchGroups, fetchIcons]);

  // Обработчик загрузки файла
  const handleFileUpload = async (groupId, file) => {
    if (!file) return;
    setUploading(groupId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }
      // Обновляем карту иконок локально
      setIconsMap(prev => ({
        ...prev,
        [groupId]: data.url
      }));
      // Сразу сохраняем изменения на сервере
      await saveIcons({ ...iconsMap, [groupId]: data.url });
      alert('Иконка загружена и сохранена!');
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Ошибка загрузки файла: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  // Обработчик удаления иконки
  const handleRemoveIcon = async (groupId) => {
    const rest = Object.fromEntries(Object.entries(iconsMap).filter(([key]) => key !== groupId)); // Удаляем ключ из объекта без использования _
    setIconsMap(rest);
    await saveIcons(rest);
    alert('Иконка удалена.');
  };

  // Функция сохранения всех иконок
  const saveIcons = async (dataToSave) => {
    setSaving(true);
    try {
      const res = await fetch('/api/group-icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      // Обновляем локальное состояние после успешного сохранения (если передавались не все данные)
      // В данном случае мы всегда передаем все, так что можно не обновлять или вызвать fetchIcons() для синхронизации
      // setIconsMap(dataToSave); // Можно и так, если уверены в данных
      console.log("Icons saved successfully.");
    } catch (error) {
      console.error("Error saving icons:", error);
      alert(`Ошибка сохранения иконок: ${error.message}`);
      // Если сохранение не удалось, лучше перезагрузить иконки с сервера,
      // чтобы вернуть UI в актуальное состояние
      fetchIcons();
    } finally {
      setSaving(false);
    }
  };

  // Фильтрация групп
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(filter.toLowerCase())
  );

  const isLoading = loadingGroups || loadingIcons;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Управление иконками групп каталога</h1>

      {/* Индикаторы загрузки/сохранения */}
      {isLoading && <div className="text-center py-4 text-gray-500">Загрузка данных...</div>}
      {saving && <div className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded shadow-lg z-50">Сохранение...</div>}

      {/* Фильтр */}
      {!isLoading && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Фильтр по названию группы..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded shadow-sm"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Список групп */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => {
              const currentIcon = iconsMap[group.id];
              const isUploading = uploading === group.id;
              return (
                <div key={group.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded shadow-sm bg-white">
                  {/* Иконка и название */}
                  <div className="flex items-center gap-3 flex-grow w-full md:w-auto">
                    <div className="w-16 h-16 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                      {currentIcon ? (
                        <img src={currentIcon} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">Нет иконки</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-800 flex-1 break-words">{group.name}</span>
                    {/* <span className="text-xs text-gray-400">ID: {group.id}</span> */}
                  </div>

                  {/* Управление иконкой */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                    <input
                      type="file"
                      accept="image/*, .svg"
                      id={`upload-${group.id}`}
                      className="hidden" // Скрываем стандартный input
                      onChange={(e) => handleFileUpload(group.id, e.target.files[0])}
                      disabled={isUploading || saving}
                    />
                    <label
                      htmlFor={`upload-${group.id}`}
                      className={`cursor-pointer px-3 py-1.5 text-sm rounded transition ${isUploading || saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      {isUploading ? 'Загрузка...' : (currentIcon ? 'Изменить' : 'Загрузить')}
                    </label>
                    {currentIcon && (
                      <button
                        onClick={() => handleRemoveIcon(group.id)}
                        className={`px-3 py-1.5 text-sm rounded transition ${saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                        disabled={saving || isUploading}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-6">
              {groups.length === 0 ? 'Группы не найдены.' : 'Нет групп, соответствующих фильтру.'}
            </div>
          )}
        </div>
      )}

      {/* Кнопка сохранить все (не используется, сохранение по факту загрузки/удаления) */}
      {/* 
      {!isLoading && groups.length > 0 && (
        <div className="mt-6 text-right">
          <button 
            onClick={() => saveIcons(iconsMap)} 
            className={`px-6 py-2 rounded text-white font-semibold transition ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить все изменения'}
          </button>
        </div>
      )}
      */}
    </div>
  );
}
