// lib/browserSupport.ts
export const checkBrowserSupport = () => {
  const isSupported = {
    speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  };

  return {
    ...isSupported,
    allSupported: Object.values(isSupported).every(Boolean)
  };
};