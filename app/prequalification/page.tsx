import type { Metadata } from "next";
import Wizard, { type Question } from "@/components/Wizard";
import { submitPhysiqueForm } from "./actions";

// Route laissee a /prequalification (pas de redirection casse) : le mot
// "pre-qualification" a ete retire de tout ce qui est visible (titre,
// libelles, ecran de confirmation), voir prompt 13/15. Si l'URL change un
// jour, il faudra repercuter le lien sur ep-site (physique/index.html,
// bouton "Reserver mon appel" de la section Accompagnement 1-to-1).
export const metadata: Metadata = {
  title: "EP Coaching · Avant notre appel",
  description:
    "Réponds à quelques questions avant de réserver ton appel avec Santamaria Sànchez, coach EP Coaching.",
};

const questions: Question[] = [
  {
    type: "choice",
    id: "objectif",
    label: "C'est quoi ton objectif principal en ce moment ?",
    options: [
      { value: "prise_de_muscle", label: "Prise de muscle" },
      { value: "perte_de_gras", label: "Perte de gras" },
      { value: "recomposition", label: "Recomposition (les deux en même temps)" },
      { value: "competition", label: "Préparation compétition" },
    ],
  },
  {
    type: "textarea",
    id: "pourquoi",
    label: "Pourquoi cet objectif compte pour toi ?",
    placeholder: "Réponds simplement, avec tes mots.",
  },
  {
    type: "choice",
    id: "niveau",
    label: "Depuis combien de temps tu t'entraînes ?",
    helper: "Peu importe la réponse, ce qui compte c'est la suite.",
    options: [
      { value: "debutant", label: "Je débute" },
      { value: "moins_1_an", label: "Moins d'un an" },
      { value: "1_a_3_ans", label: "1 à 3 ans" },
      { value: "plus_3_ans", label: "Plus de 3 ans" },
    ],
  },
  {
    type: "choice",
    id: "motivation",
    label: "Tu es prêt à investir du temps et de l'énergie pour y arriver ?",
    options: [
      { value: "a_fond", label: "Oui, je suis à fond" },
      { value: "doutes_regularite", label: "Oui, mais j'ai des doutes sur ma régularité" },
      { value: "pas_maintenant", label: "Pas vraiment pour l'instant" },
    ],
  },
  { type: "text", id: "prenom", label: "Ton prénom ?", placeholder: "Prénom" },
  { type: "text", id: "nom", label: "Ton nom ?", placeholder: "Nom" },
  {
    type: "tel",
    id: "telephone",
    label: "Ton numéro de téléphone ?",
    placeholder: "06 12 34 56 78",
    helper: "Pour te recontacter si besoin avant l'appel.",
  },
  {
    type: "choice",
    id: "timeline",
    label: "Tu es prêt à commencer quand ?",
    options: [
      { value: "tout_de_suite", label: "Tout de suite" },
      { value: "prochaines_semaines", label: "Dans les prochaines semaines" },
      { value: "je_me_renseigne", label: "Je me renseigne pour l'instant" },
    ],
  },
  {
    type: "choice",
    id: "budget",
    label: "Quel budget mensuel tu es prêt à investir dans ton accompagnement ?",
    helper: "Sers-toi de ces fourchettes pour te situer, pas besoin d'être exact.",
    options: [
      { value: "350", label: "350€ / mois" },
      { value: "550", label: "550€ / mois" },
      { value: "750", label: "750€ / mois" },
      { value: "flexible", label: "Autant qu'il faut pour atteindre mes objectifs" },
    ],
  },
];

export default function PrequalificationPage() {
  return (
    <Wizard
      intro={{
        eyebrow: "◆ EP Coaching",
        title: "Avant notre appel",
        body: "Réponds à quelques questions, ça prend moins de 3 minutes. On fait le point avant de se parler.",
      }}
      questions={questions}
      onSubmit={submitPhysiqueForm}
      successTitle="On se parle bientôt"
      successBody="Réserve ton créneau, on fait le point sur ta situation et sur ce que tu veux atteindre."
      ctaHref="https://calendly.com/peccoux-manu/30min"
      ctaLabel="Réserver mon appel"
    />
  );
}
