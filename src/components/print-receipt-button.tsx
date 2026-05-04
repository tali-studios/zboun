"use client";

export function PrintReceiptButton() {
  return (
    <button type="button" className="btn btn-primary rounded-xl" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}
