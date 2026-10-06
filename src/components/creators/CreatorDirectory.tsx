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
    <div className="space-y-6 text-xs text-slate-300">
      {/* Search Input */}
      <div className="space-y-1.5" data-testid="filter-group">
        <label className="font-mono text-amber-300 uppercase tracking-wider text-[10px] block font-semibold">Search Roster</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search directors, tools, skills..."
            className="w-full bg-[#0C0D12] border border-amber-500/20 rounded-lg px-3 py-2 pl-8 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#E2B857]"
          />
          <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
          <span>Verified directors only</span>
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={() => toggleBooleanFilter("verifiedOnly")}
            className="accent-[#E2B857] rounded"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
          <span>Safe for paid ads</span>
          <input
            type="checkbox"
            checked={Boolean(filters.safeForPaidAds)}
            onChange={() => toggleBooleanFilter("safeForPaidAds")}
            className="accent-[#E2B857] rounded"
          />
        </label>
      </div>

      {/* Specialization */}
      <div className="space-y-1.5 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <span className="font-mono text-amber-300 text-[10px] uppercase tracking-wider block font-semibold">Specialization</span>
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {SPECIALIZATIONS.map((spec) => {
            const count = result.facets.specializations[spec] || 0;
            const checked = filters.specialization?.includes(spec);
            return (
              <label
                key={spec}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                  checked ? "bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("specialization", spec)}
                    className="accent-[#E2B857] rounded"
                  />
                  <span>{spec}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-1.5 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <span className="font-mono text-amber-300 text-[10px] uppercase tracking-wider block font-semibold">Generative Tools</span>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {TOOLS.map((t) => {
            const count = result.facets.tools[t] || 0;
            const checked = filters.tools?.includes(t);
            return (
              <label
                key={t}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                  checked ? "bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("tools", t)}
                    className="accent-[#E2B857] rounded"
                  />
                  <span>{t}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Content Type */}
      <div className="space-y-1.5 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <span className="font-mono text-amber-300 text-[10px] uppercase tracking-wider block font-semibold">Deliverable Type</span>
        <div className="space-y-1">
          {CONTENT_TYPES.map((ct) => {
            const count = result.facets.content_types[ct] || 0;
            const checked = filters.content_types?.includes(ct);
            return (
              <label
                key={ct}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                  checked ? "bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={() => toggleArrayFilter("content_types", ct)}
                    className="accent-[#E2B857] rounded"
                  />
                  <span>{ct}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Formats */}
      <div className="space-y-1.5 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <span className="font-mono text-amber-300 text-[10px] uppercase tracking-wider block font-semibold">Aspect Ratio</span>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((f) => {
            const checked = filters.formats?.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleArrayFilter("formats", f)}
                className={`px-2 py-0.5 rounded border text-xs font-mono transition-colors ${
                  checked
                    ? "border-amber-500/50 text-amber-300 bg-amber-500/15 font-semibold"
                    : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Tags */}
      <div className="space-y-1.5 pt-3 border-t border-amber-500/15" data-testid="filter-group">
        <span className="font-mono text-amber-300 text-[10px] uppercase tracking-wider block font-semibold">Visual Aesthetics</span>
        <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
          {STYLE_TAGS.map((st) => {
            const checked = filters.style_tags?.includes(st);
            return (
              <button
                key={st}
                onClick={() => toggleArrayFilter("style_tags", st)}
                className={`px-2 py-0.5 rounded border text-[11px] transition-colors ${
                  checked
                    ? "border-amber-500/50 text-amber-300 bg-amber-500/15 font-semibold"
                    : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
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
    <div className="space-y-8 py-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-500/15 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Creator Roster</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified AI filmmakers, 3D animators, and prompt directors with audited workflow proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="sm:hidden px-3.5 py-1.5 rounded-lg bg-[#151620] border border-amber-500/25 text-amber-300 gap-2 text-xs flex items-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Sort:</span>
            <select
              suppressHydrationWarning
              value={filters.sort || "relevance"}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-[#151620] border border-amber-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#E2B857]"
            >
              <option value="relevance">Relevance</option>
              <option value="most_verified">Highest Verification</option>
              <option value="most_portfolio">Most Work Samples</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-500">Active filters:</span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs border border-amber-500/30 text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => {
                  if (chip.key === "search") handleSearchChange("");
                  else if (chip.key === "verifiedOnly" || chip.key === "safeForPaidAds")
                    toggleBooleanFilter(chip.key);
                  else toggleArrayFilter(chip.key, chip.value);
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="font-mono text-xs text-slate-400 hover:text-white underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Directory Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Desktop */}
        <aside className="hidden sm:block sm:col-span-4 lg:col-span-3 border-r border-amber-500/15 pr-6 sticky top-20">
          {renderFilterSidebar()}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileDrawerOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
            <div className="w-4/5 max-w-sm bg-[#0C0D12] h-full p-6 overflow-y-auto space-y-4 border-l border-amber-500/20">
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
                <span className="font-semibold text-lg text-white">Filter Roster</span>
                <button onClick={() => setMobileDrawerOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              {renderFilterSidebar()}
            </div>
          </div>
        )}

        {/* Right Main Grid */}
        <main className="sm:col-span-8 lg:col-span-9 space-y-6">
          {isPending && (
            <div className="font-mono text-xs text-amber-300 py-2">Updating roster results...</div>
          )}

          {/* EMPTY STATE */}
          {result.creators.length === 0 ? (
            <div data-testid="empty-state-suggestion" className="border border-amber-500/20 bg-[#151620] rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-white font-display">No directors match all active filters</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Try removing one or more active filters to widen your director discovery search.
              </p>

              {result.emptyStateSuggestions && result.emptyStateSuggestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="font-mono text-xs text-amber-300/80 block uppercase tracking-wider">Suggested Adjustments:</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.emptyStateSuggestions.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        data-testid="empty-state-suggestion"
                        onClick={() => removeSpecificFilter(suggestion)}
                        className="px-3 py-1.5 rounded-lg bg-[#0C0D12] hover:bg-amber-500/10 text-amber-300 text-xs border border-amber-500/25"
                      >
                        Remove {suggestion.label} ({suggestion.count} matches)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button onClick={clearAllFilters} className="btn-primary text-xs">
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
                    className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-4 hover:border-amber-500/40 hover:bg-[#1A1B2A] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl border border-amber-500/30 overflow-hidden bg-slate-800 flex-shrink-0 ring-2 ring-amber-500/20">
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
                              className="font-semibold text-white hover:text-[#E2B857] transition-colors text-base block leading-snug"
                            >
                              {creator.name}
                            </Link>
                            <p className="text-slate-400 text-xs line-clamp-1">{creator.headline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <VerificationBadge level={creator.verification_level || "self_declared"} />
                        <SafetyBadge status={safety.status} cause={safety.cause} />
                      </div>

                      {/* Specializations & Tools */}
                      <div className="flex flex-wrap items-center gap-1.5 text-meta pt-1">
                        {creator.tools.slice(0, 4).map((tool) => (
                          <span
                            key={tool}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono"
                          >
                            {tool}
                          </span>
                        ))}
                        {creator.tools.length > 4 && (
                          <span className="text-slate-400 text-[10px] font-mono">+{creator.tools.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* 3-frame thumbnail strip at true aspect ratios */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-3">
                      {cItems.slice(0, 3).map((item) => (
                        <PortfolioFrame
                          key={item.id}
                          mediaUrl={item.media_url}
                          altText={item.alt_text}
                          aspectRatio={item.aspect_ratio}
                          mediaType={item.media_type}
                        />
                      ))}
                      {cItems.length === 0 && (
                        <div className="col-span-3 text-center py-4 font-mono text-xs text-slate-500 bg-[#0C0D12] rounded-lg border border-slate-800">
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
