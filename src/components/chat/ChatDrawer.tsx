"use client";

import { useState } from "react";
import { MessageSquare, X, ChevronRight } from "lucide-react";
import { ChatInterface } from "./ChatInterface";

interface Props {
  organizationId: string;
}

export function ChatDrawer({ organizationId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 transition-all duration-300 flex items-center gap-2.5 ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
      >
        <span className="pl-4 pr-1 py-3.5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-bold text-sm pr-2">Hablar con el agente</span>
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-900">
          <div>
            <div className="font-bold text-white">Agente de Compras</div>
            <div className="text-xs text-slate-400">Powered by Claude</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface organizationId={organizationId} />
        </div>
      </div>
    </>
  );
}
