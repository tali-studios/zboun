"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function ImageLightbox({ src, alt = "", open, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const pinchRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setScale(1);
    setOffset({ x: 0, y: 0 });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const clampOffset = useCallback((nextScale: number, x: number, y: number) => {
    if (nextScale <= 1) return { x: 0, y: 0 };
    const maxX = ((nextScale - 1) * window.innerWidth) / 2;
    const maxY = ((nextScale - 1) * window.innerHeight) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const setZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      setScale(clamped);
      setOffset((prev) => clampOffset(clamped, prev.x, prev.y));
    },
    [clampOffset],
  );

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
    setZoom(scale + delta);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (scale <= 1) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset(
      clampOffset(
        scale,
        drag.originX + (event.clientX - drag.startX),
        drag.originY + (event.clientY - drag.startY),
      ),
    );
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { startDistance: distance, startScale: scale };
      dragRef.current = null;
      return;
    }
    if (event.touches.length === 1 && scale > 1) {
      const touch = event.touches[0];
      dragRef.current = {
        pointerId: -1,
        startX: touch.clientX,
        startY: touch.clientY,
        originX: offset.x,
        originY: offset.y,
      };
    }
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault();
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = distance / Math.max(1, pinchRef.current.startDistance);
      setZoom(pinchRef.current.startScale * ratio);
      return;
    }
    if (event.touches.length === 1 && dragRef.current && scale > 1) {
      event.preventDefault();
      const touch = event.touches[0];
      const drag = dragRef.current;
      setOffset(
        clampOffset(
          scale,
          drag.originX + (touch.clientX - drag.startX),
          drag.originY + (touch.clientY - drag.startY),
        ),
      );
    }
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (event.touches.length < 2) pinchRef.current = null;
    if (event.touches.length === 0) dragRef.current = null;
  };

  const onDoubleActivate = () => {
    if (scale > 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    } else {
      setZoom(2.2);
    }
  };

  const onImageClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      onDoubleActivate();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Item image"}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="min-w-0 truncate text-sm font-semibold text-white/90">{alt || "Photo"}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(scale - 0.4)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Zoom out"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(scale + 0.4)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Zoom in"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(event) => {
          if (event.target === event.currentTarget && scale <= 1) onClose();
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: dragRef.current || pinchRef.current ? "none" : "transform 120ms ease-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
          onDoubleClick={onDoubleActivate}
          onClick={onImageClick}
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={1200}
            className="max-h-[min(88dvh,900px)] max-w-[min(96vw,900px)] object-contain select-none"
            draggable={false}
            unoptimized
            priority
          />
        </div>
      </div>

      <p className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 text-center text-[11px] text-white/55">
        Pinch or use + / − to zoom · double-tap to toggle
      </p>
    </div>,
    document.body,
  );
}
