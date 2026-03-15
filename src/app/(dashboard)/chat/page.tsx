import { ChatInterface } from "@/components/chat/ChatInterface";

// For MVP: hardcoded org ID from seed
const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="font-bold text-slate-900 text-lg">Agente de Compras</h1>
        <p className="text-sm text-slate-500">Describe lo que necesitas y genero el presupuesto</p>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatInterface organizationId={ORG_ID} />
      </div>
    </div>
  );
}
