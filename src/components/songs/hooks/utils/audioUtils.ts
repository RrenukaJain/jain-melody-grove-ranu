
export const cleanupAudio = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
  audio.src = '';
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
};

export const createAudioLoadPromise = (audio: HTMLAudioElement) => {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const onCanPlay = () => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
      resolve(audio);
    };
    
    const onError = (e: Event) => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
      reject(new Error("Failed to load audio"));
    };
    
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);
  });
};
