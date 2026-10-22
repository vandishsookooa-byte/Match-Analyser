import React from 'react';
import { LeagueRegion, SortDirection, SortField } from '../types/sports-data';
import { Search, Globe, Filter, ArrowUpDown } from 'lucide-react';

interface LeagueFilterBarProps {
  availableCompetitions: string[];
  selectedCompetition: string;
  onSelectCompetition: (comp: string) => void;
  selectedRegion: LeagueRegion;
  onSelectRegion: (region: LeagueRegion) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  totalFilteredCount: number;
}

const REGION_OPTIONS: LeagueRegion[] = [
  'All',
  'Top 5 Europe',
  'Continental Cups',
  'Americas',
  'Other Europe',
  'Asia & Middle East',
  'Second Tiers'
];

export const LeagueFilterBar: React.FC<LeagueFilterBarProps> = ({
  availableCompetitions,
  selectedCompetition,
  onSelectCompetition,
  selectedRegion,
  onSelectRegion,
  searchQuery,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortChange,
  totalFilteredCount,
}) => {
  return (
    <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      {/* Top Filter Row: Region Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Region Segmented Controls (Interactive Functional Buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {REGION_OPTIONS.map((region) => {
            const isActive = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => {
                  onSelectRegion(region);
                  if (selectedCompetition !== 'All') {
                    onSelectCompetition('All');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {region === 'All' ? 'Global (All)' : region}
              </button>
            );
          })}
        </div>

        {/* Search Input for fixture or team */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search team or league..."
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

      {/* Bottom Filter Row: Specific League Dropdown & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
        {/* Specific Competition Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>League:</span>
          </div>
          <select
            value={selectedCompetition}
            onChange={(e) => onSelectCompetition(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
          >
            <option value="All">All Leagues Available ({availableCompetitions.length})</option>
            {availableCompetitions.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>

          {/* Quick Clear Filter if active */}
          {(selectedCompetition !== 'All' || selectedRegion !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                onSelectCompetition('All');
                onSelectRegion('All');
                onSearchChange('');
              }}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer pl-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Field & Active Match Count */}
        <div className="flex items-center gap-3">
          <div className="text-slate-500 text-[11px] font-mono">
            Showing <span className="text-slate-200 font-bold">{totalFilteredCount}</span> fixtures
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="favoriteEdge">Highest Favorite npxGD (Rule #3)</option>
              <option value="winExpectancy">Win Expectancy %</option>
              <option value="fieldTilt">Field Tilt Dominance</option>
              <option value="totalXg">Total Combined xG</option>
              <option value="date">Fixture Date</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
