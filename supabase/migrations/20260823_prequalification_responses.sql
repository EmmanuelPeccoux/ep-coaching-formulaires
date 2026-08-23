-- Nouveau point de stockage pour les formulaires de prequalification
-- (physique + business), prompt 13/15 du chantier formulaires.
--
-- Contexte : le repo d'origine de ep-coaching-formulaires.vercel.app etait
-- introuvable (jamais publie sur GitHub sous ce compte, ou perdu), donc le
-- mecanisme d'enregistrement reellement utilise par le formulaire physique
-- deja en ligne n'a pas pu etre identifie avec certitude. Aucune table
-- existante de ce projet Supabase (leads, client_intake,
-- coaching_waitlist) ne correspond a la forme d'un lead anonyme issu d'un
-- formulaire de prequalification. Plutot que de deviner, ce nouveau point
-- de stockage est cree ici, dans le MEME projet Supabase que l'app
-- (cadmwvrsjklgtrrebflz) plutot qu'un service tiers, pour rester coherent
-- avec l'infrastructure existante et permettre a un futur agent interne
-- (Setter) de lire directement ces reponses comme il le fait deja pour
-- les leads magnets.
--
-- form_type distingue les deux formulaires dans une seule table plutot que
-- deux tables paralleles : memes champs d'identite communs (nom/prenom/
-- telephone/email), question specifiques a chaque formulaire dans answers
-- (jsonb) pour ne pas dupliquer le schema a chaque nouvelle question.

create table public.prequalification_responses (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('physique', 'business')),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'nouveau' check (status in ('nouveau', 'contacte', 'appel_reserve', 'ferme', 'pas_adapte')),
  created_at timestamptz not null default now()
);

comment on table public.prequalification_responses is
  'Reponses des formulaires de prequalification physique et business (ep-coaching-formulaires). form_type distingue les deux. answers porte les questions specifiques a chaque formulaire (jsonb, pas de colonne dediee par question pour rester flexible).';

alter table public.prequalification_responses enable row level security;

-- Aucune policy publique en lecture/ecriture : les inserts passent
-- exclusivement par la Server Action cote serveur avec la cle service
-- role (voir app/prequalification/actions.ts et app/business/actions.ts),
-- jamais depuis le navigateur. Coherent avec le pattern deja utilise dans
-- ep-coaching-app (client admin/service role cote serveur uniquement,
-- voir oura_connections dans ce meme projet pour un exemple similaire).
-- Lecture prevue plus tard via le dashboard interne de l'app (agent
-- Setter) ou directement dans Supabase, pas depuis ce repo formulaires.

create index prequalification_responses_form_type_idx on public.prequalification_responses (form_type);
create index prequalification_responses_created_at_idx on public.prequalification_responses (created_at desc);
