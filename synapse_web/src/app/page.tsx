import { Dashboard } from "@/components/Dashboard";

async function getInitialData() {
  try {
    const backendUrl = process.env.API_BACKEND_URL || "http://127.0.0.1:4000/api";
    
    // Ejecutar ambas peticiones en paralelo
    const [notesRes, catRes] = await Promise.all([
      fetch(`${backendUrl}/notes`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${backendUrl}/categories`, { next: { revalidate: 3600 } }).catch(() => null)
    ]);
    
    const notes = notesRes?.ok ? await notesRes.json() : [];
    const categories = catRes?.ok ? await catRes.json() : [];
    
    return { notes, categories };
  } catch (err) {
    console.error("Error fetching initial data:", err);
    return { notes: [], categories: [] };
  }
}

export default async function Home() {
  const { notes, categories } = await getInitialData();
  
  return <Dashboard initialNotes={notes} initialCategories={categories} />;
}
