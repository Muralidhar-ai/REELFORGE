import React from "react";
import { repo } from "@/lib/data";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PortfolioItem } from "@/lib/types";

export const revalidate = 0;

export default async function AdminPage() {
  const creatorResult = await repo.listCreators({});
  const briefs = await repo.listBriefs();
  const engagements = await repo.listEngagements();
  const licenses = await repo.listToolLicenses();
  const allPortfolio = await repo.listPortfolioItems();

  const portfolioMap: Record<string, PortfolioItem[]> = {};
  for (const item of allPortfolio) {
    if (!portfolioMap[item.creator_id]) {
      portfolioMap[item.creator_id] = [];
    }
    portfolioMap[item.creator_id].push(item);
  }

  return (
    <AdminDashboard
      initialCreators={creatorResult.creators}
      initialBriefs={briefs}
      initialEngagements={engagements}
      licenses={licenses}
      portfolioMap={portfolioMap}
    />
  );
}
