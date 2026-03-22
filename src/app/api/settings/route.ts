import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const PROVIDERS = ["anthropic", "openai", "groq", "mistral", "together"] as const;
type Provider = typeof PROVIDERS[number];

const PROVIDER_KEY_PREFIXES: Record<Provider, string[]> = {
  anthropic: ["sk-ant-"],
  openai:    ["sk-"],
  groq:      ["gsk_"],
  mistral:   [""],  // no fixed prefix
  together:  [""],
};

function validateKey(provider: Provider, key: string): boolean {
  const prefixes = PROVIDER_KEY_PREFIXES[provider];
  if (prefixes.every((p) => p === "")) return key.length > 10;
  return prefixes.some((p) => key.startsWith(p));
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: ORG_ID },
  });

  let configuredProviders: string[] = [];

  // Read from new providerKeys JSON
  if (settings?.providerKeys) {
    try {
      const parsed = JSON.parse(settings.providerKeys) as Record<string, string>;
      configuredProviders = Object.keys(parsed);
    } catch { /* ignore */ }
  }

  // Backward compat: legacy encryptedApiKey = anthropic
  if (settings?.encryptedApiKey && !configuredProviders.includes("anthropic")) {
    configuredProviders.push("anthropic");
  }

  return NextResponse.json({
    hasApiKey: !!settings?.encryptedApiKey || configuredProviders.length > 0,
    configuredProviders,
    activeProvider: settings?.activeProvider ?? (configuredProviders[0] || null),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, apiKey, setActive } = await req.json() as {
    provider: Provider;
    apiKey: string;
    setActive?: boolean;
  };

  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Proveedor no válido" }, { status: 400 });
  }

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "API key inválida" }, { status: 400 });
  }

  if (!validateKey(provider, apiKey)) {
    return NextResponse.json({ error: `API key inválida para ${provider}` }, { status: 400 });
  }

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: ORG_ID },
  });

  // Load existing provider keys
  let providerMap: Record<string, string> = {};
  if (settings?.providerKeys) {
    try { providerMap = JSON.parse(settings.providerKeys); } catch { /* ignore */ }
  }

  // Encrypt and store
  providerMap[provider] = encrypt(apiKey);
  const providerKeys = JSON.stringify(providerMap);

  const updateData: Record<string, unknown> = {
    providerKeys,
    updatedAt: new Date(),
  };

  // Also update legacy encryptedApiKey for backward compat
  if (provider === "anthropic") {
    updateData.encryptedApiKey = encrypt(apiKey);
  }

  if (setActive || !settings?.activeProvider) {
    updateData.activeProvider = provider;
  }

  await prisma.organizationSettings.upsert({
    where: { organizationId: ORG_ID },
    update: updateData,
    create: {
      organizationId: ORG_ID,
      providerKeys,
      activeProvider: provider,
      ...(provider === "anthropic" ? { encryptedApiKey: encrypt(apiKey) } : {}),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json() as { provider?: Provider };

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: ORG_ID },
  });

  if (!settings) return NextResponse.json({ ok: true });

  let providerMap: Record<string, string> = {};
  if (settings.providerKeys) {
    try { providerMap = JSON.parse(settings.providerKeys); } catch { /* ignore */ }
  }

  if (provider) {
    delete providerMap[provider];
  } else {
    providerMap = {};
  }

  const remaining = Object.keys(providerMap);
  const newActive = settings.activeProvider && remaining.includes(settings.activeProvider)
    ? settings.activeProvider
    : remaining[0] ?? null;

  await prisma.organizationSettings.update({
    where: { organizationId: ORG_ID },
    data: {
      providerKeys: remaining.length > 0 ? JSON.stringify(providerMap) : null,
      activeProvider: newActive,
      encryptedApiKey: (!provider || provider === "anthropic") ? null : settings.encryptedApiKey,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { activeProvider } = await req.json() as { activeProvider: Provider };

  await prisma.organizationSettings.updateMany({
    where: { organizationId: ORG_ID },
    data: { activeProvider, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

// For internal agent use
export async function getOrgApiKey(orgId: string): Promise<{ key: string; provider: string } | null> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });

  if (!settings) return null;

  const active = settings.activeProvider ?? "anthropic";

  // Try providerKeys first
  if (settings.providerKeys) {
    try {
      const map = JSON.parse(settings.providerKeys) as Record<string, string>;
      if (map[active]) {
        return { key: decrypt(map[active]), provider: active };
      }
    } catch { /* ignore */ }
  }

  // Fallback to legacy encryptedApiKey
  if (settings.encryptedApiKey) {
    try {
      return { key: decrypt(settings.encryptedApiKey), provider: "anthropic" };
    } catch { /* ignore */ }
  }

  return null;
}
