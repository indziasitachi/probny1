"use client";
import React, { useState, useEffect } from 'react';

export default function NotificationSubscribeButton() {
    const [notificationPermission, setNotificationPermission] = useState(null); // 'granted', 'denied', 'default'

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setNotificationPermission('unsupported');
            return;
        }
        setNotificationPermission(Notification.permission);
    }, []);

    const requestNotificationPermission = async () => {
        if (notificationPermission === 'granted') return;
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                subscribeToPush();
            } else {
                alert('Вы запретили показ уведомлений.');
            }
        } catch (error) {
            alert('Произошла ошибка при запросе разрешения.');
        }
    };

    const subscribeToPush = async () => {
        const applicationServerKey = typeof window !== 'undefined' ? window.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;
        if (!applicationServerKey) {
            alert('Ошибка конфигурации: VAPID ключ отсутствует.');
            return;
        }
        const applicationServerKeyUint8Array = urlBase64ToUint8Array(applicationServerKey);
        if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const existingSubscription = await registration.pushManager.getSubscription();
                if (existingSubscription) {
                    alert('Уведомления уже включены и подписаны.');
                    return;
                }
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKeyUint8Array
                });
                const sendResult = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription),
                });
                if (sendResult.ok) {
                    alert('Подписка на уведомления оформлена!');
                } else {
                    alert(`Ошибка при сохранении подписки на сервере: ${sendResult.status}`);
                }
            } catch (error) {
                alert(`Ошибка при включении уведомлений: ${error.message}`);
            }
        }
    };

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    if (notificationPermission === 'unsupported') {
        return <p className="text-gray-600">Ваш браузер не поддерживает уведомления.</p>;
    }
    if (notificationPermission === 'denied') {
        return <p className="text-red-600">Вы запретили уведомления. Разрешите их в настройках браузера.</p>;
    }
    if (notificationPermission === 'granted') {
        return <p className="text-green-600 font-semibold">Уведомления включены!</p>;
    }
    return (
        <button
            onClick={requestNotificationPermission}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
        >
            Включить уведомления
        </button>
    );
} 