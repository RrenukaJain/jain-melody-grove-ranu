import { useRef } from "react";
import { AudioCache } from "../types";
import { cleanupAudio } from "./utils/audioUtils";

const CACHE_SIZE_LIMIT = 5;

export const useAudioCache = () => {
  const audioCache = useRef<AudioCache>({});
  const preloadQueue = useRef<Set<string>>(new Set());
  const activePlaybackId = useRef<string | null>(null);

  const cleanupCache = async () => {
    try {
      const entries = Object.entries(audioCache.current);
      if (entries.length > CACHE_SIZE_LIMIT) {
        const sortedEntries = entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
        const entriesToRemove = sortedEntries
          .slice(0, entries.length - CACHE_SIZE_LIMIT)
          // Don't remove currently playing audio
          .filter(([id]) => id !== activePlaybackId.current);

        await Promise.all(
          entriesToRemove.map(async ([id, { audio }]) => {
            try {
              await cleanupAudio(audio);
              delete audioCache.current[id];
            } catch (error) {
              console.error(`Failed to cleanup audio ${id}:`, error);
            }
          })
        );
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  };

  const getCachedAudio = (songId: string) => {
    return audioCache.current[songId] || null;
  };

  const setCachedAudio = async (songId: string, audio: HTMLAudioElement) => {
    try {
      audioCache.current[songId] = {
        audio,
        lastUsed: Date.now()
      };
      await cleanupCache();
    } catch (error) {
      console.error(`Failed to set cached audio ${songId}:`, error);
    }
  };

  const setActivePlayback = (songId: string | null) => {
    activePlaybackId.current = songId;
  };

  const isInPreloadQueue = (songId: string) => preloadQueue.current.has(songId);
  const addToPreloadQueue = (songId: string) => preloadQueue.current.add(songId);
  const removeFromPreloadQueue = (songId: string) => preloadQueue.current.delete(songId);

  const cleanup = async () => {
    try {
      await Promise.all(
        Object.values(audioCache.current).map(({ audio }) => cleanupAudio(audio))
      );
      audioCache.current = {};
      preloadQueue.current.clear();
      activePlaybackId.current = null;
    } catch (error) {
      console.error('Failed to cleanup audio cache:', error);
    }
  };

  return {
    getCachedAudio,
    setCachedAudio,
    isInPreloadQueue,
    addToPreloadQueue,
    removeFromPreloadQueue,
    setActivePlayback,
    cleanup
  };
};
