import { useEffect, useMemo, useState } from 'react';
import { useMenuStore, type MenuItem } from './store/useMenuStore';
import { cn } from './lib/utils';
import { AlertTriangle, BookOpen, Search, X } from 'lucide-react';

const SAUCE_CODES = new Set(['VSM', 'CRCP', 'BRM']);

const ENTREE_SUBS: { label: string; match: (item: MenuItem) => boolean }[] = [
  { label: 'Chicken', match: i => /^C/i.test(i.code) && !SAUCE_CODES.has(i.code) },
  { label: 'Beef',    match: i => /^B/i.test(i.code) && !SAUCE_CODES.has(i.code) },
  { label: 'Seafood', match: i => /^F/i.test(i.code) && !SAUCE_CODES.has(i.code) },
];

const TOP_CATEGORIES: { label: string; match: (item: MenuItem) => boolean }[] = [
  { label: 'Appetizers',     match: i => /^E/i.test(i.code) },
  { label: 'Sides',          match: i => /^[MRV]/i.test(i.code) && i.code !== 'VSM' },
  { label: 'Cooking Sauces', match: i => /^S/i.test(i.code) || SAUCE_CODES.has(i.code) },
];

const isEntree = (i: MenuItem) => ENTREE_SUBS.some(s => s.match(i));
const isKnown  = (i: MenuItem) => isEntree(i) || TOP_CATEGORIES.some(s => s.match(i));

const COLOR_MAP: Record<string, string> = {
  red:    'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  green:  'bg-green-50 border-green-200 text-green-700',
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  pink:   'bg-pink-50 border-pink-200 text-pink-700',
  sky:    'bg-sky-50 border-sky-200 text-sky-700',
  teal:   'bg-teal-50 border-teal-200 text-teal-700',
  amber:  'bg-amber-50 border-amber-200 text-amber-700',
};

export default function RecipeBook() {
  const { items: allItems, fetchAll, loading, error } = useMenuStore();
  const [search, setSearch] = useState('');
  const [excludedAllergens, setExcludedAllergens] = useState<Set<string>>(new Set());

  useEffect(() => { fetchAll(); }, []);

  const allAllergens = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach(i => i.allergens?.forEach(a => set.add(a)));
    return [...set].sort();
  }, [allItems]);

  const toggleAllergen = (allergen: string) => {
    setExcludedAllergens(prev => {
      const next = new Set(prev);
      next.has(allergen) ? next.delete(allergen) : next.add(allergen);
      return next;
    });
  };

  const q = search.trim().toLowerCase();

  const filtered = allItems.filter(i => {
    if (excludedAllergens.size > 0 && i.allergens?.some(a => excludedAllergens.has(a))) return false;
    if (!q) return true;
    return (
      i.title.toLowerCase().includes(q) ||
      i.code.toLowerCase().includes(q) ||
      i.ingredients?.some(ing => ing.toLowerCase().includes(q))
    );
  });

  const entreeSubs = ENTREE_SUBS.map(s => ({
    label: s.label,
    items: filtered.filter(s.match),
  })).filter(g => g.items.length > 0);

  const topCats = TOP_CATEGORIES.map(cat => ({
    label: cat.label,
    items: filtered.filter(cat.match),
  })).filter(g => g.items.length > 0);

  const otherItems = filtered.filter(i => !isKnown(i));

  function openItem(item: MenuItem) {
    window.location.href = `/recipes/${item.code}`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-widest text-slate-900 leading-none">Recipe Book</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{allItems.length} items</p>
            </div>
          </div>

          <div className="ml-auto relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, code, ingredient…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {allAllergens.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Exclude allergen:</span>
            {allAllergens.map(a => {
              const active = excludedAllergens.has(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={cn(
                    'px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all',
                    active
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500'
                  )}
                >
                  {active && <span className="mr-1">✕</span>}{a}
                </button>
              );
            })}
            {excludedAllergens.size > 0 && (
              <button
                onClick={() => setExcludedAllergens(new Set())}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 ml-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">
        {loading && allItems.length === 0 && (
          <div className="flex items-center justify-center py-32 text-slate-400 text-sm font-bold uppercase tracking-widest">Loading…</div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex items-center justify-center py-32 text-slate-400 text-sm font-bold uppercase tracking-widest">No items found</div>
        )}

        {entreeSubs.length > 0 && (
          <section>
            <SectionHeader label="Entrées" />
            <div className="space-y-10 mt-6">
              {entreeSubs.map(({ label, items }) => (
                <div key={label}>
                  <SubHeader label={label} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                    {items.map(item => (
                      <ItemCard key={item.id} item={item} onClick={() => openItem(item)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {topCats.map(({ label, items }) => (
          <section key={label}>
            <SectionHeader label={label} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {items.map(item => (
                <ItemCard key={item.id} item={item} onClick={() => openItem(item)} />
              ))}
            </div>
          </section>
        ))}

        {otherItems.length > 0 && (
          <section>
            <SectionHeader label="Other" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {otherItems.map(item => (
                <ItemCard key={item.id} item={item} onClick={() => openItem(item)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-base font-black uppercase tracking-widest text-slate-800 whitespace-nowrap">{label}</h2>
      <div className="h-px grow bg-slate-200" />
    </div>
  );
}

function SubHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">{label}</h3>
      <div className="h-px grow bg-slate-100" />
    </div>
  );
}

function ItemCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const colorClass = COLOR_MAP[item.color] ?? 'bg-slate-50 border-slate-200 text-slate-700';
  const hasRecipe = !!item.recipe;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-[24px] border overflow-hidden transition-all duration-300 flex flex-col',
        'hover:shadow-xl hover:-translate-y-0.5',
        'bg-white border-slate-200',
        !hasRecipe && 'opacity-60'
      )}
    >
      <div className="h-40 shrink-0 bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/cbd5e1?text=No+Image'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <BookOpen className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <span className={cn('inline-block px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest', colorClass)}>
          {item.code}
        </span>
        <p className="text-xs font-black text-slate-800 leading-tight uppercase tracking-tight line-clamp-2">
          {item.title}
        </p>
        {!hasRecipe && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">No recipe</p>
        )}
      </div>
    </button>
  );
}
