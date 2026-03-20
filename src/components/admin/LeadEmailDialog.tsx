"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Lead {
  id: string;
  full_name: string;
  email: string;
}

interface LeadEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

export function LeadEmailDialog({ open, onOpenChange, lead }: LeadEmailDialogProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [email, setEmail] = useState({
    subject: "",
    message: "",
  });

  const handleSend = async () => {
    if (!email.subject || !email.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // Try to call the edge function
      const { data, error } = await supabase.functions.invoke("send-lead-email", {
        body: {
          to: lead.email,
          subject: email.subject,
          message: email.message,
          leadName: lead.full_name,
        },
      });

      if (error) {
        // If error is about missing function, show setup instructions
        if (error.message.includes("not found") || error.message.includes("FunctionsRelayError")) {
          setNeedsSetup(true);
          return;
        }
        throw error;
      }

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("lead_activities").insert({
        lead_id: lead.id,
        activity_type: "email",
        title: `Email sent: ${email.subject}`,
        description: email.message,
        created_by: user?.id,
      });

      // Update last_contacted
      await supabase
        .from("quiz_leads")
        .update({ last_contacted: new Date().toISOString() })
        .eq("id", lead.id);

      toast({
        title: "Email sent successfully",
        description: `Email sent to ${lead.email}`,
      });

      setEmail({ subject: "", message: "" });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (needsSetup) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Setup Required</DialogTitle>
            <DialogDescription>
              To send emails, you need to set up Resend integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Setup Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Sign up for a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com</a></li>
                    <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/domains</a></li>
                    <li>Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/api-keys</a></li>
                    <li>Contact support to add the RESEND_API_KEY to your project</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            <Button onClick={() => { setNeedsSetup(false); onOpenChange(false); }} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email to {lead.full_name}</DialogTitle>
          <DialogDescription>
            Compose and send an email to {lead.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={lead.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              placeholder="Email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={email.message}
              onChange={(e) => setEmail({ ...email, message: e.target.value })}
              placeholder="Type your message here..."
              rows={10}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending} className="flex-1">
              {sending ? "Sending..." : "Send Email"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
