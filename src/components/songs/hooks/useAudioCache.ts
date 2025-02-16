
import { useRef } from "react";
import { AudioCache } from "../types";
import { cleanupAudio } from "./utils/audioUtils";

const CACHE_SIZE_LIMIT = 5;

export const useAudioCache = () => {
  const audioCache = useRef<AudioCache>({});
  const preloadQueue = useRef<Set<string>>(new Set());

  const cleanupCache = () => {
    const entries = Object.entries(audioCache.current);
    if (entries.length > CACHE_SIZE_LIMIT) {
      const sortedEntries = entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
      const entriesToRemove = sortedEntries.slice(0, entries.length - CACHE_SIZE_LIMIT);
      
      entriesToRemove.forEach(async ([id, { audio }]) => {
        await cleanupAudio(audio);
        delete audioCache.current[id];
      });
    }
  };

  const getCachedAudio = (songId: string) => {
    return audioCache.current[songId] || null;
  };

  const setCachedAudio = (songId: string, audio: HTMLAudioElement) => {
    audioCache.current[songId] = {
      audio,
      lastUsed: Date.now()
    };
    cleanupCache();
  };

  const isInPreloadQueue = (songId: string) => preloadQueue.current.has(songId);
  const addToPreloadQueue = (songId: string) => preloadQueue.current.add(songId);
  const removeFromPreloadQueue = (songId: string) => preloadQueue.current.delete(songId);

  const cleanup = async () => {
    await Promise.all(
      Object.values(audioCache.current).map(({ audio }) => cleanupAudio(audio))
    );
    audioCache.current = {};
    preloadQueue.current.clear();
  };

  return {
    getCachedAudio,
    setCachedAudio,
    isInPreloadQueue,
    addToPreloadQueue,
    removeFromPreloadQueue,
    cleanup
  };
};
