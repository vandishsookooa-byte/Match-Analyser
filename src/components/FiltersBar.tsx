import React from 'react';
import { TierCategory, SortField, SortDirection, DiscoveredCompetition } from '../types/football';
import { Search, Globe, Filter, ArrowUpDown, Layers, Calendar } from 'lucide-react';

interface FiltersBarProps {
  countries: string[];
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
  selectedTier: TierCategory;
  onSelectTier: (tier: TierCategory) => void;
  competitions: DiscoveredCompetition[];
  selectedCompetitionId: string;
  onSelectCompetitionId: (id: string) => void;
  seasons: string[];
  selectedSeason: string;
  onSelectSeason: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onResetFilters: () => void;
  totalFilteredTeams: number;
}

const TIER_CATEGORIES: TierCategory[] = [
  'All',
  'First Division',
  'Second Division',
  'Third Division & Lower',
  'Continental',
  'National Teams',
  'Youth Football'
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  countries,
  selectedCountry,
  onSelectCountry,
  selectedTier,
  onSelectTier,
  competitions,
  selectedCompetitionId,
  onSelectCompetitionId,
  seasons,
  selectedSeason,
  onSelectSeason,
  searchQuery,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortChange,
  onResetFilters,
  totalFilteredTeams,
}) => {
  const isFiltered =
    selectedCountry !== 'All' ||
    selectedTier !== 'All' ||
    selectedCompetitionId !== 'All' ||
    selectedSeason !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      {/* Top Filter Row: Tier Segmented Controls & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Tier / Division Segmented Buttons (Functional interactive buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {TIER_CATEGORIES.map((tier) => {
            const isActive = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => {
                  onSelectTier(tier);
                  if (selectedCompetitionId !== 'All') {
                    onSelectCompetitionId('All');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tier === 'All' ? 'All Divisions' : tier}
              </button>
            );
          })}
        </div>

        {/* Search Input for team, league, or country */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search team, league, country..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Bottom Filter Row: Country, Competition, Season & Sort dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Country Selector */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => {
                onSelectCountry(e.target.value);
                if (selectedCompetitionId !== 'All') {
                  onSelectCompetitionId('All');
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="All">All Countries ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Competition Selector */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Competition:</span>
            <select
              value={selectedCompetitionId}
              onChange={(e) => onSelectCompetitionId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium max-w-[210px] truncate"
            >
              <option value="All">All Competitions ({competitions.length})</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.country}: {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Selector */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => onSelectSeason(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="All">All Seasons</option>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer pl-1 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Controls & Count */}
        <div className="flex items-center gap-3">
          <div className="text-slate-500 text-[11px] font-mono">
            Ranked: <span className="text-white font-bold">{totalFilteredTeams}</span> team records
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="winPercentage">Win Percentage (Rule #3)</option>
              <option value="goalDifference">Goal Difference</option>
              <option value="goalsFor">Goals Scored (GF)</option>
              <option value="pointsPerMatch">Points Per Match (PPM)</option>
              <option value="points">Total Points</option>
              <option value="matchesPlayed">Matches Played</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
