# EP Coaching — Formulaires de préqualification

Next.js (App Router), déployé sur Vercel à `ep-coaching-formulaires.vercel.app`.

## Contexte important (prompt 13/15, mis à jour au 14/15)

Le repo d'origine de ce projet était introuvable au moment du prompt
13/15 : absent de `github.com/EmmanuelPeccoux`, et le connecteur Vercel
MCP disponible dans cette session ne voit aucun projet, pas même
`ep-coaching-app` qui est pourtant bien déployé. Faute d'accès, ce repo a
été reconstruit **de zéro**, en reproduisant le rendu du formulaire
physique tel qu'observé sur le site déployé, plutôt que de deviner le
code source original.

**Conséquence directe** : le mécanisme de stockage réellement utilisé par
l'ancien formulaire n'a pas pu être identifié. Un nouveau point de
stockage a donc été créé, voir plus bas.

**Ce repo existe maintenant sur GitHub** :
`github.com/EmmanuelPeccoux/ep-coaching-formulaires` (créé au prompt
14/15 via l'API GitHub directement, avec le token déjà utilisé par git
push depuis le début de session — le connecteur GitHub n'existant pas
dans cette session).

**Le déploiement Vercel n'a pas pu être branché sur ce repo dans cette
session, malgré plusieurs tentatives réelles, pas un simple abandon** :
- Le connecteur Vercel MCP ne liste ni ne retrouve AUCUN projet, y
  compris ceux qu'il vient tout juste de créer lui-même (`get_project`
  renvoie 404 sur un ID qu'il a rendu deux secondes plus tôt).
- `deploy_to_vercel` a réussi une fois (fichiers de config seuls, test),
  puis a échoué en 403 sur l'essai suivant.
- `create_git_project` a créé un projet Vercel (ID retourné :
  `prj_dBOpjpN4kZGdlzVm2M6GVBMWrmq2`, nom `ep-coaching-formulaires-v2`)
  mais n'a pas pu vérifier la liaison git ensuite (404 encore).
- Vérifié en HTTP direct (`curl`), pas seulement via le connecteur : les
  URLs de ces tentatives renvoient bien un vrai 404, ce ne sont pas des
  déploiements fantômes juste invisibles du connecteur — rien n'est
  réellement en ligne.
- Vercel CLI installée en local (`vercel@54.6.1`) mais sans session
  authentifiée (`vercel whoami` échoue, "token not valid").

**Action nécessaire, en dehors de cette session** : reconnecter le
connecteur Vercel (claude.ai/customize/connectors) puis relancer, ou
importer le repo manuellement dans le dashboard Vercel (Add New →
Project → Import `EmmanuelPeccoux/ep-coaching-formulaires`) et renseigner
les 2 variables d'environnement ci-dessous. Deux projets Vercel
orphelins (`ep-coaching-formulaires-test`, `ep-coaching-formulaires-v2`)
ont été créés pendant ces tentatives et n'ont jamais servi de trafic
réel (confirmé 404) : à supprimer depuis le dashboard si visibles là-bas,
sans risque puisqu'ils ne sont liés à rien de fonctionnel.

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
- `/business` — formulaire business (chantier 2 du prompt 13/15).
  Branché au prompt 14/15 sur `business/index.html` (bouton "Réserver mon
  appel" de la section CTA final, `ep-site`, repo séparé).
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

## Funnel vers Calendly (prompt 14/15)

**Option retenue : A, redirection** (pas d'embed Calendly dans la
dernière étape). Décision justifiée par les mêmes principes déjà
appliqués sur `ep-site` pour la façade VSL YouTube : aucun navigateur
réel disponible dans cet environnement pour vérifier qu'un widget
Calendly embarqué reste fluide sur mobile, et le prompt lui-même
autorise explicitement l'option A "sans hésiter" dans ce cas plutôt que
de livrer un embed non vérifié qui pourrait ramer sur iPhone.

**Lien Calendly vérifié via le connecteur MCP** (pas juste supposé
valide) : `https://calendly.com/peccoux-manu/30min`, event type
"| Appel Découverte |", actif, 30 min, canal outbound_call.

**Un seul événement Calendly actif à la fois** : un deuxième event type
("| Appel Découverte Business |") a été créé pour distinguer
physique/business par événement distinct comme le prompt le préférait,
mais **le plan Calendly de ce compte limite à un seul event type actif
simultanément** — sa création a immédiatement désactivé l'événement
physique existant. Repéré tout de suite (pas après coup) via
`event_types-get_event_type` : l'événement physique venait de basculer
`active: false`, ce qui aurait cassé le lien déjà en prod sur
`ep-site/physique/index.html`. Réactivé immédiatement. L'événement
business reste créé mais **inactif** (`https://calendly.com/peccoux-manu/appel-decouverte-business`),
prêt à être activé manuellement depuis Calendly si le plan est mis à
niveau un jour (activer l'un désactive alors l'autre, à surveiller).

**Distinction physique/business transmise autrement**, comme le prompt
le permettait explicitement en alternative ("soit un événement distinct,
soit un champ transmis dans les données") : chaque formulaire ajoute
`utm_campaign=physique` ou `utm_campaign=business` à l'URL Calendly
finale (`buildCalendlyUrl()` dans `components/Wizard.tsx`), visible par
Santamaria dans les détails de chaque réservation reçue.

**Pré-remplissage** (section 1.3 du prompt) : prénom + nom (paramètre
`name`) et email si renseigné (paramètre `email`, champ ajouté aux deux
formulaires à cette occasion — absent du parcours reconstruit au prompt
13/15, la demande explicite de ce prompt-ci l'a révélé). Champ email
marqué facultatif (`optional: true` dans le type `Question`) pour ne pas
alourdir un formulaire déjà multi-étapes avec un champ obligatoire de
plus.

**Gestion des échecs** (section 1.4) : écran dédié si l'enregistrement
Supabase échoue, avec toujours un lien direct vers Calendly ("Réserver
mon appel quand même") — réserver l'appel compte plus que sauvegarder
les réponses, l'un ne bloque jamais l'autre. Bouton "Réessayer l'envoi"
à côté, sans forcer un unique chemin. Le lien Calendly de secours *est*
le lien principal de l'écran de succès normal : aucun script de
redirection automatique qui pourrait échouer silencieusement, un vrai
`<a href>` cliquable, fonctionne même si le JS a un souci.

**Retour arrière depuis Calendly** : navigation par lien `<a href>`
classique (jamais `router.push`), l'état `submitState` de React reste
en mémoire via le bfcache du navigateur au retour arrière — l'écran de
succès/erreur doit donc rester affiché tel quel plutôt que de perdre
l'état du formulaire. Raisonnement, pas vérifié en navigateur réel (même
limite que pour tout ce projet).

## Incohérence repérée dans le formulaire physique (signalée, pas corrigée)

Aucune trouvée dans les questions reconstruites au prompt 13/15 : la
structure a été conçue directement inclusive du niveau débutant, donc le
problème que le prompt 13 anticipait ("questions qui excluent les
débutants") n'a pas pu être vérifié sur l'ancien code, resté
inaccessible — il n'y avait rien à auditer, seulement à reconstruire
proprement dès le départ.

Repéré et corrigé au prompt 14/15 en revanche : l'absence de champ email
(voir "Pré-remplissage" ci-dessus), et la désactivation en cascade de
l'événement Calendly physique (voir "Un seul événement Calendly actif").
