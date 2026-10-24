"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { CompareBar } from "./compare-bar";
import { CompareModal } from "./compare-modal";

export type ComparedBike = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  priceKes: number;
  year: number | null;
  engineCc: number | null;
  odometerKm: number | null;
  condition: string;
  transmission: string | null;
  fuelType: string | null;
  registration: string | null;
  status: string;
  imageUrl: string | null;
};

type CompareContextType = {
  compared: ComparedBike[];
  isComparing: (id: string) => boolean;
  toggleCompare: (bike: MotorcycleWithImages | ComparedBike) => void;
  removeBike: (id: string) => void;
  clearCompare: () => void;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "robbybikes_compare_list";
const MAX_COMPARE = 4;

function toComparedBike(bike: MotorcycleWithImages | ComparedBike): ComparedBike {
  if ("images" in bike) {
    return {
      id: bike.id,
      slug: bike.slug,
      brand: bike.brand,
      model: bike.model,
      priceKes: bike.priceKes,
      year: bike.year,
      engineCc: bike.engineCc,
      odometerKm: bike.odometerKm,
      condition: bike.condition,
      transmission: bike.transmission,
      fuelType: bike.fuelType,
      registration: bike.registration,
      status: bike.status,
      imageUrl: bike.images[0]?.imageUrl ?? null,
    };
  }
  return bike;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compared, setCompared] = useState<ComparedBike[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompared(parsed.slice(0, MAX_COMPARE));
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const saveToStorage = useCallback((items: ComparedBike[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, []);

  const isComparing = useCallback(
    (id: string) => compared.some((bike) => bike.id === id),
    [compared],
  );

  const toggleCompare = useCallback(
    (input: MotorcycleWithImages | ComparedBike) => {
      const item = toComparedBike(input);
      setCompared((prev) => {
        const exists = prev.some((b) => b.id === item.id);
        let updated: ComparedBike[];
        if (exists) {
          updated = prev.filter((b) => b.id !== item.id);
        } else {
          if (prev.length >= MAX_COMPARE) {
            // Replace the oldest or prevent more than MAX_COMPARE
            updated = [...prev.slice(1), item];
          } else {
            updated = [...prev, item];
          }
        }
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage],
  );

  const removeBike = useCallback(
    (id: string) => {
      setCompared((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage],
  );

  const clearCompare = useCallback(() => {
    setCompared([]);
    saveToStorage([]);
    setIsModalOpen(false);
  }, [saveToStorage]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <CompareContext.Provider
      value={{
        compared,
        isComparing,
        toggleCompare,
        removeBike,
        clearCompare,
        openModal,
        closeModal,
        isModalOpen,
      }}
    >
      {children}
      {isHydrated && (
        <>
          <CompareBar />
          {isModalOpen && <CompareModal />}
        </>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
