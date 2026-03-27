"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitWaitlist(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const role = formData.get("role") as string;
  const industry = formData.get("industry") as string;
  const useCase = formData.get("useCase") as string;

  if (!email) return { error: "El email es obligatorio" };

  try {
    await prisma.waitlist.upsert({
      where: { email },
      update: {
        name,
        company,
        role,
        industry,
        useCase,
      },
      create: {
        email,
        name,
        company,
        role,
        industry,
        useCase,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Waitlist error:", err);
    return { error: "Ocurrió un error al guardar tus datos" };
  }
}
