"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import type { Answers } from "@/components/Wizard";

export async function submitBusinessForm(answers: Answers) {
  const { prenom, nom, telephone, email, ...rest } = answers;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("prequalification_responses").insert({
      form_type: "business",
      first_name: prenom ?? "",
      last_name: nom ?? "",
      phone: telephone ?? "",
      email: email || null,
      answers: rest,
    });
    if (error) throw error;
    return { ok: true as const };
  } catch (err) {
    console.error("submitBusinessForm", err);
    return { ok: false as const, error: "insert_failed" };
  }
}
