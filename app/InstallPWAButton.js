'use client';

import React, { useState, useEffect } from 'react';

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    console.log('[PWA Button] useEffect started.');

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA Button] App is in standalone mode or already installed.');
      setIsAppInstalled(true);
      return;
    }
    console.log('[PWA Button] App is NOT in standalone mode.');

    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA Button] beforeinstallprompt event fired!', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setBannerDismissed(false);
      console.log('[PWA Button] deferredPrompt set, bannerDismissed set to false.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    console.log('[PWA Button] Added beforeinstallprompt listener.');

    const handleAppInstalled = () => {
      console.log('[PWA Button] appinstalled event fired.');
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    console.log('[PWA Button] Added appinstalled listener.');

    return () => {
      console.log('[PWA Button] Cleaning up PWA listeners.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // console.log('InstallPWAButton: Deferred prompt is not available for install click.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // console.log(`InstallPWAButton: User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null); 
    setBannerDismissed(true); 
  };

  const handleDismissBanner = () => {
    // console.log('InstallPWAButton: Banner dismissed by user.');
    setBannerDismissed(true);
  };

  console.log('[PWA Button] State before render - isAppInstalled:', isAppInstalled, 'deferredPrompt:', !!deferredPrompt, 'bannerDismissed:', bannerDismissed);

  if (isAppInstalled || !deferredPrompt || bannerDismissed) {
    console.log('[PWA Button] Banner not rendered. Reasons: isAppInstalled:', isAppInstalled, '!deferredPrompt:', !deferredPrompt, 'bannerDismissed:', bannerDismissed);
    return null;
  }

  console.log('[PWA Button] Rendering PWA install banner.');

  const bannerStyle = {
    position: 'fixed',
    bottom: '0px',
    left: '0px',
    width: '100%',
    padding: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
  };

  const paragraphStyle = {
    margin: '0px 0px 5px 0px',
    fontSize: '16px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '10px',
  };

  const installButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
  };

  const dismissButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '15px',
  };

  return (
    <div style={bannerStyle}>
      <p style={paragraphStyle}>
        Установите наше приложение для лучшего опыта!
      </p>
      <div style={buttonContainerStyle}>
        <button onClick={handleInstallClick} style={installButtonStyle}>
          Установить
        </button>
        <button onClick={handleDismissBanner} style={dismissButtonStyle}>
          Не сейчас
        </button>
      </div>
    </div>
  );
};

export default InstallPWAButton;