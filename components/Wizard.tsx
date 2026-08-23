"use client";

import { useMemo, useState, useTransition } from "react";

export type Question =
  | {
      type: "choice";
      id: string;
      label: string;
      helper?: string;
      options: { value: string; label: string }[];
    }
  | { type: "text"; id: string; label: string; placeholder?: string; helper?: string }
  | { type: "textarea"; id: string; label: string; placeholder?: string; helper?: string }
  | { type: "tel"; id: string; label: string; placeholder?: string; helper?: string }
  | { type: "email"; id: string; label: string; placeholder?: string; helper?: string; optional?: boolean };

export type Answers = Record<string, string>;

// Handle correct : @santamariasanchez_ (jamais @emmanuelpeccoux, prompt
// 13/15). Affiche sur l'ecran d'intro, de succes ET d'erreur, pour que le
// bon handle soit visible partout ou l'ancien formulaire en montrait un.
function Footer() {
  return (
    <a
      href="https://instagram.com/santamariasanchez_"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-12 text-xs font-medium text-blanc-casse/40 transition-colors hover:text-blanc-casse/70"
    >
      @santamariasanchez_
    </a>
  );
}

type SubmitResult = { ok: true } | { ok: false; error: string };

// Construit le lien Calendly pre-rempli (prompt 14/15, section 1.3) : nom
// et email transmis via les parametres reconnus par Calendly, plus un
// utm_campaign pour que Santamaria sache d'un coup d'oeil, dans les
// details de la reservation, si l'appel vient du parcours physique ou
// business (un seul evenement Calendly actif a la fois sur ce plan, voir
// README pour le detail complet de cette contrainte) — c'est le "champ
// transmis dans les donnees" explicitement permis par le prompt en
// alternative a deux evenements distincts.
function buildCalendlyUrl(base: string, campaignTag: string, answers: Answers) {
  const url = new URL(base);
  const fullName = [answers.prenom, answers.nom].filter(Boolean).join(" ").trim();
  if (fullName) url.searchParams.set("name", fullName);
  if (answers.email) url.searchParams.set("email", answers.email);
  url.searchParams.set("utm_campaign", campaignTag);
  return url.toString();
}

