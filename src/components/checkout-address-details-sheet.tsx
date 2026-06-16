"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Camera,
  ChevronDown,
  Home,
  Loader2,
  MapPin,
  Mic,
  Star,
  X,
} from "lucide-react";
import {
  deleteCheckoutAddressAction,
  saveCheckoutAddressAction,
  uploadCustomerAddressMediaAction,
} from "@/app-actions/customer-auth";
import { formatSavedAddressLine } from "@/lib/format-address";
import { env } from "@/lib/env";
import type { SavedAddressOption } from "@/components/order-delivery-fields";
import type { MenuTheme } from "@/lib/menu-theme";
import { menuPrimaryButtonStyle, menuThemeStyle } from "@/lib/menu-theme";
import { resolveAddressNicknameForSave } from "@/lib/customer-address";
import { DEFAULT_COUNTRY_DIAL } from "@/lib/country-calling-codes";
import { PhoneCountrySelect } from "@/components/phone-country-select";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--menu-primary)]" />
      </div>
    ),
  },
);

export type AddressDetailsAction = "photo" | "voice" | "details";

type Props = {
  open: boolean;
  onClose: () => void;
  initialAction?: AddressDetailsAction;
  isLoggedIn: boolean;
  addressId?: string | null;
  initial?: {
    label?: string;
    nickname?: string | null;
    latitude?: number;
    longitude?: number;
    formatted_address?: string | null;
    street?: string | null;
    building?: string | null;
    apartment?: string | null;
    phone?: string | null;
    country_code?: string | null;
    driver_notes?: string | null;
    voice_directions_url?: string | null;
    address_photo_urls?: string[] | null;
  };
  onSaved: (address: SavedAddressOption) => void;
  onDeleted?: () => void;
  theme: MenuTheme;
};

const LABEL_OPTIONS = [
  { value: "home", label: "Home", hint: "House, apartment…", icon: Home },
  { value: "work", label: "Work", hint: "Office, workplace…", icon: Briefcase },
  { value: "moms", label: "Mom's", hint: "Family home…", icon: Star },
  { value: "other", label: "Other", hint: "Medical facility, Mall, School…", icon: MapPin },
] as const;

function staticMapUrl(lat: number, lng: number): string | null {
  const key = env.googleMapsApiKey;
  if (!key) return null;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "16",
    size: "640x240",
    scale: "2",
    markers: `color:red|${lat},${lng}`,
    key,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function LabeledField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white px-3 pb-2.5 pt-2 shadow-sm">
      <span className="block text-[11px] font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300"
      />
    </label>
  );
}

