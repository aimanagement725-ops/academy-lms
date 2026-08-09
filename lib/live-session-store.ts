import { create } from "zustand";

interface LiveSessionState {
  currentSlideIndex: number;
  totalSlides: number;
  startedAt: number;
  setTotalSlides: (n: number) => void;
  goToSlide: (index: number) => void;
  next: () => void;
  previous: () => void;
}

export const useLiveSessionStore = create<LiveSessionState>((set, get) => ({
  currentSlideIndex: 0,
  totalSlides: 0,
  startedAt: Date.now(),
  setTotalSlides: (n) => set({ totalSlides: n }),
  goToSlide: (index) => set({ currentSlideIndex: index }),
  next: () => {
    const { currentSlideIndex, totalSlides } = get();
    if (currentSlideIndex < totalSlides - 1) set({ currentSlideIndex: currentSlideIndex + 1 });
  },
  previous: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) set({ currentSlideIndex: currentSlideIndex - 1 });
  },
}));
