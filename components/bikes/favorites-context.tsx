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
