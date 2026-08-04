import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedProfileData, getShareProfileBySlug } from "@/lib/actions";
import SharedViewClient from "./shared-view-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getShareProfileBySlug(slug);
  if (!profile) return {};

  const title = `${profile.name} — shared portfolio`;
  const description =
    profile.description ||
    "A curated collection of projects in progress.";
  const ogImage = `/og?title=${encodeURIComponent(profile.name)}&description=${encodeURIComponent(
    description
  )}`;

  return {
    title,
    description,
    openGraph: {
      title: profile.name,
      description,
      type: "website",
      url: `/share/${profile.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: profile.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: profile.name,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharedViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSharedProfileData(slug);
  if (!data) notFound();

  return <SharedViewClient profile={data.profile} ideas={data.ideas} />;
}
