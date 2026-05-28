"use client";

import { useCallback, useState } from "react";

import { ZBOUN_WHATSAPP_DIGITS } from "@/lib/zboun-contact";

function buildMessage(name: string, message: string) {
  const lines = [
    "Hello Zboun 👋",
    "",
    `Name: ${name.trim()}`,
    "",
    "Message:",
    message.trim(),
  ];
  return lines.join("\n");
}

export function ContactWhatsAppForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) {
        window.alert("Please fill Name and Message.");
        return;
      }
      const text = buildMessage(name, message);
      const url = `https://wa.me/${ZBOUN_WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
      window.location.assign(url);
    },
    [name, message],
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
