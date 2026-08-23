import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client service role, jamais importe cote client (le "server-only" ci-
// dessus fait planter le build si un composant client tente de l'importer
// par erreur). Meme projet Supabase que ep-coaching-app (cadmwvrsjklgtrrebflz),
// table dediee prequalification_responses (RLS activee, aucune policy
// publique : seule cette cle peut y ecrire). Voir
// supabase/migrations/20260823_prequalification_responses.sql et le README.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (voir .env.example)."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