export function CheckoutAddressDetailsSheet({
  open,
  onClose,
  initialAction = "details",
  isLoggedIn,
  addressId = null,
  initial,
  onSaved,
  onDeleted,
  theme,
}: Props) {
  const [step, setStep] = useState<"form" | "map">("form");
  const [label, setLabel] = useState("other");
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [nickname, setNickname] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [apartment, setApartment] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_DIAL);
  const [lat, setLat] = useState(33.8938);
  const [lng, setLng] = useState(35.5018);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const helpSectionRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const selectedLabel = LABEL_OPTIONS.find((o) => o.value === label) ?? LABEL_OPTIONS[3];
  const mapPreviewUrl = staticMapUrl(lat, lng);
  const isEditing = Boolean(addressId);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    // Only seed form when the sheet first opens — parent re-renders (e.g. rotating
    // action pill every 3s) must not wipe in-progress typing.
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;

    setStep("form");
    setError(null);
    setPendingPhotos([]);
    setLabel(initial?.label ?? "other");
    setNickname(initial?.nickname ?? "");
    setStreet(isEditing ? (initial?.street ?? "") : "");
    setBuilding(initial?.building ?? "");
    setApartment(initial?.apartment ?? "");
    setPhone(initial?.phone ?? "");
    setCountryCode(initial?.country_code ?? DEFAULT_COUNTRY_DIAL);
    setVoiceUrl(initial?.voice_directions_url ?? null);
    setPhotoUrls(initial?.address_photo_urls ?? []);
    setLat(initial?.latitude ?? 33.8938);
    setLng(initial?.longitude ?? 35.5018);
    setFormattedAddress(initial?.formatted_address ?? "");
  }, [open, addressId, initial, isEditing]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (initialAction === "photo") {
        helpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        photoInputRef.current?.click();
      } else if (initialAction === "voice") {
        helpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [open, initialAction]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      recorderRef.current?.stop();
    };
  }, []);

  async function startVoiceRecording() {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        const blob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        if (isLoggedIn) {
          void uploadVoice(blob);
        } else {
          setVoiceUrl(URL.createObjectURL(blob));
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 29) {
            recorderRef.current?.stop();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access is required to record voice directions.");
    }
  }

  async function uploadVoice(blob: Blob) {
    const fd = new FormData();
    fd.set("kind", "voice");
    fd.set("file", new File([blob], "voice-directions.webm", { type: "audio/webm" }));
    const result = await uploadCustomerAddressMediaAction(fd);
    if (result.ok) setVoiceUrl(result.url);
    else setError(result.error);
  }

  function handlePhotoPick(files: FileList | null) {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, 4 - photoUrls.length - pendingPhotos.length);
    setPendingPhotos((prev) => [...prev, ...picked]);
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      let uploadedPhotos = [...photoUrls];
      if (isLoggedIn && pendingPhotos.length > 0) {
        for (const file of pendingPhotos) {
          const fd = new FormData();
          fd.set("kind", "photo");
          fd.set("file", file);
          const result = await uploadCustomerAddressMediaAction(fd);
          if (result.ok) uploadedPhotos.push(result.url);
        }
      }

      const userLine = [street, building, apartment].filter(Boolean).join(", ");
      const fullFormatted = userLine || formattedAddress.trim() || null;

      const resolvedNickname = resolveAddressNicknameForSave(label, nickname, selectedLabel.label);
      if (!resolvedNickname.ok) {
        setError(resolvedNickname.error);
        return;
      }

      if (isLoggedIn) {
        const result = await saveCheckoutAddressAction({
          id: addressId,
          label,
          nickname: resolvedNickname.nickname,
          latitude: lat,
          longitude: lng,
          formatted_address: fullFormatted,
          street: street.trim() || null,
          building: building.trim() || null,
          apartment: apartment.trim() || null,
          phone: phone.trim() || null,
          country_code: countryCode,
          driver_notes: null,
          voice_directions_url: voiceUrl,
          address_photo_urls: uploadedPhotos,
          is_default: false,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSaved(result.address as SavedAddressOption);
        onClose();
        return;
      }

      onSaved({
        id: addressId ?? "local-draft",
        label,
        nickname: resolvedNickname.nickname,
        latitude: lat,
        longitude: lng,
        formatted_address: fullFormatted,
        street: street.trim() || null,
        building: building.trim() || null,
        apartment: apartment.trim() || null,
        phone: phone.trim() || null,
        country_code: countryCode,
        driver_notes: null,
        voice_directions_url: voiceUrl,
        address_photo_urls: uploadedPhotos,
        is_default: false,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!addressId || !isLoggedIn) return;
    if (!window.confirm("Delete this address?")) return;
    setIsDeleting(true);
    const result = await deleteCheckoutAddressAction(addressId);
    setIsDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDeleted?.();
    onClose();
  }

  if (!open) return null;

  const sheet = (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" style={menuThemeStyle(theme)}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 flex w-full flex-col overflow-hidden bg-[#f5f5f7] shadow-2xl ${
          step === "map"
            ? "h-[100dvh] max-h-[100dvh] rounded-none sm:h-[min(90dvh,720px)] sm:max-w-2xl sm:rounded-3xl"
            : "h-[100dvh] max-h-[100dvh] max-w-lg rounded-none sm:h-[min(92dvh,780px)] sm:rounded-3xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Address details"
      >
        {step === "map" ? (
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-bold text-slate-900">Adjust pin</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <GoogleMapPicker
                initial={{ lat, lng }}
                onConfirm={(result) => {
                  setLat(result.lat);
                  setLng(result.lng);
                  setFormattedAddress(result.address);
                  setStep("form");
                }}
                onClose={() => setStep("form")}
              />
            </div>
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-slate-900">Address details</h1>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              {/* Map preview */}
              <div className="relative mx-4 mt-4 h-36 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200">
                {mapPreviewUrl ? (
                  <Image
                    src={mapPreviewUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setStep("map")}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:brightness-105"
                  style={menuPrimaryButtonStyle(theme)}
                >
                  Adjust pin
                </button>
              </div>

              <div className="space-y-3 px-4 pt-4">
                {/* Category */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLabelMenu((v) => !v)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm"
                  >
                    <selectedLabel.icon className="h-5 w-5 shrink-0 text-slate-600" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{selectedLabel.label}</p>
                      <p className="text-xs text-slate-500">{selectedLabel.hint}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition ${showLabelMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showLabelMenu ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      {LABEL_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setLabel(opt.value);
                              if (opt.value === "other") {
                                if (label !== "other") setNickname("");
                              } else {
                                setNickname("");
                              }
                              setShowLabelMenu(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.75} />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                              <p className="text-xs text-slate-500">{opt.hint}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {label === "other" ? (
                  <LabeledField
                    label="Location name"
                    value={nickname}
                    onChange={setNickname}
                    placeholder="e.g. Second Home"
                  />
                ) : null}
                <LabeledField label="Area/Street" value={street} onChange={setStreet} />
                <LabeledField label="Building name/no." value={building} onChange={setBuilding} />
                <LabeledField label="Floor/Address no." value={apartment} onChange={setApartment} />

                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(10.5rem,12.5rem)_1fr] sm:items-stretch">
                  <PhoneCountrySelect
                    variant="card"
                    value={countryCode}
                    onChange={setCountryCode}
                  />
                  <LabeledField
                    label="Phone number"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                    placeholder="Mobile number"
                  />
                </div>

                {/* Help the shopper */}
                <div
                  ref={helpSectionRef}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg" aria-hidden>
                      🛵
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900">Help the shopper find you!</p>
                        <BadgeCheck className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          New
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Add images and record directions of your address to help your shopper find you
                        faster (Optional).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void startVoiceRecording()}
                    className={`mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                      isRecording
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>
                      {isRecording
                        ? `Recording… ${recordingSeconds}s / 30s (tap to stop)`
                        : voiceUrl
                          ? "Voice directions recorded — tap to re-record"
                          : "Tap to record voice directions (30s)"}
                    </span>
                    <Mic className="h-4 w-4 shrink-0" />
                  </button>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoPick(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Add photos
                  </button>

                  {(photoUrls.length > 0 || pendingPhotos.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photoUrls.map((url) => (
                        <div
                          key={url}
                          className="relative h-14 w-14 overflow-hidden rounded-lg ring-1 ring-slate-200"
                        >
                          <Image src={url} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ))}
                      {pendingPhotos.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-500 ring-1 ring-slate-200"
                        >
                          {file.name.slice(0, 8)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
                style={menuPrimaryButtonStyle(theme)}
              >
                {isSaving ? "Saving…" : isEditing ? "Update address" : "Save address"}
              </button>
              {isEditing && isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-red-500 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete address"}
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
