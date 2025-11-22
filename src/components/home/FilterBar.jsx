import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Spain", "Italy", "Japan", "South Korea", "China", "India", "Brazil", "Mexico",
  "Argentina", "Russia", "Netherlands", "Sweden", "Norway", "Denmark", "Poland"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian",
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Turkish", "Dutch", "Swedish"
];

const ETHNICITIES = ["Asian", "Latino", "Arab", "European", "Americas", "Oceania", "African"];

const GOALS = ["Language Exchange", "Make New Friends", "Open to All Possibilities"];

export default function FilterBar({ filters, setFilters, categories }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-white" />
        <span className="font-semibold text-white">Filters:</span>
      </div>

      <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
        <SelectTrigger className="w-32 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genders</SelectItem>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
        <SelectTrigger className="w-36 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Countries</SelectItem>
          {COUNTRIES.map(country => (
            <SelectItem key={country} value={country}>{country}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
        <SelectTrigger className="w-36 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Languages</SelectItem>
          {LANGUAGES.map(lang => (
            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.ethnicity} onValueChange={(value) => setFilters({...filters, ethnicity: value})}>
        <SelectTrigger className="w-36 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Ethnicity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ethnicities</SelectItem>
          {ETHNICITIES.map(eth => (
            <SelectItem key={eth} value={eth}>{eth}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
        <SelectTrigger className="w-40 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.goal} onValueChange={(value) => setFilters({...filters, goal: value})}>
        <SelectTrigger className="w-44 bg-white bg-opacity-90 backdrop-blur-sm border-0">
          <SelectValue placeholder="Goal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Goals</SelectItem>
          {GOALS.map(goal => (
            <SelectItem key={goal} value={goal}>{goal}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.gender !== 'all' || filters.country || filters.language || 
        filters.ethnicity !== 'all' || filters.category !== 'all' || filters.goal !== 'all') && (
        <button
          onClick={() => setFilters({
            gender: 'all', country: '', language: '', 
            ethnicity: 'all', category: 'all', goal: 'all'
          })}
          className="text-sm underline text-white font-semibold hover:text-gray-200"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}