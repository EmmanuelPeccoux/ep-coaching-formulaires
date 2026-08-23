import { redirect } from "next/navigation";

// La racine n'est liee nulle part explicitement depuis ep-site (les deux
// pages pointent directement vers /prequalification et /business), mais
// Next.js a besoin d'un app/page.tsx pour eviter un 404 sur "/" — redirige
// vers le formulaire physique plutot que d'afficher une page vide.
export default function Home() {
  redirect("/prequalification");
}
