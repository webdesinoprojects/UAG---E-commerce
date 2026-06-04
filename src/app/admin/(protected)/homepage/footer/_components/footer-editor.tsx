"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { updateSiteFooterAction } from "@/features/homepage/actions";
import type {
  SiteFooterContent,
  SiteFooterLink,
  SiteFooterLinkGroup,
  SiteFooterSocialLink,
  SiteFooterSocialPlatform,
} from "@/features/homepage/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FooterEditorProps {
  initialData: SiteFooterContent;
}

const linkGroups: SiteFooterLinkGroup[] = ["primary", "secondary"];
const socialPlatforms: SiteFooterSocialPlatform[] = [
  "facebook",
  "instagram",
  "youtube",
  "x",
  "linkedin",
  "custom",
];

function nextSortOrder(items: { sortOrder: number }[]) {
  return items.length > 0 ? Math.max(...items.map((item) => item.sortOrder)) + 10 : 10;
}

export default function FooterEditor({ initialData }: FooterEditorProps) {
  const [state, action, isPending] = useActionState(updateSiteFooterAction, {
    status: "idle",
    message: null,
  });
  const [isEnabled, setIsEnabled] = useState(initialData.isEnabled);
  const [logoPath, setLogoPath] = useState(initialData.logoPath);
  const [logoAlt, setLogoAlt] = useState(initialData.logoAlt);
  const [copyrightText, setCopyrightText] = useState(initialData.copyrightText);
  const [links, setLinks] = useState<SiteFooterLink[]>(initialData.links);
  const [socialLinks, setSocialLinks] = useState<SiteFooterSocialLink[]>(
    initialData.socialLinks
  );

  const groupedLinks = useMemo(
    () => ({
      primary: links.filter((link) => link.group === "primary"),
      secondary: links.filter((link) => link.group === "secondary"),
    }),
    [links]
  );

  const updateLink = (index: number, updates: Partial<SiteFooterLink>) => {
    setLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...updates } : link
      )
    );
  };

  const updateSocialLink = (
    index: number,
    updates: Partial<SiteFooterSocialLink>
  ) => {
    setSocialLinks((current) =>
      current.map((socialLink, linkIndex) =>
        linkIndex === index ? { ...socialLink, ...updates } : socialLink
      )
    );
  };

  const addLink = () => {
    if (links.length >= 12) return;

    setLinks((current) => [
      ...current,
      {
        id: `footer-link-new-${Date.now()}`,
        label: "NEW LINK",
        href: "/",
        group: "primary",
        sortOrder: nextSortOrder(current),
        isEnabled: true,
      },
    ]);
  };

  const addSocialLink = () => {
    if (socialLinks.length >= 8) return;

    setSocialLinks((current) => [
      ...current,
      {
        id: `footer-social-new-${Date.now()}`,
        label: "New Social",
        href: "https://example.com",
        platform: "custom",
        backgroundColor: "#18181b",
        sortOrder: nextSortOrder(current),
        isEnabled: true,
      },
    ]);
  };

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      <input type="hidden" name="isEnabled" value={isEnabled.toString()} />
      <input type="hidden" name="linkCount" value={links.length} />
      <input type="hidden" name="socialCount" value={socialLinks.length} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" type="button" asChild>
            <Link href="/admin/homepage" aria-label="Back to homepage CMS">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Footer Settings</h1>
            <p className="text-sm text-muted-foreground">
              Control footer logo, policy links, copyright, and social links.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Visible" : "Hidden"}
          </Badge>
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === "success" && state.message && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_260px_260px]">
          <div className="flex items-center gap-3">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <div>
              <Label>Show footer</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide the site footer on storefront routes.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Logo path</Label>
            <Input
              name="logoPath"
              value={logoPath}
              onChange={(event) => setLogoPath(event.target.value)}
              placeholder="/images/logo/logo.png"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Logo alt</Label>
            <Input
              name="logoAlt"
              value={logoAlt}
              onChange={(event) => setLogoAlt(event.target.value)}
            />
          </div>
          <div className="space-y-1.5 lg:col-span-3">
            <Label>Copyright</Label>
            <Input
              name="copyrightText"
              value={copyrightText}
              onChange={(event) => setCopyrightText(event.target.value)}
              maxLength={140}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Footer Links</CardTitle>
                <CardDescription>
                  Policy, blog, FAQ, and support links shown in the center.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLink}
                disabled={links.length >= 12}
              >
                <Plus className="h-4 w-4" />
                Add link
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {links.map((link, index) => {
                const prefix = `link-${index}-`;
                return (
                  <div
                    key={link.id}
                    className="grid gap-3 rounded-lg border bg-muted/20 p-3 lg:grid-cols-[1.1fr_1.4fr_120px_90px_90px_auto]"
                  >
                    <input type="hidden" name={`${prefix}id`} value={link.id} />
                    <input
                      type="hidden"
                      name={`${prefix}isEnabled`}
                      value={link.isEnabled.toString()}
                    />
                    <div className="space-y-1.5">
                      <Label>Label</Label>
                      <Input
                        name={`${prefix}label`}
                        value={link.label}
                        onChange={(event) =>
                          updateLink(index, { label: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Href</Label>
                      <Input
                        name={`${prefix}href`}
                        value={link.href}
                        onChange={(event) =>
                          updateLink(index, { href: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Group</Label>
                      <Select
                        value={link.group}
                        onValueChange={(value) =>
                          updateLink(index, {
                            group: value as SiteFooterLinkGroup,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {linkGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name={`${prefix}group`} value={link.group} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sort</Label>
                      <Input
                        name={`${prefix}sortOrder`}
                        type="number"
                        value={link.sortOrder}
                        onChange={(event) =>
                          updateLink(index, {
                            sortOrder: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch
                        checked={link.isEnabled}
                        onCheckedChange={(checked) =>
                          updateLink(index, { isEnabled: checked })
                        }
                      />
                      <Label className="text-xs">
                        {link.isEnabled ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-end text-destructive"
                      onClick={() =>
                        setLinks((current) =>
                          current.filter((_, linkIndex) => linkIndex !== index)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Controlled platform icons with editable destination links.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialLink}
                disabled={socialLinks.length >= 8}
              >
                <Plus className="h-4 w-4" />
                Add social
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialLinks.map((socialLink, index) => {
                const prefix = `social-${index}-`;
                return (
                  <div
                    key={socialLink.id}
                    className="grid gap-3 rounded-lg border bg-muted/20 p-3 lg:grid-cols-[1fr_1.3fr_130px_100px_90px_auto]"
                  >
                    <input
                      type="hidden"
                      name={`${prefix}id`}
                      value={socialLink.id}
                    />
                    <input
                      type="hidden"
                      name={`${prefix}isEnabled`}
                      value={socialLink.isEnabled.toString()}
                    />
                    <div className="space-y-1.5">
                      <Label>Label</Label>
                      <Input
                        name={`${prefix}label`}
                        value={socialLink.label}
                        onChange={(event) =>
                          updateSocialLink(index, { label: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Href</Label>
                      <Input
                        name={`${prefix}href`}
                        value={socialLink.href}
                        onChange={(event) =>
                          updateSocialLink(index, { href: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Platform</Label>
                      <Select
                        value={socialLink.platform}
                        onValueChange={(value) =>
                          updateSocialLink(index, {
                            platform: value as SiteFooterSocialPlatform,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name={`${prefix}platform`}
                        value={socialLink.platform}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Color</Label>
                      <Input
                        name={`${prefix}backgroundColor`}
                        type="color"
                        value={socialLink.backgroundColor}
                        onChange={(event) =>
                          updateSocialLink(index, {
                            backgroundColor: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sort</Label>
                      <Input
                        name={`${prefix}sortOrder`}
                        type="number"
                        value={socialLink.sortOrder}
                        onChange={(event) =>
                          updateSocialLink(index, {
                            sortOrder: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Switch
                        checked={socialLink.isEnabled}
                        onCheckedChange={(checked) =>
                          updateSocialLink(index, { isEnabled: checked })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() =>
                          setSocialLinks((current) =>
                            current.filter((_, linkIndex) => linkIndex !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Approximate storefront footer using unsaved changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-[#080808] p-6 text-white">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative h-10 w-32">
                  {logoPath ? (
                    <Image
                      src={logoPath}
                      alt={logoAlt || "Footer logo"}
                      fill
                      className="object-contain invert"
                      sizes="128px"
                    />
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    {groupedLinks.primary
                      .filter((link) => link.isEnabled)
                      .map((link) => (
                        <span key={link.id}>{link.label}</span>
                      ))}
                  </div>
                  <div className="flex justify-center gap-3 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    {groupedLinks.secondary
                      .filter((link) => link.isEnabled)
                      .map((link) => (
                        <span key={link.id}>{link.label}</span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {socialLinks
                    .filter((socialLink) => socialLink.isEnabled)
                    .map((socialLink) => (
                      <span
                        key={socialLink.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black uppercase"
                        style={{ backgroundColor: socialLink.backgroundColor }}
                      >
                        {socialLink.platform === "custom"
                          ? socialLink.label.slice(0, 1)
                          : socialLink.platform.slice(0, 2)}
                      </span>
                    ))}
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {copyrightText}
                </p>
              </div>
            </div>

            <Button type="button" variant="outline" className="mt-4 w-full" asChild>
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                Open Storefront
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
