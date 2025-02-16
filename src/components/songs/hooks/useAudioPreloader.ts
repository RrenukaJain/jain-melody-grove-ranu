
import { useAudioCache } from "./useAudioCache";
import { cleanupAudio, createAudioLoadPromise } from "./utils/audioUtils";
import { Song } from "../types";

export const useAudioPreloader = () => {
  const {
    getCachedAudio,
    setCachedAudio,
    isInPreloadQueue,
    addToPreloadQueue,
    removeFromPreloadQueue
  } = useAudioCache();

  const preloadAudio = async (fileUrl: string, songId: string): Promise<HTMLAudioElement> => {
    const cached = getCachedAudio(songId);
    if (cached) {
      cached.lastUsed = Date.now();
      const cachedAudio = cached.audio;
      await cleanupAudio(cachedAudio);
      
      return new Promise((resolve, reject) => {
        cachedAudio.src = fileUrl;
        
        const onCanPlay = () => {
          cachedAudio.removeEventListener('canplaythrough', onCanPlay);
          cachedAudio.removeEventListener('error', onError);
          resolve(cachedAudio);
        };
        
        const onError = (e: Event) => {
          cachedAudio.removeEventListener('canplaythrough', onCanPlay);
          cachedAudio.removeEventListener('error', onError);
          reject(new Error("Failed to load audio"));
        };
        
        cachedAudio.addEventListener('canplaythrough', onCanPlay);
        cachedAudio.addEventListener('error', onError);
        cachedAudio.load();
      });
    }

    if (isInPreloadQueue(songId)) {
      return new Promise((resolve, reject) => {
        const checkCache = setInterval(() => {
          const cached = getCachedAudio(songId);
          if (cached) {
            clearInterval(checkCache);
            resolve(cached.audio);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkCache);
          reject(new Error("Preload timeout"));
        }, 10000);
      });
    }

    addToPreloadQueue(songId);

    try {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = fileUrl;
      
      const loadedAudio = await createAudioLoadPromise(audio);
      
      setCachedAudio(songId, loadedAudio);
      return loadedAudio;
    } finally {
      removeFromPreloadQueue(songId);
    }
  };

  const preloadAdjacentSongs = async (songs: Song[], currentIndex: number) => {
    if (!songs || currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % songs.length;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;

    preloadAudio(songs[nextIndex].file_url, songs[nextIndex].id).catch(() => {
      console.log("Failed to preload next song");
    });

    preloadAudio(songs[prevIndex].file_url, songs[prevIndex].id).catch(() => {
      console.log("Failed to preload previous song");
    });
  };

  return {
    preloadAudio,
    preloadAdjacentSongs
  };
};
