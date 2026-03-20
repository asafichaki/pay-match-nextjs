"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  UserPlus,
  Zap,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface AutomationCard {
  title: string;
  description: string;
  icon: typeof Mail;
  status: "Planned" | "Active" | "Beta";
  features: string[];
}

const automations: AutomationCard[] = [
  {
    title: "Email Marketing",
    description: "Automated email sequences for lead nurturing",
    icon: Mail,
    status: "Planned",
    features: [
      "Welcome sequence for new quiz leads",
      "Follow-up reminder emails",
      "Monthly newsletter to subscribers",
      "Re-engagement campaigns for cold leads",
      "Provider recommendation emails based on quiz results",
    ],
  },
  {
    title: "Lead Auto-Assignment",
    description: "Automatically assign leads based on criteria",
    icon: UserPlus,
    status: "Planned",
    features: [
      "Route by monthly volume tier",
      "Route by industry/business type",
      "Round-robin assignment",
      "Priority-based routing",
    ],
  },
  {
    title: "Webhooks & Integrations",
    description: "Connect with external tools and services",
    icon: Zap,
    status: "Planned",
    features: [
      "Zapier / Make.com triggers",
      "Slack notifications for new leads",
      "Google Sheets export",
      "CRM sync (HubSpot, Salesforce)",
    ],
  },
  {
    title: "Notifications",
    description: "Smart alerts and reminders",
    icon: Bell,
    status: "Planned",
    features: [
      "Email alert for new leads",
      "Daily digest of activities",
      "Follow-up reminders",
      "Overdue task alerts",
      "Weekly performance report",
    ],
  },
];

const statusStyles: Record<string, string> = {
  Planned: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Beta: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AutomationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Automations & Integrations
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            Set up automated workflows to streamline your business
          </p>
        </div>

        {/* Overview Banner */}
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Automation Roadmap</h3>
              <p className="text-sm text-muted-foreground">
                These features are currently in planning. They will help automate lead management,
                email outreach, notifications, and third-party integrations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Automations Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {automations.map((automation) => {
            const Icon = automation.icon;
            return (
              <Card key={automation.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{automation.title}</CardTitle>
                        <CardDescription className="mt-0.5">
                          {automation.description}
                        </CardDescription>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusStyles[automation.status]}`}
                    >
                      {automation.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-5 pt-0">
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Planned Features
                    </p>
                    <ul className="space-y-2">
                      {automation.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" disabled className="w-full gap-2 mt-2">
                    <Clock className="h-4 w-4" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Have a specific automation need? Reach out to the development team to prioritize features.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled className="shrink-0">
              Request Feature
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
