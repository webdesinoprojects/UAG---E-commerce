"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Megaphone,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  updateHomepageAnnouncementAction,
  type HomepageAnnouncementActionState,
} from "@/features/homepage/actions";
import type { HomepageAnnouncement } from "@/features/homepage/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface TopBannerEditorProps {
  announcement: HomepageAnnouncement;
}

const initialActionState: HomepageAnnouncementActionState = {
  status: "idle",
  message: null,
};

const MAX_MESSAGES = 8;

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {children}
    </p>
  );
}

export function TopBannerEditor({ announcement }: TopBannerEditorProps) {
  const [state, action, pending] = React.useActionState(
    updateHomepageAnnouncementAction,
    initialActionState
  );
  const [isEnabled, setIsEnabled] = React.useState(announcement.isEnabled);
  const [messages, setMessages] = React.useState(() =>
    announcement.items.map((item) => item.text)
  );
  const [backgroundColor, setBackgroundColor] = React.useState(
    announcement.backgroundColor
  );
  const [textColor, setTextColor] = React.useState(announcement.textColor);
  const [accentColor, setAccentColor] = React.useState(announcement.accentColor);
  const [speedSeconds, setSpeedSeconds] = React.useState(
    String(announcement.speedSeconds)
  );

  const addMessage = () => {
    setMessages((current) =>
      current.length >= MAX_MESSAGES ? current : [...current, ""]
    );
  };

  const removeMessage = (index: number) => {
    setMessages((current) =>
      current.length <= 1 ? current : current.filter((_, idx) => idx !== index)
    );
  };

  const updateMessage = (index: number, value: string) => {
    setMessages((current) =>
      current.map((message, idx) => (idx === index ? value : message))
    );
  };

  const previewMessages = messages.filter((message) => message.trim().length > 0);
  const repeatedPreview =
    previewMessages.length > 0
      ? [...previewMessages, ...previewMessages, ...previewMessages]
      : [];

  return (
    <form action={action} className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <input type="hidden" name="isEnabled" value={isEnabled ? "true" : "false"} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
            <Link href="/admin/homepage" aria-label="Back to homepage CMS">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white sm:flex dark:bg-white dark:text-zinc-900">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Top Marquee Banner
              </h1>
              <p className="text-sm text-zinc-500">
                Storewide announcement bar shown above the category navigation.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={isEnabled ? "default" : "secondary"}
            className="gap-1.5"
          >
            {isEnabled ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {isEnabled ? "Visible" : "Hidden"}
          </Badge>
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      {state.message ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {/* Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main: messages */}
        <Card className="border-zinc-200 shadow-sm lg:col-span-7 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Short promotional lines that scroll across the bar. Keep them
                  punchy.
                </CardDescription>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono">
                {messages.length}/{MAX_MESSAGES}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center font-mono text-xs text-zinc-400">
                  {index + 1}
                </span>
                <Input
                  name="messages"
                  value={message}
                  onChange={(event) => updateMessage(index, event.target.value)}
                  maxLength={140}
                  placeholder="FREE SHIPPING ON ORDERS OVER ..."
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-zinc-400 hover:text-red-600"
                  onClick={() => removeMessage(index)}
                  disabled={messages.length <= 1}
                  aria-label={`Remove message ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {state.fieldErrors?.messages?.[0] ? (
              <p className="text-sm text-destructive">
                {state.fieldErrors.messages[0]}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMessage}
                disabled={messages.length >= MAX_MESSAGES}
              >
                <Plus className="h-4 w-4" />
                Add message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Side: settings + preview */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Visibility and styling for the marquee bar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <GroupLabel>Visibility</GroupLabel>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <Label htmlFor="banner-active">Show top marquee</Label>
                    <p className="text-xs text-zinc-500">
                      Turning this off hides the entire marquee from the
                      storefront.
                    </p>
                  </div>
                  <Switch
                    id="banner-active"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <GroupLabel>Design</GroupLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    id="backgroundColor"
                    name="backgroundColor"
                    label="Background"
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                  />
                  <ColorField
                    id="textColor"
                    name="textColor"
                    label="Text"
                    value={textColor}
                    onChange={setTextColor}
                  />
                  <ColorField
                    id="accentColor"
                    name="accentColor"
                    label="Accent"
                    value={accentColor}
                    onChange={setAccentColor}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="speedSeconds">Loop duration (s)</Label>
                    <Input
                      id="speedSeconds"
                      name="speedSeconds"
                      type="number"
                      min={10}
                      max={120}
                      value={speedSeconds}
                      onChange={(event) => setSpeedSeconds(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Live preview</CardTitle>
                  <CardDescription>
                    Reflects unsaved changes. Publish to go live.
                  </CardDescription>
                </div>
                {!isEnabled ? (
                  <Badge variant="secondary" className="shrink-0 gap-1.5">
                    <EyeOff className="h-3.5 w-3.5" />
                    Hidden
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={
                  "overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800" +
                  (isEnabled ? "" : " opacity-50")
                }
              >
                {repeatedPreview.length > 0 ? (
                  <div
                    className="flex w-full overflow-hidden py-2.5"
                    style={{ backgroundColor, color: textColor }}
                  >
                    <div
                      className="marquee-container marquee-animation"
                      style={{ animationDuration: `${Number(speedSeconds) || 35}s` }}
                    >
                      {repeatedPreview.map((message, index) => (
                        <span
                          key={index}
                          className="mx-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: accentColor }}
                            aria-hidden="true"
                          />
                          {message}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-zinc-500">
                    Add a message to preview the marquee.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function ColorField({
  id,
  name,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          name={name}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 shrink-0 p-1"
        />
        <Input
          value={value}
          readOnly
          aria-label={`${label} hex value`}
          className="flex-1 font-mono uppercase"
        />
      </div>
    </div>
  );
}
