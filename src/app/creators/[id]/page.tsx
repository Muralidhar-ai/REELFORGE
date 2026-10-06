import React from "react";
import { notFound } from "next/navigation";
import { repo } from "@/lib/data";
import { CreatorProfile } from "@/components/creators/CreatorProfile";

export const revalidate = 0;

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = await repo.getCreator(id);
  if (!creator) {
    notFound();
  }

  const portfolio = await repo.listPortfolioItems(id);
  const licenses = await repo.listToolLicenses();
  const allBriefs = await repo.listBriefs();
  const publishedBriefs = allBriefs.filter((b) => b.status === "published");

  return (
    <CreatorProfile
      creator={creator}
      portfolio={portfolio}
      licenses={licenses}
      publishedBriefs={publishedBriefs}
    />
  );
}
