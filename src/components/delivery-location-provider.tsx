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
  type SavedAddressForMatching,
  DEFAULT_RADIUS_KM,
  formatGeolocationError,
  loadDeliveryLocation,
  resolveCurrentDeliveryLocation,
  saveDeliveryLocation,
} from "@/lib/delivery-location";

type DeliveryLocationCtx = {
  location: DeliveryLocation | null;
  setLocation: (loc: DeliveryLocation) => void;
  clearLocation: () => void;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  isResolvingLocation: boolean;
  locateError: string | null;
};

const Ctx = createContext<DeliveryLocationCtx | null>(null);

export function DeliveryLocationProvider({
  children,
  savedAddresses = [],
}: {
  children: ReactNode;
  savedAddresses?: SavedAddressForMatching[];
}) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(null);
  const [radiusKm, setRadiusKmState] = useState(DEFAULT_RADIUS_KM);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(true);
  const [locateError, setLocateError] = useState<string | null>(null);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    setLocationState(loc);
    setRadiusKmState(loc.radiusKm);
    saveDeliveryLocation(loc);
    setLocateError(null);
  }, []);

  const applyCurrentLocation = useCallback(async (radius = radiusKm) => {
    setIsResolvingLocation(true);
    setLocateError(null);
    try {
      const resolved = await resolveCurrentDeliveryLocation(radius, savedAddresses);
      setLocation(resolved);
    } catch (err) {
      setLocateError(formatGeolocationError(err));
      const saved = loadDeliveryLocation();
      if (saved) {
        setLocationState(saved);
        setRadiusKmState(saved.radiusKm ?? DEFAULT_RADIUS_KM);
      }
    } finally {
      setIsResolvingLocation(false);
    }
  }, [radiusKm, savedAddresses, setLocation]);

  useEffect(() => {
    const saved = loadDeliveryLocation();
    const radius = saved?.radiusKm ?? DEFAULT_RADIUS_KM;
    if (saved?.radiusKm) setRadiusKmState(saved.radiusKm);

    let cancelled = false;
    setIsResolvingLocation(true);
    setLocateError(null);
    void resolveCurrentDeliveryLocation(radius, savedAddresses)
      .then((resolved) => {
        if (!cancelled) setLocation(resolved);
      })
      .catch((err) => {
        if (cancelled) return;
        setLocateError(formatGeolocationError(err));
        if (saved) {
          setLocationState(saved);
          setRadiusKmState(saved.radiusKm ?? DEFAULT_RADIUS_KM);
        }
      })
      .finally(() => {
        if (!cancelled) setIsResolvingLocation(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const clearLocation = useCallback(() => {
    void applyCurrentLocation();
  }, [applyCurrentLocation]);

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
        isResolvingLocation,
        locateError,
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

/** Safe when the provider is absent (e.g. in-store view-only menu). */
export function useDeliveryLocationOptional(): DeliveryLocationCtx | null {
  return useContext(Ctx);
}