export default function Wizard({
  intro,
  questions,
  onSubmit,
  successTitle,
  successBody,
  calendlyUrl,
  campaignTag,
}: {
  intro: { eyebrow: string; title: string; body: string };
  questions: Question[];
  onSubmit: (answers: Answers) => Promise<SubmitResult>;
  successTitle: string;
  successBody: string;
  calendlyUrl: string;
  campaignTag: string;
}) {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitState, setSubmitState] = useState<"idle" | "done" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const total = questions.length;
  const current = questions[stepIndex];
  const value = current ? answers[current.id] ?? "" : "";

  const isOptional = current?.type === "email" && current.optional;
  const canAdvance = isOptional || value.trim().length > 0;

  const prefilledCalendlyUrl = useMemo(
    () => buildCalendlyUrl(calendlyUrl, campaignTag, answers),
    [calendlyUrl, campaignTag, answers]
  );

  function setValue(id: string, v: string) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  function goNext() {
    if (!canAdvance) return;
    if (stepIndex < total - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    // Derniere question : on soumet.
    startTransition(async () => {
      const result = await onSubmit(answers);
      setSubmitState(result.ok ? "done" : "error");
    });
  }

  function goBack() {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  }

  if (!started) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="diamond mb-6" aria-hidden="true" />
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-rouge-principal">
          {intro.eyebrow}
        </p>
        <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {intro.title}
        </h1>
        <p className="mb-10 max-w-md text-[15px] leading-relaxed text-blanc-casse/70">
          {intro.body}
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="rounded-lg bg-rouge-principal px-8 py-4 text-[15px] font-bold tracking-wide text-blanc-casse transition-colors hover:bg-rouge-fonce active:scale-[0.98]"
        >
          Commencer
        </button>
        <Footer />
      </div>
    );
  }

  if (submitState === "done") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="diamond mb-6" aria-hidden="true" />
        <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {successTitle}
        </h1>
        <p className="mb-10 max-w-md text-[15px] leading-relaxed text-blanc-casse/70">
          {successBody}
        </p>
        <a
          href={prefilledCalendlyUrl}
          className="rounded-lg bg-rouge-principal px-8 py-4 text-[15px] font-bold tracking-wide text-blanc-casse transition-colors hover:bg-rouge-fonce active:scale-[0.98]"
        >
          Réserver mon appel
        </a>
        <Footer />
      </div>
    );
  }

  // Ecran d'erreur dedie (prompt 14/15, section 1.4) : si l'enregistrement
  // des reponses echoue, l'utilisateur n'est jamais bloque. Le lien
  // Calendly reste propose directement ici, sans dependre d'un nouvel
  // essai reussi — reserver l'appel compte plus que sauvegarder les
  // reponses, donc l'un ne doit jamais bloquer l'autre.
  if (submitState === "error") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="diamond mb-6" aria-hidden="true" />
        <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Petit problème technique
        </h1>
        <p className="mb-10 max-w-md text-[15px] leading-relaxed text-blanc-casse/70">
          Tes réponses n&rsquo;ont pas pu être enregistrées, mais ça ne doit pas t&rsquo;empêcher de réserver ton appel. Tu peux aussi réessayer, ou nous écrire directement sur Instagram.
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href={prefilledCalendlyUrl}
            className="rounded-lg bg-rouge-principal px-8 py-4 text-[15px] font-bold tracking-wide text-blanc-casse transition-colors hover:bg-rouge-fonce active:scale-[0.98]"
          >
            Réserver mon appel quand même
          </a>
          <button
            type="button"
            onClick={() => setSubmitState("idle")}
            className="text-sm font-medium text-blanc-casse/50 transition-colors hover:text-blanc-casse"
          >
            Réessayer l&rsquo;envoi
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-10">
      <div className="mb-10 flex items-center gap-3">
        <span className="text-xs font-bold tabular-nums tracking-wide text-blanc-casse/50">
          {String(stepIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-rouge-tres-fonce">
          <div
            className="h-full rounded-full bg-rouge-principal transition-all duration-300 ease-out"
            style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <h2 className="mb-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {current.label}
        </h2>
        {current.helper ? (
          <p className="mb-6 text-sm text-blanc-casse/60">{current.helper}</p>
        ) : (
          <div className="mb-6" />
        )}

        {current.type === "choice" ? (
          <div className="flex flex-col gap-3" role="radiogroup" aria-label={current.label}>
            {current.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setValue(current.id, opt.value);
                  }}
                  className={`rounded-lg border px-5 py-4 text-left text-[15px] font-medium transition-colors ${
                    selected
                      ? "border-rouge-principal bg-rouge-tres-fonce text-blanc-casse"
                      : "border-rouge-principal/15 bg-rouge-tres-fonce/40 text-blanc-casse/80 hover:border-rouge-principal/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : current.type === "textarea" ? (
          <textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(current.id, e.target.value)}
            placeholder={current.placeholder}
            rows={4}
            className="w-full rounded-lg border border-rouge-principal/20 bg-rouge-tres-fonce/40 px-5 py-4 text-[16px] text-blanc-casse placeholder:text-blanc-casse/35 focus:border-rouge-principal focus:outline-none"
          />
        ) : (
          <input
            autoFocus
            type={current.type === "tel" ? "tel" : current.type === "email" ? "email" : "text"}
            inputMode={current.type === "tel" ? "tel" : current.type === "email" ? "email" : "text"}
            value={value}
            onChange={(e) => setValue(current.id, e.target.value)}
            placeholder={current.placeholder}
            className="w-full rounded-lg border border-rouge-principal/20 bg-rouge-tres-fonce/40 px-5 py-4 text-[16px] text-blanc-casse placeholder:text-blanc-casse/35 focus:border-rouge-principal focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") goNext();
            }}
          />
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="text-sm font-medium text-blanc-casse/50 transition-colors hover:text-blanc-casse disabled:opacity-0"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvance || isPending}
          className="rounded-lg bg-rouge-principal px-8 py-3.5 text-[15px] font-bold tracking-wide text-blanc-casse transition-colors hover:bg-rouge-fonce active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Envoi..." : stepIndex === total - 1 ? "Envoyer" : "Suivant"}
        </button>
      </div>
    </div>
  );
}
