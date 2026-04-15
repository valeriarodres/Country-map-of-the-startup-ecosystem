import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Globe, Linkedin, Filter, Loader2, ExternalLink, Building2, Rocket, Trophy, Download } from 'lucide-react';
import { searchPrograms } from './services/geminiService';
import { Program, ProgramType } from './types';

export default function App() {
  const [country, setCountry] = useState('');
  const [type, setType] = useState<ProgramType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchPrograms(country, type);
      setPrograms(results);
    } catch (err) {
      setError('Failed to fetch programs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (programs.length === 0) return;

    const headers = ['Name', 'Type', 'Verticals', 'Batch Name', 'City', 'Website', 'LinkedIn', 'Description', 'Notable Alumni'];
    const csvRows = [
      headers.join(','),
      ...programs.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        p.type,
        `"${p.verticals.join('; ').replace(/"/g, '""')}"`,
        `"${p.batchName.replace(/"/g, '""')}"`,
        `"${p.city.replace(/"/g, '""')}"`,
        p.website,
        p.linkedin,
        `"${p.description.replace(/"/g, '""')}"`,
        `"${p.previousStartups.join('; ').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `startup_programs_${country.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeIcon = (type: ProgramType) => {
    switch (type) {
      case 'incubator': return <Building2 className="w-4 h-4" />;
      case 'accelerator': return <Rocket className="w-4 h-4" />;
      case 'award': return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4"
        >
          Startup Program Finder
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-lg max-w-2xl mx-auto"
        >
          Discover the best incubators, accelerators, and awards for your startup across the globe.
        </motion.p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSearch}
        className="bg-white p-6 rounded-[20px] border border-[--color-bento-border] mb-12 flex flex-col md:flex-row gap-4 items-end shadow-sm"
      >
        <div className="flex-1 w-full space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[--color-bento-text-muted] ml-1">Country</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Germany, USA, Brazil..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-[--color-bento-border] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[--color-bento-text-muted] ml-1">Program Type</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProgramType | 'all')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[--color-bento-border] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none text-sm font-medium"
            >
              <option value="all">All Programs</option>
              <option value="incubator">Incubators</option>
              <option value="accelerator">Accelerators</option>
              <option value="award">Awards</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !country.trim()}
          className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search
        </button>
      </motion.form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center mb-8"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-zinc-500 font-medium animate-pulse">Searching for opportunities in {country}...</p>
          </motion.div>
        ) : (
          <div key="results" className="space-y-12">
            {programs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center mb-6"
              >
                <p className="text-sm font-medium text-zinc-500">
                  Showing {programs.length} programs in {country}
                </p>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </motion.div>
            )}
            {programs.map((program, idx) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-5"
              >
                {/* Main Info Card */}
                <div className="bento-card md:col-span-2 md:row-span-2 justify-center">
                  <span className="type-pill">{program.type}</span>
                  <h2 className="text-4xl font-extrabold text-indigo-600 leading-tight mb-2">{program.name}</h2>
                  <p className="text-[--color-bento-text-muted] text-base leading-relaxed">{program.description}</p>
                </div>

                {/* Vertical Card */}
                <div className="bento-card">
                  <span className="bento-title">Vertical</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {program.verticals.map((v, i) => (
                      <span key={v} className="tag-pill" style={i % 2 === 1 ? { background: '#ecfdf5', color: '#059669' } : {}}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* City Card */}
                <div className="bento-card">
                  <span className="bento-title">Location</span>
                  <div className="text-2xl font-bold mt-1">{program.city}</div>
                  <div className="text-[--color-bento-text-muted] text-sm mt-1">{country}</div>
                </div>

                {/* Batch Details */}
                <div className="bento-card md:col-span-2">
                  <span className="bento-title">Current Batch</span>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xl font-semibold">{program.batchName}</div>
                    <div className="text-sm font-medium text-[--color-bento-accent]">{program.dates}</div>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full mt-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-3/4 bg-indigo-600 rounded-full" />
                  </div>
                </div>

                {/* Startups List */}
                <div className="bento-card md:col-span-3">
                  <span className="bento-title">Notable Alumni</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {program.previousStartups.map(s => (
                      <div key={s} className="bg-zinc-50 p-3 rounded-xl text-sm font-medium border border-[--color-bento-border]">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links Card */}
                <div className="bento-card">
                  <span className="bento-title">Resources</span>
                  <div className="flex flex-col gap-3 mt-1">
                    <a href={program.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-[--color-bento-text-main] hover:text-indigo-600 transition-colors group">
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      {program.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                    <a href={program.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-[--color-bento-text-main] hover:text-indigo-600 transition-colors group">
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      LinkedIn Page
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && programs.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No programs found yet</h3>
            <p className="text-zinc-500">Enter a country above to start your search.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-8 border-t border-zinc-200 text-center text-zinc-400 text-sm">
        <p>© {new Date().getFullYear()} Startup Program Finder. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
}

