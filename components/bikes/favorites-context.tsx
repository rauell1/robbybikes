"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { MotorcycleWithImages } from "@/lib/db/schema";

type FavoritesContextType = {
  favorites: string[];
  savedBikes: MotorcycleWithImages[];
  isFavorite: (bikeId: string) => boolean;
  toggleFavorite: (bike: MotorcycleWithImages) => void;
  removeFavorite: (bikeId: string) => void;
  clearFavorites: () => void;
  isModalOpen: boolean;
  openFavoritesModal: () => void;
  closeFavoritesModal: () => void;
  count: number;
};

const defaultFavoritesContext: FavoritesContextType = {
  favorites: [],
  savedBikes: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  removeFavorite: () => {},
  clearFavorites: () => {},
  isModalOpen: false,
  openFavoritesModal: () => {},
  closeFavoritesModal: () => {},
  count: 0,
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = "robbybikes_saved_bikes";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [savedBikes, setSavedBikes] = useState<MotorcycleWithImages[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedBikes(parsed);
        }
      }
    } catch {
      // Local storage unavailable or disabled
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Check URL for shared shortlist (e.g. ?shortlist=id1,id2)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedShortlist = urlParams.get("shortlist");
      if (!sharedShortlist) return;

      const ids = sharedShortlist
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (ids.length === 0) return;

      fetch(`/api/bikes/shortlist?ids=${encodeURIComponent(ids.join(","))}`)
        .then((res) => (res.ok ? res.json() : { bikes: [] }))
        .then((data) => {
          if (Array.isArray(data.bikes) && data.bikes.length > 0) {
            setSavedBikes((prev) => {
              const existingIds = new Set(prev.map((b) => b.id));
              const newBikes = data.bikes.filter(
                (b: MotorcycleWithImages) => !existingIds.has(b.id),
              );
              return [...prev, ...newBikes];
            });
            setIsModalOpen(true);
            try {
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete("shortlist");
              const newSearch = cleanUrl.searchParams.toString();
              const cleanPath = cleanUrl.pathname + (newSearch ? `?${newSearch}` : "");
              window.history.replaceState({}, "", cleanPath);
            } catch {
              // Ignore history error
            }
          }
        })
        .catch((err) => console.error("Shortlist import error:", err));
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBikes));
    } catch {
      // Quota exceeded or private browsing
    }
  }, [savedBikes, isInitialized]);

  const favorites = savedBikes.map((bike) => bike.id);

  const isFavorite = (bikeId: string) => favorites.includes(bikeId);

  const toggleFavorite = (bike: MotorcycleWithImages) => {
    setSavedBikes((prev) => {
      const exists = prev.some((item) => item.id === bike.id);
      if (exists) {
        return prev.filter((item) => item.id !== bike.id);
      }
      return [...prev, bike];
    });
  };

  const removeFavorite = (bikeId: string) => {
    setSavedBikes((prev) => prev.filter((item) => item.id !== bikeId));
  };

  const clearFavorites = () => {
    setSavedBikes([]);
  };

  const openFavoritesModal = () => setIsModalOpen(true);
  const closeFavoritesModal = () => setIsModalOpen(false);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        savedBikes,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        isModalOpen,
        openFavoritesModal,
        closeFavoritesModal,
        count: savedBikes.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  return context ?? defaultFavoritesContext;
}
