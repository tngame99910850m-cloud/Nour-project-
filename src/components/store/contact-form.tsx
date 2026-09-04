"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export function ContactForm({ businessName, whatsapp }: { businessName: string; whatsapp: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello ${businessName}, my name is ${name || "a customer"}.\n\n${message}`;
    window.open(whatsappLink(whatsapp, text), "_blank");
  };

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h2 className="font-serif text-xl font-semibold">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">This opens WhatsApp with your message ready to send.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="label">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="input" placeholder="How can we help you?" required />
        </div>
        <button type="submit" className="btn w-full gap-2 bg-green-500 py-3.5 text-white hover:bg-green-600">
          <MessageCircle className="h-5 w-5" /> Send via WhatsApp
        </button>
      </div>
    </form>
  );
}
