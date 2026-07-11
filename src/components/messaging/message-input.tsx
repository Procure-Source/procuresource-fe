"use client";

import React, { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";

interface Props {
  onSend: (content: string, contentType?: string, fileUrl?: string, fileName?: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        onSend(file.name, "file", data.url || data.fileUrl, file.name);
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#f0f0f5] px-4 sm:px-6 py-3 flex items-end gap-2 bg-white"
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled || uploading}
        className="p-2 text-[#86868b] hover:text-[#0066cc] transition-colors flex-shrink-0 disabled:opacity-40"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled || uploading}
        rows={1}
        className="flex-1 resize-none text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] bg-[#f5f5f7] rounded-[14px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 disabled:opacity-50 max-h-[120px]"
        style={{ minHeight: "40px" }}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled || uploading}
        className="p-2 bg-[#0066cc] text-white rounded-full hover:bg-[#0077ed] transition-all disabled:opacity-30 disabled:hover:bg-[#0066cc] flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
