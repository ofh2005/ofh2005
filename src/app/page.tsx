import { createClient } from "@/lib/supabase/server";
import { fetchAllData } from "@/lib/db";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();

  const data = await fetchAllData(supabase).catch((err) => {
    console.error("fetchAllData failed", err);
    return null;
  });

  if (!data) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui", color: "#1B2A4A" }}>
        Impossible de charger les données — vérifie ta connexion et réessaie.
      </div>
    );
  }

  return (
    <Dashboard
      initialSettings={data.settings}
      initialMachines={data.machines}
      initialOils={data.oils}
      initialClients={data.clients}
      initialTasks={data.tasks}
    />
  );
}
