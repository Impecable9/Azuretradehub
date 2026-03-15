"use client";

interface QuoteLine {
  type: "BOM" | "BOS";
  description: string;
  quantity: number;
  unit: string;
  unitCost?: number | null;
}

interface QuoteData {
  title: string;
  lines: QuoteLine[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  quote?: object;
}

interface Props {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
}

function formatContent(text: string) {
  // Remove <quote>...</quote> blocks from display
  return text.replace(/<quote>[\s\S]*?<\/quote>/g, "").trim();
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export function MessageBubble({ message, isLast, isStreaming }: Props) {
  const isUser = message.role === "user";
  const displayContent = formatContent(message.content);
  const quote = message.quote as QuoteData | undefined;

  const total = quote?.lines.reduce(
    (sum, l) => sum + (l.unitCost ?? 0) * l.quantity,
    0
  ) ?? 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-2xl w-full ${isUser ? "ml-12" : "mr-12"}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xs font-black text-white">
              A
            </div>
            <span className="text-xs font-semibold text-slate-500">Agente</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {displayContent && (
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }}
            />
          )}
          {isStreaming && isLast && !displayContent && (
            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse rounded" />
          )}
          {isStreaming && isLast && displayContent && (
            <span className="inline-block w-2 h-4 bg-slate-400 animate-pulse rounded ml-0.5 align-middle" />
          )}
        </div>

        {/* Quote card */}
        {quote && (
          <div className="mt-3 bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest">
                Presupuesto generado
              </div>
              <div className="text-white font-bold text-base mt-0.5">{quote.title}</div>
            </div>
            <div className="px-4 py-3 space-y-2">
              {quote.lines.map((line, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      line.type === "BOM"
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-purple-500/30 text-purple-300"
                    }`}>
                      {line.type}
                    </span>
                    <span className="text-white text-sm">{line.description}</span>
                    <span className="text-slate-400 text-xs">× {line.quantity} {line.unit}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {line.unitCost
                      ? `${(line.unitCost * line.quantity).toFixed(2)} €`
                      : <span className="text-amber-400 text-xs">RFQ pendiente</span>
                    }
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-blue-600/20 flex justify-between items-center">
              <span className="text-slate-300 text-sm font-semibold">Total estimado</span>
              <span className="text-white text-xl font-black">{total.toFixed(2)} €</span>
            </div>
            <div className="px-4 py-3 flex gap-2">
              <button className="flex-1 bg-white text-blue-900 font-bold text-sm py-2 rounded-xl hover:bg-blue-50 transition-colors">
                Guardar presupuesto
              </button>
              <button className="flex-1 bg-blue-500/30 text-white font-bold text-sm py-2 rounded-xl hover:bg-blue-500/40 transition-colors">
                Enviar RFQ a proveedores
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
