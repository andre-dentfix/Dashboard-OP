"use server"

import { revalidatePath } from "next/cache"

/** Descarta o cache e busca a planilha de novo na próxima renderização. */
export async function refreshSheet() {
  revalidatePath("/")
}
