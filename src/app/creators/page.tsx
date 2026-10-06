import React from "react";
import { repo } from "@/lib/data";
import { CreatorDirectory } from "@/components/creators/CreatorDirectory";
import { PortfolioItem } from "@/lib/types";

export const revalidate = 0;

export default async function CreatorsPage() {
  const initialResult = await repo.listCreators({});
  const allPortfolio = await repo.listPortfolioItems();
  const licenses = await repo.listToolLicenses();

  const portfolioMap: Record<string, PortfolioItem[]> = {};
  for (const item of allPortfolio) {
    if (!portfolioMap[item.creator_id]) {
      portfolioMap[item.creator_id] = [];
    }
    portfolioMap[item.creator_id].push(item);
  }

  return (
    <CreatorDirectory
      initialResult={initialResult}
      portfolioMap={portfolioMap}
      licenses={licenses}
    />
  );
}
