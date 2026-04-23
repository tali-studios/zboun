"use client";

import { useCallback, useState } from "react";

/** Business WhatsApp (digits only, no +). */
const ZBOUN_WHATSAPP_DIGITS = "96171212734";

function buildMessage(name: string, phone: string, message: string) {
  const lines = [
    "Hello Zboun 👋",
    "",
    `Name: ${name.trim()}`,
    `Phone: ${phone.trim()}`,
    "",
    "Message:",
    message.trim(),
  ];
  return lines.join("\n");
}

export function ContactWhatsAppForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !phone.trim() || !message.trim()) {
        window.alert("Please fill Name, Phone, and Message.");
        return;
      }
      const text = buildMessage(name, phone, message);
      const url = `https://wa.me/${ZBOUN_WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
      window.location.assign(url);
    },
    [name, phone, message],
  );

  return (
    <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
      <input
        type="text"
        name="name"
        placeholder="Name"
        className="ui-input"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        required
        autoComplete="name"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        className="ui-input"
        value={phone}
        onChange={(ev) => setPhone(ev.target.value)}
        required
        autoComplete="tel"
      />
      <textarea
        name="message"
        placeholder="Message"
        rows={4}
        className="ui-textarea"
        value={message}
        onChange={(ev) => setMessage(ev.target.value)}
        required
        minLength={2}
      />
      <button type="submit" className="btn btn-success w-full rounded-xl py-3">
        Send message
      </button>
    </form>
  );
}
