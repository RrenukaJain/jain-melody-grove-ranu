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

export const createAudioLoadPromise = (audio: HTMLAudioElement, timeoutMs: number = 30000) => {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const onCanPlay = () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve(audio);
    };
    
    const onError = (e: ErrorEvent) => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error(`Failed to load audio: ${e.message}`));
    };
    
    const onTimeout = () => {
      cleanup();
      reject(new Error(`Audio loading timed out after ${timeoutMs}ms`));
    };
    
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
    };
    
    const timeoutId = setTimeout(onTimeout, timeoutMs);
    
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError as EventListener);
  });
};
