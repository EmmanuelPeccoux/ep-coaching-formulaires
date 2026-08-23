import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client service role, jamais importe cote client (le "server-only" ci-
// dessus fait planter le build si un composant client tente de l'importer
// par erreur). Meme architecture que le reste de l'ecosysteme EP Coaching
// (ep-coaching-app) : RLS activee sur prequalification_responses, AUCUNE
// policy publique (voir supabase/migrations), ecriture exclusivement via
// cette cle cote serveur.
//
// Historique (prompt 14/15) : une premiere version utilisait la cle
// publique (anon/publishable) avec une policy RLS dediee autorisant
// l'insertion publique. Abandonnee : meme avec la policy correctement
// configuree (verifie), les inserts anon echouaient systematiquement en
// 42501, y compris sur une table de test triviale fraichement creee et
// via `to public`. Cause non identifiee malgre investigation approfondie
// (roles/grants/policies tous corrects cote Postgres). Retour a l'usage
// de la cle service role, deja la norme etablie dans ce projet Supabase
// (voir auth_login_attempts/oura_connections : RLS activee, aucune
// policy, service role uniquement).
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
