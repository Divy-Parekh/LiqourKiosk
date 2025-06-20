// store.js
import { create } from "zustand";

export const useAvatarStore = create((set) => ({
  audioData: null,
  visemeData: null,
  setAvatarData: (audioData, visemeData) =>
    set({ audioData, visemeData }),
}));
