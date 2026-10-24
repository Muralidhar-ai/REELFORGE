"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Creator, PortfolioItem, ToolLicense } from "@/lib/types";
import { CreatorListResult, CreatorFilterParams, EmptyStateSuggestion } from "@/lib/data/repo";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";
import { evaluateCreatorSafety } from "@/lib/safety";
import {
  SPECIALIZATIONS,
  TOOLS,
  CONTENT_TYPES,
  FORMATS,
  STYLE_TAGS,
} from "@/lib/vocab";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface CreatorDirectoryProps {
  initialResult: CreatorListResult;
  portfolioMap: Record<string, PortfolioItem[]>;
  licenses: ToolLicense[];
}

export function CreatorDirectory({
  initialResult,
  portfolioMap,
  licenses,
}: CreatorDirectoryProps) {
  const [result, setResult] = useState<CreatorListResult>(initialResult);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<CreatorFilterParams>({
    search: "",
    specialization: [],
    skills: [],
    tools: [],
    content_types: [],
    formats: [],
    style_tags: [],
    availability: undefined,
    verifiedOnly: false,
    safeForPaidAds: false,
    sort: "relevance",
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchFilteredCreators = (updatedFilters: CreatorFilterParams) => {
    startTransition(async () => {
      const query = new URLSearchParams();
      if (updatedFilters.search) query.set("search", updatedFilters.search);
      updatedFilters.specialization?.forEach((s) => query.append("specialization", s));
      updatedFilters.skills?.forEach((s) => query.append("skills", s));
      updatedFilters.tools?.forEach((t) => query.append("tools", t));
      updatedFilters.content_types?.forEach((ct) => query.append("content_types", ct));
      updatedFilters.formats?.forEach((f) => query.append("formats", f));
      updatedFilters.style_tags?.forEach((st) => query.append("style_tags", st));
      if (updatedFilters.availability) query.set("availability", updatedFilters.availability);
      if (updatedFilters.verifiedOnly) query.set("verifiedOnly", "true");
      if (updatedFilters.safeForPaidAds) query.set("safeForPaidAds", "true");
      if (updatedFilters.sort) query.set("sort", updatedFilters.sort);

      try {
        const res = await fetch(`/api/creators?${query.toString()}`);
        const data = await res.json();
        if (data.ok) {
          setResult({
            creators: data.creators,
            total: data.total,
            facets: data.facets,
            emptyStateSuggestions: data.emptyStateSuggestions,
          });
        }
      } catch (e) {
        console.error("Filter fetch error", e);
      }
    });
  };

  const toggleArrayFilter = (key: keyof CreatorFilterParams, val: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    const newFilters = { ...filters, [key]: updated };
    setFilters(newFilters);
    fetchFilteredCreators(newFilters);
  };

  const toggleBooleanFilter = (key: "verifiedOnly" | "safeForPaidAds") => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    fetchFilteredCreators(newFilters);
  };

  const handleSearchChange = (term: string) => {
    const newFilters = { ...filters, search: term };
    setFilters(newFilters);
    fetchFilteredCreators(newFilters);
  };

  const handleSortChange = (sort: "relevance" | "most_verified" | "most_portfolio") => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    fetchFilteredCreators(newFilters);
  };

  const clearAllFilters = () => {
    const cleared: CreatorFilterParams = {
      search: "",
      specialization: [],
      skills: [],
      tools: [],
      content_types: [],
      formats: [],
      style_tags: [],
      availability: undefined,
      verifiedOnly: false,
      safeForPaidAds: false,
      sort: "relevance",
    };
    setFilters(cleared);
    fetchFilteredCreators(cleared);
  };

  const removeSpecificFilter = (suggestion: EmptyStateSuggestion) => {
    const { filterKey, filterValue } = suggestion;
    if (filterKey === "verifiedOnly" || filterKey === "safeForPaidAds") {
      const newFilters = { ...filters, [filterKey]: false };
      setFilters(newFilters);
      fetchFilteredCreators(newFilters);
    } else {
      const current = (filters[filterKey as keyof CreatorFilterParams] as string[]) || [];
      const updated = current.filter((v) => v !== filterValue);
      const newFilters = { ...filters, [filterKey]: updated };
      setFilters(newFilters);
      fetchFilteredCreators(newFilters);
    }
  };

  // Active filter chips
  const activeChips: { key: keyof CreatorFilterParams; value: string; label: string }[] = [];
  if (filters.search) activeChips.push({ key: "search", value: filters.search, label: `Search: "${filters.search}"` });
  filters.specialization?.forEach((v) => activeChips.push({ key: "specialization", value: v, label: v }));
  filters.skills?.forEach((v) => activeChips.push({ key: "skills", value: v, label: v }));
  filters.tools?.forEach((v) => activeChips.push({ key: "tools", value: v, label: v }));
  filters.content_types?.forEach((v) => activeChips.push({ key: "content_types", value: v, label: v }));
  filters.formats?.forEach((v) => activeChips.push({ key: "formats", value: v, label: v }));
  filters.style_tags?.forEach((v) => activeChips.push({ key: "style_tags", value: v, label: v }));
  if (filters.availability) activeChips.push({ key: "availability", value: filters.availability, label: `Status: ${filters.availability}` });
  if (filters.verifiedOnly) activeChips.push({ key: "verifiedOnly", value: "true", label: "Verified directors only" });
  if (filters.safeForPaidAds) activeChips.push({ key: "safeForPaidAds", value: "true", label: "Safe for paid ads" });

  const renderFilterSidebar = () => (
    <div className="space-y-6 text-xs text-[#94A3B8]">
      {/* Search Input */}
      <div className="space-y-2" data-testid="filter-group">
        <label className="font-mono text-[#E5A83B] uppercase tracking-wider text-[11px] block font-bold">Search Roster</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search directors, tools, engines..."
            className="w-full bg-[#0B0D11] border border-[#1E2536] rounded-xl px-3 py-2 pl-9 text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#E5A83B] focus:ring-1 focus:ring-[#E5A83B]/50 transition-all font-sans"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5 pt-4 border-t border-[#1E2536]" data-testid="filter-group">
        <label className="flex items-center justify-between cursor-pointer text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1">
          <span className="font-medium">Verified directors only</span>
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={() => toggleBooleanFilter("verifiedOnly")}
            className="accent-[#E5A83B] rounded w-4 h-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1">
          <span className="font-medium">Safe for paid ads</span>
          <input
            type="checkbox"
            checked={Boolean(filters.safeForPaidAds)}
            onChange={() => toggleBooleanFilter("safeForPaidAds")}
            className="accent-[#E5A83B] rounded w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* Specialization */}
      <div className="space-y-2 pt-4 border-t border-[#1E2536]" data-testid="filter-group">
        <span className="font-mono text-[#E5A83B] text-[11px] uppercase tracking-wider block font-bold">Specialization</span>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {SPECIALIZATIONS.map((spec) => {
            const count = result.facets.specializations[spec] || 0;
            const checked = filters.specialization?.includes(spec);
            return (
              <label
                key={spec}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  checked ? "bg-[#1A1E29] text-[#F8FAFC] font-semibold border border-[#E5A83B]/40 shadow-sm" : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#12151D]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("specialization", spec)}
                    className="accent-[#E5A83B] rounded cursor-pointer"
                  />
                  <span>{spec}</span>
                </div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-2 pt-4 border-t border-[#1E2536]" data-testid="filter-group">
        <span className="font-mono text-[#E5A83B] text-[11px] uppercase tracking-wider block font-bold">Generative Tools</span>
        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          {TOOLS.map((t) => {
            const count = result.facets.tools[t] || 0;
            const checked = filters.tools?.includes(t);
            return (
              <label
                key={t}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  checked ? "bg-[#1A1E29] text-[#F8FAFC] font-semibold border border-[#E5A83B]/40 shadow-sm" : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#12151D]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("tools", t)}
                    className="accent-[#E5A83B] rounded cursor-pointer"
                  />
                  <span>{t}</span>
                </div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Content Type */}
      <div className="space-y-1.5 pt-3 border-t border-[#282A24]" data-testid="filter-group">
        <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block font-medium">Deliverable Type</span>
        <div className="space-y-0.5">
          {CONTENT_TYPES.map((ct) => {
            const count = result.facets.content_types[ct] || 0;
            const checked = filters.content_types?.includes(ct);
            return (
              <label
                key={ct}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                  checked ? "bg-[#20211D] text-[#F3F0E8] font-medium border border-[#282A24]" : "text-[#AAA99F] hover:text-[#F3F0E8] hover:bg-[#191A17]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("content_types", ct)}
                    className="accent-[#D5AD52] rounded"
                  />
                  <span>{ct}</span>
                </div>
                <span className="font-mono text-[10px] text-[#76756D]">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Formats */}
      <div className="space-y-1.5 pt-3 border-t border-[#282A24]" data-testid="filter-group">
        <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block font-medium">Aspect Ratio</span>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((f) => {
            const checked = filters.formats?.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleArrayFilter("formats", f)}
                className={`px-2 py-0.5 rounded border text-xs font-mono transition-colors ${
                  checked
                    ? "border-[#D5AD52] text-[#F3F0E8] bg-[#20211D] font-medium"
                    : "border-[#282A24] text-[#AAA99F] hover:border-[#3D4036] hover:text-[#F3F0E8]"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Tags */}
      <div className="space-y-1.5 pt-3 border-t border-[#282A24]" data-testid="filter-group">
        <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block font-medium">Visual Aesthetics</span>
        <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
          {STYLE_TAGS.map((st) => {
            const checked = filters.style_tags?.includes(st);
            return (
              <button
                key={st}
                onClick={() => toggleArrayFilter("style_tags", st)}
                className={`px-2 py-0.5 rounded border text-[11px] transition-colors ${
                  checked
                    ? "border-[#D5AD52] text-[#F3F0E8] bg-[#20211D] font-medium"
                    : "border-[#282A24] text-[#AAA99F] hover:border-[#3D4036] hover:text-[#F3F0E8]"
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Cyber Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#1E2536] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151D] border border-[#1E2536] text-[#E5A83B] text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>DIRECTOR ROSTER & COMMERCIAL AI TALENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC] font-display">
            AI Filmmakers & Creative Directors
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-2xl">
            Filter certified generative filmmakers by tool stack, node reproducibility, aspect ratio clearance, and global advertising rights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="sm:hidden px-3.5 py-2 rounded-lg bg-[#12151D] border border-[#1E2536] text-[#F8FAFC] gap-2 text-xs font-mono flex items-center shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5A83B]" />
            Filters
          </button>

          <div className="flex items-center gap-2.5 text-xs text-[#94A3B8] font-mono bg-[#12151D] border border-[#1E2536] rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-[#64748B] uppercase font-bold text-[10px]">Sort:</span>
            <select
              suppressHydrationWarning
              value={filters.sort || "relevance"}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-transparent text-[#F8FAFC] text-xs font-semibold focus:outline-none cursor-pointer border-none p-0"
            >
              <option value="relevance" className="bg-[#12151D] text-[#F8FAFC]">Relevance & Match</option>
              <option value="most_verified" className="bg-[#12151D] text-[#F8FAFC]">Highest Verification</option>
              <option value="most_portfolio" className="bg-[#12151D] text-[#F8FAFC]">Most Work Samples</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-xs text-[#64748B] font-bold uppercase tracking-wider">Filtered by:</span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 text-xs border border-[#E5A83B]/30 text-[#F8FAFC] bg-[#12151D] px-3 py-1 rounded-lg font-mono shadow-sm"
            >
              <span className="text-[#E5A83B] font-medium">{chip.label}</span>
              <button
                onClick={() => {
                  if (chip.key === "search") handleSearchChange("");
                  else if (chip.key === "verifiedOnly" || chip.key === "safeForPaidAds")
                    toggleBooleanFilter(chip.key);
                  else toggleArrayFilter(chip.key, chip.value);
                }}
                className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="font-mono text-xs text-[#E5A83B] hover:text-[#FCD34D] transition-colors font-semibold ml-2 underline underline-offset-4"
          >
            Clear all ({activeChips.length})
          </button>
        </div>
      )}

      {/* Directory Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Desktop */}
        <aside className="hidden sm:block sm:col-span-4 lg:col-span-3 border-r border-[#282A24] pr-6 sticky top-20">
          {renderFilterSidebar()}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileDrawerOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
            <div className="w-4/5 max-w-sm bg-[#111210] h-full p-6 overflow-y-auto space-y-4 border-l border-[#282A24]">
              <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
                <span className="font-semibold text-base text-[#F3F0E8]">Filter Roster</span>
                <button onClick={() => setMobileDrawerOpen(false)}>
                  <X className="w-5 h-5 text-[#AAA99F]" />
                </button>
              </div>
              {renderFilterSidebar()}
            </div>
          </div>
        )}

        {/* Right Main Grid */}
        <main className="sm:col-span-8 lg:col-span-9 space-y-6">
          {isPending && (
            <div className="font-mono text-xs text-[#AAA99F] py-1">Updating roster...</div>
          )}

          {/* EMPTY STATE */}
          {result.creators.length === 0 ? (
            <div data-testid="empty-state-suggestion" className="border border-[#282A24] bg-[#191A17] rounded-xl p-8 text-center space-y-4">
              <h3 className="text-lg font-bold text-[#F3F0E8] font-display">No directors match all active filters</h3>
              <p className="text-[#AAA99F] text-xs max-w-md mx-auto">
                Try removing one or more active filters to widen your director discovery search.
              </p>

              {result.emptyStateSuggestions && result.emptyStateSuggestions.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="font-mono text-xs text-[#AAA99F] block uppercase tracking-wider">Suggested Adjustments:</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.emptyStateSuggestions.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        data-testid="empty-state-suggestion"
                        onClick={() => removeSpecificFilter(suggestion)}
                        className="px-3 py-1.5 rounded bg-[#111210] hover:bg-[#20211D] text-[#F3F0E8] text-xs border border-[#282A24] transition-colors"
                      >
                        Remove {suggestion.label} ({suggestion.count} matches)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button onClick={clearAllFilters} className="btn-secondary text-xs">
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.creators.map((creator) => {
                const cItems = portfolioMap[creator.id] || [];
                const safety = evaluateCreatorSafety(cItems, licenses);

                return (
                  <div
                    key={creator.id}
                    data-testid="creator-card"
                    className="border border-[#1E2536] bg-[#12151D] rounded-2xl p-6 space-y-5 hover:border-[#E5A83B]/50 transition-all duration-200 flex flex-col justify-between shadow-xl hover:shadow-[#E5A83B]/5 group"
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl border border-[#1E2536] overflow-hidden bg-[#1A1E29] flex-shrink-0 shadow-md group-hover:border-[#E5A83B]/40 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={creator.avatar_url}
                              alt={creator.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              href={`/creators/${creator.id}`}
                              className="font-bold text-[#F8FAFC] hover:text-[#E5A83B] transition-colors text-base block leading-snug"
                            >
                              {creator.name}
                            </Link>
                            <p className="text-[#94A3B8] text-xs line-clamp-1 mt-0.5">{creator.headline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <VerificationBadge level={creator.verification_level || "self_declared"} />
                        <SafetyBadge status={safety.status} cause={safety.cause} />
                      </div>

                      {/* Specializations & Tools */}
                      <div className="flex flex-wrap items-center gap-1.5 text-meta pt-0.5">
                        {creator.tools.slice(0, 4).map((tool) => (
                          <span
                            key={tool}
                            className="bg-[#0B0D11] border border-[#E5A83B]/25 text-[#E5A83B] px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
                          >
                            {tool}
                          </span>
                        ))}
                        {creator.tools.length > 4 && (
                          <span className="text-[#64748B] text-[10px] font-mono font-bold">+{creator.tools.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* 3-frame thumbnail strip at true aspect ratios */}
                    <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#1E2536] mt-2">
                      {cItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-lg overflow-hidden border border-[#1E2536] group-hover:border-[#E5A83B]/30 transition-colors shadow-inner">
                          <PortfolioFrame
                            mediaUrl={item.media_url}
                            altText={item.alt_text}
                            aspectRatio={item.aspect_ratio}
                            mediaType={item.media_type}
                          />
                        </div>
                      ))}
                      {cItems.length === 0 && (
                        <div className="col-span-3 text-center py-4 font-mono text-xs text-[#64748B] bg-[#0B0D11] rounded-lg border border-[#1E2536]">
                          No portfolio work uploaded yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
