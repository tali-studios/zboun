"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type DeliveryLocation,
  DEFAULT_RADIUS_KM,
  loadDeliveryLocation,
  saveDeliveryLocation,
  clearDeliveryLocation,
} from "@/lib/delivery-location";
import {
  addressLabelFromFormatted,
  isPlaceholderLocationText,
  reverseGeocodeAddress,
} from "@/lib/google-geocode";

type DeliveryLocationCtx = {
  location: DeliveryLocation | null;
  setLocation: (loc: DeliveryLocation) => void;
  clearLocation: () => void;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
};

const Ctx = createContext<DeliveryLocationCtx | null>(null);

export function DeliveryLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(null);
  const [radiusKm, setRadiusKmState] = useState(DEFAULT_RADIUS_KM);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadDeliveryLocation();
    if (saved) {
      setLocationState(saved);
      setRadiusKmState(saved.radiusKm ?? DEFAULT_RADIUS_KM);

      // Fix older saves that stored the placeholder "Current location" instead of a real address
      if (
        isPlaceholderLocationText(saved.address) ||
        isPlaceholderLocationText(saved.label)
      ) {
        void reverseGeocodeAddress(saved.lat, saved.lng).then((geocoded) => {
          if (!geocoded) return;
          const updated: DeliveryLocation = {
            ...saved,
            address: geocoded,
            label: addressLabelFromFormatted(geocoded),
          };
          setLocationState(updated);
          saveDeliveryLocation(updated);
        });
      }
    }
    setHydrated(true);
  }, []);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    setLocationState(loc);
    setRadiusKmState(loc.radiusKm);
    saveDeliveryLocation(loc);
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState(null);
    clearDeliveryLocation();
  }, []);

  const setRadiusKm = useCallback(
    (km: number) => {
      setRadiusKmState(km);
      if (location) {
        const updated = { ...location, radiusKm: km };
        setLocationState(updated);
        saveDeliveryLocation(updated);
      }
    },
    [location],
  );

  const openSheet = useCallback(() => setIsSheetOpen(true), []);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  // Always render the provider — hydrated flag just gates localStorage reads.
  // Never skip the context wrapper or useDeliveryLocation() will throw.
  void hydrated;

  return (
    <Ctx.Provider
      value={{
        location,
        setLocation,
        clearLocation,
        isSheetOpen,
        openSheet,
        closeSheet,
        radiusKm,
        setRadiusKm,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDeliveryLocation(): DeliveryLocationCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDeliveryLocation must be used inside DeliveryLocationProvider");
  return ctx;
}
