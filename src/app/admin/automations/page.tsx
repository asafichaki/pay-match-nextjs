import { Suspense } from "react";
import { listAutomations, listRecentRuns } from "./actions";
import AutomationsClient from "./AutomationsClient";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const [automations, runs] = await Promise.all([
    safeListAutomations(),
    safeListRecentRuns(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-muted-foreground">
            Event-driven rules: when a trigger fires, run an action.
          </p>
        </div>
      </header>

      <Suspense fallback={<div>Loading…</div>}>
        <AutomationsClient
          initialAutomations={automations.rows}
          initialRuns={runs.rows}
          loadError={automations.error || runs.error}
        />
      </Suspense>
    </div>
  );
}

async function safeListAutomations() {
  try {
    return { rows: await listAutomations(), error: null };
  } catch (e) {
    return { rows: [], error: (e as Error).message };
  }
}

async function safeListRecentRuns() {
  try {
    return { rows: await listRecentRuns(50), error: null };
  } catch (e) {
    return { rows: [], error: (e as Error).message };
  }
}
