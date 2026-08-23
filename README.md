# EP Coaching — Formulaires de préqualification

Next.js (App Router), déployé sur Vercel à `ep-coaching-formulaires.vercel.app`.

## Contexte important (prompt 13/15)

Le repo d'origine de ce projet était introuvable au moment de ce prompt :
absent de `github.com/EmmanuelPeccoux` (seuls `EP-Coaching` et `CobraKai`
sont publics là-bas), et le connecteur Vercel MCP disponible dans cette
session ne voit aucun projet, pas même `ep-coaching-app` qui est pourtant
bien déployé — signe d'un souci d'autorisation du connecteur plutôt que
l'absence réelle du projet côté Vercel. Faute d'accès, ce repo a été
reconstruit **de zéro**, en reproduisant le rendu du formulaire physique
tel qu'observé sur le site déployé (structure multi-étapes, indicateur
`01/08`, palette et police déjà connues du reste de l'identité EP
Coaching), plutôt que de deviner le code source original.

**Conséquence directe** : le mécanisme de stockage réellement utilisé par
l'ancien formulaire n'a pas pu être identifié (aucune table Supabase
existante — `leads`, `client_intake`, `coaching_waitlist` — ne correspond
à un lead anonyme de formulaire). Un nouveau point de stockage a donc été
créé, voir plus bas.

**Le déploiement Vercel existant (`ep-coaching-formulaires.vercel.app`)
n'a pas été touché ni remplacé par ce travail.** Ce repo doit être
connecté à un projet Vercel (nouveau ou existant, en repointant le
projet actuel vers ce repo dans ses settings Vercel) pour remplacer le
déploiement en place — ce n'était pas faisable depuis cette session
(connecteur Vercel non fonctionnel, voir plus haut).

## Stockage des réponses

Nouvelle table dans le **même projet Supabase que ep-coaching-app**
(ref `cadmwvrsjklgtrrebflz`) : `public.prequalification_responses`.
Migration : `supabase/migrations/20260823_prequalification_responses.sql`
(déjà appliquée via Supabase MCP au moment de ce prompt).

- `form_type` : `'physique'` ou `'business'`, une seule table pour les
  deux formulaires plutôt que deux tables parallèles.
- `first_name` / `last_name` / `phone` : colonnes dédiées (identité,
  toujours présentes).
- `answers` : `jsonb`, toutes les autres réponses (une clé par question,
  voir `id` dans `app/prequalification/page.tsx` / `app/business/page.tsx`).
- `status` : `'nouveau'` par défaut, à faire évoluer manuellement ou par
  un futur agent (`contacte`, `appel_reserve`, `ferme`, `pas_adapte`).
- RLS activée, **aucune policy publique** : les inserts passent
  exclusivement par les Server Actions (`app/*/actions.ts`) avec la clé
  service role (`SUPABASE_SERVICE_ROLE_KEY`, jamais exposée au client).

## Variables d'environnement (Vercel)

Voir `.env.example`. À renseigner dans les settings du projet Vercel :
- `SUPABASE_URL` = `https://cadmwvrsjklgtrrebflz.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = clé service role du projet Supabase
  `cadmwvrsjklgtrrebflz` (disponible dans les settings API de ce projet,
  jamais committée).

## Routes

- `/prequalification` — formulaire physique (chantier 1). **Route
  laissée inchangée** volontairement, pour ne pas casser le lien déjà
  câblé sur `ep-site` (`physique/index.html`, bouton "Réserver mon
  appel"). Seul ce qui est visible a changé (plus jamais le mot
  "pré-qualification", nouveau handle Instagram, nouvelles fourchettes de
  budget).
- `/business` — **nouvelle route** (chantier 2), à brancher sur
  `business/index.html` au prompt 14/15 (bouton "Réserver mon appel" de
  la section Accompagnement 1-to-1).
- `/` — redirige vers `/prequalification` (n'est lié nulle part
  explicitement, juste là pour éviter un 404 sur la racine).

## Design

Tokens copiés tels quels de `ep-site/assets/css/base.css` (palette
rouge/noir, jamais de ton froid, Montserrat 900 sur les titres, jamais
Bebas Neue, motif diamant). Composant `components/Wizard.tsx` partagé
par les deux formulaires : un seul moteur de formulaire multi-étapes
piloté par une liste de questions typées (`choice` / `text` / `textarea`
/ `tel` / `email`), pour ne jamais dupliquer la logique de navigation
entre les deux parcours.

## Règles de contenu respectées

- Aucun tiret em nulle part (vérifié par grep sur tout le repo).
- Aucun vrai prix : les fourchettes de budget (350/550/750€ physique,
  150/300/600€ business) sont des paliers de mesure d'intention,
  volontairement différents des vrais tarifs (jamais committés nulle
  part, y compris en commentaire).
- Tutoiement systématique.
- Handle Instagram correct partout : `@santamariasanchez_`
  (`https://instagram.com/santamariasanchez_`), jamais
  `@emmanuelpeccoux`.
- Jamais "Emmanuel" dans un texte visible : `Santamaria Sànchez`
  uniquement (accent grave, orthographe confirmée par l'intéressé).
- Formulaire physique : le niveau de départ ("Je débute" est la première
  option, jamais masquée ni exclue) n'est jamais un critère filtrant,
  seule la motivation ("Tu es prêt à investir du temps...") l'est —
  cohérent avec le positionnement du site ("peu importe ton niveau de
  départ").
- Mobile-first : champs pleine largeur, `inputMode`/`type` adaptés
  (`tel`, `email`), pas de largeur fixe qui déborderait à 375px.

## Lien de réservation

`https://calendly.com/peccoux-manu/30min` (event type "Appel Découverte",
30 min, vérifié actif via le connecteur Calendly MCP) — le même lien sert
les deux formulaires, cohérent avec la question personnalisée déjà posée
côté Calendly ("transformer ton physique ou scaler ton business").

## Incohérence repérée dans le formulaire physique (signalée, pas corrigée)

Aucune trouvée dans les questions reconstruites ici : la structure a été
conçue directement inclusive du niveau débutant (voir plus haut), donc le
problème que le prompt anticipait ("questions qui excluent les débutants")
n'a pas pu être vérifié sur l'ancien code, qui restait inaccessible — il
n'y a donc rien à signaler puisqu'il n'y avait rien à auditer, seulement
à reconstruire proprement dès le départ.
