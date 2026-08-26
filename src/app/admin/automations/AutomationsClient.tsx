"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Play, AlertTriangle, RefreshCw } from "lucide-react";
import {
  createAutomation,
  deleteAutomation,
  runAutomationNow,
  toggleAutomationEnabled,
  updateAutomation,
} from "./actions";
import { TRIGGERS, ACTIONS, type FieldDescriptor } from "@/lib/automations/registry";
import type { AutomationRow, AutomationRunRow, AutomationInput } from "@/lib/automations/types";

interface Props {
  initialAutomations: AutomationRow[];
  initialRuns: AutomationRunRow[];
  loadError: string | null;
}

function emptyInput(): AutomationInput {
  return {
    name: "",
    description: "",
    enabled: true,
    trigger_type: TRIGGERS[0]?.type ?? "lead_inserted",
    trigger_config: {},
    action_type: ACTIONS[0]?.type ?? "send_email",
    action_config: {},
  };
}

export default function AutomationsClient({ initialAutomations, initialRuns, loadError }: Props) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState(initialAutomations);
  const [runs, setRuns] = useState(initialRuns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationRow | null>(null);
  const [draft, setDraft] = useState<AutomationInput>(emptyInput());
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const triggerDesc = useMemo(
    () => TRIGGERS.find((t) => t.type === draft.trigger_type),
    [draft.trigger_type]
  );
  const actionDesc = useMemo(
    () => ACTIONS.find((a) => a.type === draft.action_type),
    [draft.action_type]
  );

  function openCreate() {
    setEditing(null);
    setDraft(emptyInput());
    setDialogOpen(true);
  }

  function openEdit(row: AutomationRow) {
    setEditing(row);
    setDraft({
      name: row.name,
      description: row.description || "",
      enabled: row.enabled,
      trigger_type: row.trigger_type,
      trigger_config: row.trigger_config || {},
      action_type: row.action_type,
      action_config: row.action_config || {},
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateAutomation(editing.id, draft);
        toast({ title: "Saved", description: `Automation "${draft.name}" updated.` });
      } else {
        await createAutomation(draft);
        toast({ title: "Created", description: `Automation "${draft.name}" created.` });
      }
      setDialogOpen(false);
      window.location.reload();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleToggle(row: AutomationRow, next: boolean) {
    setBusyId(row.id);
    try {
      await toggleAutomationEnabled(row.id, next);
      setAutomations((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, enabled: next } : r))
      );
    } catch (e) {
      toast({ title: "Toggle failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: AutomationRow) {
    if (!confirm(`Delete automation "${row.name}"?`)) return;
    setBusyId(row.id);
    try {
      await deleteAutomation(row.id);
      setAutomations((prev) => prev.filter((r) => r.id !== row.id));
      toast({ title: "Deleted" });
    } catch (e) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRunNow(row: AutomationRow) {
    setBusyId(row.id);
    try {
      const res = await runAutomationNow(row.id);
      if (res.ok) {
        toast({ title: "Ran", description: "Action completed (check Run history)." });
      } else {
        toast({ title: "Run failed", description: res.error, variant: "destructive" });
      }
      // Trigger reload to refresh run history
      startTransition(() => window.location.reload());
    } catch (e) {
      toast({ title: "Run failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  function setConfigField(scope: "trigger" | "action", key: string, value: unknown) {
    setDraft((prev) => ({
      ...prev,
      [scope === "trigger" ? "trigger_config" : "action_config"]: {
        ...(scope === "trigger" ? prev.trigger_config : prev.action_config),
        [key]: value,
      },
    }));
  }

  return (
    <>
      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Couldn&apos;t load automations</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="rules" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="rules">Rules ({automations.length})</TabsTrigger>
            <TabsTrigger value="runs">Run history ({runs.length})</TabsTrigger>
          </TabsList>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New automation
          </Button>
        </div>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Active rules</CardTitle>
              <CardDescription>
                Triggered automatically when a matching event fires. Disabled rules are skipped.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {automations.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No automations yet. Click <em>New automation</em> to create one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Last run</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.name}</div>
                          {row.description && (
                            <div className="text-xs text-muted-foreground">{row.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{labelFor(TRIGGERS, row.trigger_type)}</Badge>
                          <ConfigPreview cfg={row.trigger_config} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{labelFor(ACTIONS, row.action_type)}</Badge>
                          <ConfigPreview cfg={row.action_config} />
                        </TableCell>
                        <TableCell>{row.run_count}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.last_run_at ? new Date(row.last_run_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={row.enabled}
                            disabled={busyId === row.id}
                            onCheckedChange={(v) => handleToggle(row, v)}
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRunNow(row)}
                            disabled={busyId === row.id}
                            title="Run now against the most recent lead"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(row)}
                            disabled={busyId === row.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Run history</CardTitle>
                <CardDescription>Last 50 automation runs (success + failure).</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {runs.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No runs yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Automation</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((r) => {
                      const auto = automations.find((a) => a.id === r.automation_id);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs">
                            {new Date(r.ran_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{auto?.name || r.automation_id.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs">
                            {r.lead_id ? (
                              <a
                                href={`/admin/leads/${r.lead_id}`}
                                className="underline hover:no-underline"
                              >
                                {r.lead_id.slice(0, 8)}…
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.status === "success"
                                  ? "default"
                                  : r.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-md truncate">
                            {r.status === "failed"
                              ? r.error_message
                              : JSON.stringify(r.action_result ?? {})}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit automation" : "New automation"}</DialogTitle>
            <DialogDescription>
              Pick a trigger and an action. Configs are validated when the rule fires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="High-volume lead alert"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  value={draft.description || ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Trigger</label>
                <Select
                  value={draft.trigger_type}
                  onValueChange={(v) =>
                    setDraft({ ...draft, trigger_type: v, trigger_config: {} })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {triggerDesc && (
                  <p className="text-xs text-muted-foreground mt-1">{triggerDesc.description}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={draft.action_type}
                  onValueChange={(v) =>
                    setDraft({ ...draft, action_type: v, action_config: {} })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.type} value={a.type}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {actionDesc && (
                  <p className="text-xs text-muted-foreground mt-1">{actionDesc.description}</p>
                )}
              </div>
            </div>

            {triggerDesc && triggerDesc.fields.length > 0 && (
              <fieldset className="border rounded p-3 space-y-2">
                <legend className="text-xs font-medium px-1">Trigger config</legend>
                {triggerDesc.fields.map((f) => (
                  <ConfigField
                    key={f.key}
                    field={f}
                    value={(draft.trigger_config as Record<string, unknown>)[f.key]}
                    onChange={(v) => setConfigField("trigger", f.key, v)}
                  />
                ))}
              </fieldset>
            )}

            {actionDesc && actionDesc.fields.length > 0 && (
              <fieldset className="border rounded p-3 space-y-2">
                <legend className="text-xs font-medium px-1">Action config</legend>
                {actionDesc.fields.map((f) => (
                  <ConfigField
                    key={f.key}
                    field={f}
                    value={(draft.action_config as Record<string, unknown>)[f.key]}
                    onChange={(v) => setConfigField("action", f.key, v)}
                  />
                ))}
              </fieldset>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={draft.enabled ?? true}
                onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
              />
              <span className="text-sm">Enabled</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const v = value == null ? "" : String(value);
  return (
    <div>
      <label className="text-xs font-medium">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {field.type === "select" && field.options ? (
        <Select value={v} onValueChange={(val) => onChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value || "_empty"} value={opt.value || "__empty__"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
        />
      ) : (
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.help && <p className="text-xs text-muted-foreground mt-0.5">{field.help}</p>}
    </div>
  );
}

function ConfigPreview({ cfg }: { cfg: Record<string, unknown> }) {
  const entries = Object.entries(cfg || {}).filter(([, v]) => v !== "" && v != null);
  if (entries.length === 0) return null;
  return (
    <div className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-xs">
      {entries.map(([k, v]) => `${k}=${truncate(String(v), 24)}`).join(", ")}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function labelFor(
  list: { type: string; label: string }[],
  type: string
): string {
  return list.find((x) => x.type === type)?.label ?? type;
}
