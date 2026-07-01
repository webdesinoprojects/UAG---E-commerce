"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import type { ContentPage } from "@/features/content-pages/types";
import {
  updateContentPageAction,
  type ContentPageActionState,
} from "@/features/content-pages/actions";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ContentPageEditorProps {
  page: ContentPage;
}

const INITIAL_STATE: ContentPageActionState = {
  status: "idle",
  message: null,
};

interface BlockForm {
  title: string;
  body: string;
  href: string;
  image: string;
  imageUrl: string;
  imageMediaAssetId: string | null;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  ctaLabel: string;
}

export function ContentPageEditor({ page }: ContentPageEditorProps) {
  const [state, action, pending] = useActionState(
    updateContentPageAction,
    INITIAL_STATE
  );
  const [paragraphs, setParagraphs] = useState(page.paragraphs);
  const [blocks, setBlocks] = useState(
    page.blocks.map((block) => ({
      title: block.title,
      body: block.body,
      href: block.href ?? "",
      image: block.image ?? "",
      imageUrl: block.imageUrl ?? block.image ?? "",
      imageMediaAssetId: block.imageMediaAssetId,
      accentColor: block.accentColor ?? "#2563eb",
      backgroundColor: block.backgroundColor ?? "#ffffff",
      textColor: block.textColor ?? "#111827",
      ctaLabel: block.ctaLabel ?? "View Product",
    }))
  );
  const showParagraphEditor = page.key === "about-us" || page.key === "home-info";
  const showLaunchEditor = page.key === "new-launches";

  const updateBlock = (index: number, patch: Partial<BlockForm>) => {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      )
    );
  };

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-3">
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4" />
              More Pages
            </Link>
          </Button>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-zinc-900 dark:text-white">
            {page.adminTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit storefront copy, imagery, and content blocks for {page.route}.
          </p>
        </div>
        <Button type="submit" form="content-page-form" disabled={pending}>
          {pending ? "Publishing..." : "Publish Page"}
        </Button>
      </div>

      <form id="content-page-form" action={action} className="space-y-6">
        <input type="hidden" name="key" value={page.key} />
        <input type="hidden" name="blockCount" value={blocks.length} />

        {state.message ? (
          <Alert variant={state.status === "success" ? "default" : "destructive"}>
            {state.status === "success" ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        {!showParagraphEditor
          ? paragraphs.map((paragraph, index) => (
              <input
                key={index}
                type="hidden"
                name="paragraphs"
                value={paragraph}
              />
            ))
          : null}

        {blocks.map((block, index) => (
          <input
            key={`media-${index}`}
            type="hidden"
            name={`blockImageMediaAssetId-${index}`}
            value={block.imageMediaAssetId ?? ""}
          />
        ))}

        <div
          className={cn(
            "grid gap-6",
            showParagraphEditor ? "lg:grid-cols-[1fr_0.85fr]" : ""
          )}
        >
          <Card>
            <CardHeader>
              <CardTitle>Main content</CardTitle>
              <CardDescription>
                This controls the hero and top copy on the public page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="eyebrow">Eyebrow</FieldLabel>
                  <Input id="eyebrow" name="eyebrow" defaultValue={page.eyebrow} />
                  <FieldError>{state.fieldErrors?.eyebrow?.[0]}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input id="title" name="title" defaultValue={page.title} />
                  <FieldError>{state.fieldErrors?.title?.[0]}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={page.description}
                    className="min-h-24"
                  />
                  <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="image">Image path</FieldLabel>
                  <Input id="image" name="image" defaultValue={page.image} />
                  <FieldDescription>
                    Use a local image path such as /images/carousel/banner1.png.
                  </FieldDescription>
                  <FieldError>{state.fieldErrors?.image?.[0]}</FieldError>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {showParagraphEditor ? (
            <Card>
              <CardHeader>
                <CardTitle>Paragraphs</CardTitle>
                <CardDescription>
                  About Us and Homepage Info use these paragraph sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <Field key={index}>
                    <FieldLabel>Paragraph {index + 1}</FieldLabel>
                    <Textarea
                      name="paragraphs"
                      defaultValue={paragraph}
                      className="min-h-28"
                    />
                  </Field>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={paragraphs.length >= 4}
                  onClick={() =>
                    setParagraphs((current) => [...current, "New paragraph"])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Paragraph
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Editable blocks</CardTitle>
                <CardDescription>
                  {showLaunchEditor
                    ? "Each launch card can manage text, image, link, CTA, and colors."
                    : "Blog cards, policy sections, FAQs, and contact rows use these blocks."}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={blocks.length >= 12}
                onClick={() =>
                  setBlocks((current) => [
                    ...current,
                    {
                      title: showLaunchEditor ? "New launch" : "New section",
                      body: "Add content here.",
                      href: showLaunchEditor ? "/categories" : "",
                      image: showLaunchEditor
                        ? "/images/categories/earbuds.png"
                        : "",
                      imageUrl: showLaunchEditor
                        ? "/images/categories/earbuds.png"
                        : "",
                      imageMediaAssetId: null,
                      accentColor: "#2563eb",
                      backgroundColor: "#ffffff",
                      textColor: "#111827",
                      ctaLabel: "View Product",
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Add Block
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={index}
                className={cn(
                  "grid gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800",
                  showLaunchEditor
                    ? "lg:grid-cols-[180px_minmax(0,1fr)_auto]"
                    : "md:grid-cols-[0.45fr_1fr_auto]"
                )}
              >
                {showLaunchEditor ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                      {block.imageUrl ? (
                        // Admin preview for selected Media Library URL or local path.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={block.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <MediaPickerModal
                      allowedTypes="image"
                      selectedAssetId={block.imageMediaAssetId}
                      onSelect={(asset) =>
                        updateBlock(index, {
                          imageMediaAssetId: asset?.id ?? null,
                          imageUrl: asset?.url ?? block.image,
                        })
                      }
                      trigger={
                        <Button type="button" variant="outline" className="w-full">
                          <ImageIcon className="h-4 w-4" />
                          {block.imageMediaAssetId ? "Change image" : "Select image"}
                        </Button>
                      }
                    />
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input
                      name={`blockTitle-${index}`}
                      value={block.title}
                      onChange={(event) =>
                        updateBlock(index, { title: event.target.value })
                      }
                    />
                  </Field>
                  {showLaunchEditor ? (
                    <Field>
                      <FieldLabel>CTA label</FieldLabel>
                      <Input
                        name={`blockCtaLabel-${index}`}
                        value={block.ctaLabel}
                        onChange={(event) =>
                          updateBlock(index, { ctaLabel: event.target.value })
                        }
                      />
                    </Field>
                  ) : null}
                  <Field className={showLaunchEditor ? "md:col-span-2" : ""}>
                    <FieldLabel>Body</FieldLabel>
                    <Textarea
                      name={`blockBody-${index}`}
                      value={block.body}
                      onChange={(event) =>
                        updateBlock(index, { body: event.target.value })
                      }
                      className="min-h-24"
                    />
                  </Field>
                  {showLaunchEditor ? (
                    <>
                      <Field>
                        <FieldLabel>Link</FieldLabel>
                        <Input
                          name={`blockHref-${index}`}
                          value={block.href}
                          onChange={(event) =>
                            updateBlock(index, { href: event.target.value })
                          }
                          placeholder="/categories/earbuds"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Fallback image path</FieldLabel>
                        <Input
                          name={`blockImage-${index}`}
                          value={block.image}
                          onChange={(event) => {
                            const image = event.target.value;
                            updateBlock(index, {
                              image,
                              imageUrl: block.imageMediaAssetId
                                ? block.imageUrl
                                : image,
                            });
                          }}
                          placeholder="/images/categories/earbuds.png"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Accent color</FieldLabel>
                        <Input
                          type="color"
                          name={`blockAccentColor-${index}`}
                          value={block.accentColor}
                          onChange={(event) =>
                            updateBlock(index, {
                              accentColor: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Card background</FieldLabel>
                        <Input
                          type="color"
                          name={`blockBackgroundColor-${index}`}
                          value={block.backgroundColor}
                          onChange={(event) =>
                            updateBlock(index, {
                              backgroundColor: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Text color</FieldLabel>
                        <Input
                          type="color"
                          name={`blockTextColor-${index}`}
                          value={block.textColor}
                          onChange={(event) =>
                            updateBlock(index, { textColor: event.target.value })
                          }
                        />
                      </Field>
                    </>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={blocks.length <= 1}
                  onClick={() =>
                    setBlocks((current) => current.filter((_, i) => i !== index))
                  }
                  aria-label="Remove block"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
