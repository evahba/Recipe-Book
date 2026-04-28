import React, { useEffect, useState } from 'react';
import { useMenuStore, type MenuItem, type RecipeData } from './store/useMenuStore';
import { cn } from './lib/utils';
import { ArrowLeft, Book, Thermometer, CheckCircle2, XCircle, Timer } from 'lucide-react';

const SAUCE_CODES = new Set(['VSM', 'CRCP', 'BRM']);
const isSauce = (code: string) => /^S/i.test(code) || SAUCE_CODES.has(code);

export default function RecipePage({ code }: { code: string }) {
  const { items: allItems, fetchAll } = useMenuStore();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allItems.length === 0) {
      fetchAll().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const found = allItems.find(i => i.code.toLowerCase() === code.toLowerCase());
    if (found) setItem(found);
  }, [allItems, code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Book className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Item not found</p>
        <BackButton />
      </div>
    );
  }

  const recipe = item.recipe as RecipeData | null;
  const batches = recipe ? Object.keys(recipe.servingsPerBatch || {}).sort((a, b) => {
    if (a === '1/2') return -1; if (b === '1/2') return 1;
    if (a === 'C' || a === 'Catering') return 1; if (b === 'C' || b === 'Catering') return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  }) : [];

  const allIngredients = recipe?.sections?.flatMap(s => s.ingredients || []) || [];
  const allQuantityKeys = [...new Set(allIngredients.flatMap(ing => Object.keys(ing.quantities || {})))];
  const effectiveBatches = batches.length > 0 ? batches : allQuantityKeys;

  const filteredIngredients = allIngredients.filter(ing => {
    if (!ing.quantities) return true;
    const vals = Object.values(ing.quantities || {});
    return vals.length > 0 && vals.some(q => q !== '-' && q !== '' && q !== '0' && q !== null);
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <BackButton />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Book className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 leading-none">{item.title}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{item.code}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {item.imageUrl && (
            <div className="w-full sm:w-56 shrink-0 aspect-square rounded-[32px] overflow-hidden bg-slate-100 shadow-lg">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/cbd5e1?text=No+Image'; }}
              />
            </div>
          )}
          <div className="space-y-4 grow">
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{item.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Pill label={item.code} />

            </div>
            {item.ingredients && item.ingredients.length > 0 && (
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.ingredients.join(' · ')}</p>
            )}
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">⚠ Allergens:</span>
                {item.allergens.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-[10px] font-black uppercase tracking-widest text-red-700">{a}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {!recipe && (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-black uppercase tracking-widest">
            No recipe data available for this item
          </div>
        )}

        {recipe && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {!isSauce(item.code) && <StatCard icon={<Thermometer className="w-5 h-5 text-emerald-500" />} value={`${recipe.cookTempF || '--'}°F`} label="Cook Temp" />}
              {!isSauce(item.code) && <StatCard icon={<Thermometer className="w-5 h-5 text-amber-500" />} value={`${recipe.holdTempF || '--'}°F`} label="Hold Temp" />}
              {effectiveBatches.map(b => {
                const servings = recipe.servingsPerBatch?.[b];
                if (!servings) return null;
                const batchLabel = b === 'C' || b === 'Catering' ? 'Catering' : `Batch ${b}`;
                return (
                  <StatCard
                    key={b}
                    icon={<span className="text-[11px] font-black text-purple-500 uppercase tracking-widest">{batchLabel}</span>}
                    value={String(servings)}
                    label="Portions"
                  />
                );
              })}
            </div>

            {/* Ingredients */}
            <section className="space-y-5">
              <SectionDivider label="Ingredients" color="blue" />
              {recipe.sections && recipe.sections.length > 1 && recipe.sections.some(s => s.name) ? (
                <div className="space-y-8">
                  {recipe.sections.map((section, sIdx) => {
                    const sIngredients = (section.ingredients || []).filter(ing => {
                      if (!ing.quantities) return true;
                      const vals = Object.values(ing.quantities || {});
                      return vals.length > 0 && vals.some(q => q !== '-' && q !== '' && q !== '0' && q !== null);
                    });
                    if (sIngredients.length === 0) return null;
                    const sQtyKeys = [...new Set(sIngredients.flatMap(ing => Object.keys(ing.quantities || {})))];
                    const sBatches = batches.length > 0 ? batches.filter(b => sIngredients.some(ing => ing.quantities?.[b])) : sQtyKeys;
                    const sSteps = (recipe.steps || []).filter(s => s.section === section.name);
                    return (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">{sIdx + 1}</span>
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">{section.name}</h4>
                        </div>
                        <div className={cn('flex flex-col gap-6', sSteps.length > 0 ? 'lg:flex-row lg:items-start' : '')}>
                          <div className="rounded-[32px] border border-slate-200 bg-white overflow-x-auto shadow-sm lg:flex-1">
                            <table className="min-w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50">
                                  <th className="sticky left-0 bg-slate-50 p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">Ingredient</th>
                                  {sBatches.map(b => (
                                    <th key={b} className="p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      {b === 'C' || b === 'Catering' ? 'Catering' : b === 'Default' ? 'Amount' : `Batch ${b}`}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {sIngredients.map((ing, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="sticky left-0 bg-white p-5 z-10">
                                      <div className="text-xs font-bold text-slate-700 whitespace-nowrap">{ing.name}</div>
                                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{ing.unit}</div>
                                    </td>
                                    {sBatches.map(b => (
                                      <td key={b} className="p-5 text-center font-mono text-xs text-slate-500">
                                        {ing.quantities?.[b] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {sSteps.length > 0 && (
                            <div className="lg:w-72 shrink-0 p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Directions</div>
                              <ol className="space-y-3">
                                {sSteps.map((step, i) => (
                                  <li key={i} className="flex gap-3">
                                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black mt-0.5">{step.n}</span>
                                    <span className="text-xs text-slate-600 leading-relaxed">{step.text}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[32px] border border-slate-200 bg-white overflow-x-auto shadow-sm">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="sticky left-0 bg-slate-50 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">Ingredient</th>
                        {effectiveBatches.map(b => (
                          <th key={b} className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {b === 'C' || b === 'Catering' ? 'Catering' : b === 'Default' ? 'Amount' : `Batch ${b}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIngredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="sticky left-0 bg-white p-6 z-10">
                            <div className="text-xs font-bold text-slate-700 whitespace-nowrap">{ing.name}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{ing.unit}</div>
                          </td>
                          {effectiveBatches.map(b => (
                            <td key={b} className="p-6 text-center font-mono text-xs text-slate-500">
                              {ing.quantities?.[b] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Execution Steps */}
            {recipe.steps && recipe.steps.length > 0 && !(recipe.sections && recipe.sections.length > 1 && recipe.sections.some(s => s.name)) && (
              <section className="space-y-6">
                <SectionDivider label="Execution Steps" color="blue" />
                <div className="relative pl-12 space-y-3">
                  <div className="absolute left-[15.5px] top-2 bottom-2 w-[1px] bg-slate-100" />
                  {recipe.steps.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all duration-300">
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 font-mono">{step.n}</span>
                      </div>
                      <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:translate-x-1">
                        <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Best Practices */}
            {recipe.bestPractices && recipe.bestPractices.length > 0 && (
              <section className="space-y-6">
                <SectionDivider label="Best Practices" color="blue" />
                <div className={cn('grid grid-cols-2 gap-4', recipe.bestPractices.length >= 6 ? 'md:grid-cols-3' : 'md:grid-cols-4')}>
                  {recipe.bestPractices.map((bp, i) => (
                    <div key={i} className="group relative bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all duration-500">
                      <div className="bg-white overflow-hidden">
                        <img src={bp.imageUrl} alt={`Step ${bp.n}`} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/f8fafc/cbd5e1?text=No+Image'; }} />
                        {bp.badge && (
                          <div className={cn('absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border-2 border-white z-20', bp.badge.color === 'red' ? 'bg-red-600' : 'bg-blue-600')}>
                            {bp.badge.icon === 'time' ? <Timer className="w-3 h-3 text-white" /> : <Thermometer className="w-3 h-3 text-white" />}
                            <span className="text-[10px] font-black text-white whitespace-nowrap">{bp.badge.text}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 relative">
                        <div className="absolute -top-6 right-6 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white">{bp.n}</div>
                        <p className="text-[11px] font-bold text-slate-600 leading-tight uppercase tracking-tight">{bp.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quality Checks */}
            {recipe.qualityChecks && recipe.qualityChecks.length > 0 && (
              <section className="space-y-6">
                <SectionDivider label="Quality Checks" color="red" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recipe.qualityChecks.map((qc, i) => (
                    <div key={i} className="group flex flex-col bg-white border border-slate-100 rounded-[32px] overflow-hidden hover:border-red-100 hover:shadow-xl transition-all duration-500">
                      <div className="aspect-[4/3] bg-slate-50 overflow-hidden">
                        <img src={qc.imageUrl} alt={qc.title || `Check ${qc.n}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/fef2f2/fecaca?text=No+Image'; }} />
                      </div>
                      <div className="p-6 space-y-2">
                        {qc.title && <h4 className="text-sm font-black text-red-600 leading-tight uppercase tracking-tight">{qc.title}</h4>}
                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{qc.text}</p>
                        {qc.why && <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-tight"><span className="font-black text-slate-900">Why?</span> {qc.why}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comparisons */}
            {recipe.comparisons && recipe.comparisons.length > 0 && (
              <section className="space-y-6">
                <SectionDivider label="Quality Check" color="red" />
                {recipe.comparisons.map((comparison, idx) => {
                  const hasText = comparison.points && comparison.points.length > 0;
                  return (
                    <div key={idx} className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm flex flex-col md:flex-row">
                      {hasText && (
                        <div className="w-full md:w-[35%] p-8 bg-white border-r border-slate-50 flex flex-col justify-center space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-lg font-black text-red-900 leading-tight uppercase tracking-tighter">{comparison.title}</h4>
                            <p className="text-xs font-medium text-slate-500 italic">{comparison.subtitle}</p>
                          </div>
                          <ul className="space-y-3">
                            {comparison.points.map((point, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />{point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col border-r border-slate-100">
                        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                          <img src={comparison.good.imageUrl} alt="Good Example" className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          </div>
                          {comparison.good.highlights?.map((hl, i) => (
                            <div key={i} className="absolute z-10" style={{ top: `${hl.y}%`, left: `${hl.x}%` }}>
                              <div className={cn('relative flex items-center', hl.x > 50 ? 'flex-row-reverse -translate-x-full' : 'flex-row')}>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-lg" />
                                <div className="w-4 h-px bg-emerald-500/50" />
                                <div className="px-2 py-1 bg-emerald-500 text-[9px] font-black text-white uppercase whitespace-nowrap rounded-md shadow-lg border border-white/20">{hl.text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-emerald-500 py-2.5 px-5 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                          <span className="text-xs font-black text-white tracking-[0.3em] uppercase">{comparison.good.label}</span>
                        </div>
                        {comparison.good.points && comparison.good.points.length > 0 && (
                          <div className="py-3 px-5 bg-white">
                            <ul className="space-y-1">
                              {comparison.good.points.map((p, i) => (
                                <li key={i} className="text-[10px] font-medium text-slate-600 flex items-start gap-1.5 uppercase tracking-tight">
                                  <span className="mt-0.5 text-emerald-400">•</span>{p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                          <img src={comparison.bad.imageUrl} alt="Bad Example" className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                              <XCircle className="w-6 h-6" />
                            </div>
                          </div>
                          {comparison.bad.highlights?.map((hl, i) => (
                            <div key={i} className="absolute z-10" style={{ top: `${hl.y}%`, left: `${hl.x}%` }}>
                              <div className={cn('relative flex items-center', hl.x > 50 ? 'flex-row-reverse -translate-x-full' : 'flex-row')}>
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow-lg" />
                                <div className="w-4 h-px bg-red-500/50" />
                                <div className="px-2 py-1 bg-red-500 text-[9px] font-black text-white uppercase whitespace-nowrap rounded-md shadow-lg border border-white/20">{hl.text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-red-600 py-2.5 px-5 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-white shrink-0" />
                          <span className="text-xs font-black text-white tracking-[0.3em] uppercase">{comparison.bad.label}</span>
                        </div>
                        {comparison.bad.points && comparison.bad.points.length > 0 && (
                          <div className="py-3 px-5 bg-white">
                            <ul className="space-y-1">
                              {comparison.bad.points.map((p, i) => (
                                <li key={i} className="text-[10px] font-medium text-slate-600 flex items-start gap-1.5 uppercase tracking-tight">
                                  <span className="mt-0.5 text-red-400">•</span>{p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Execution Issues */}
            {(recipe.executionOverview || (recipe.executionIssues && recipe.executionIssues.length > 0)) && (
              <section className="space-y-6">
                <SectionDivider label="Execution Issues" color="red" />
                {recipe.executionOverview && (
                  <div className="relative rounded-[32px] overflow-hidden border border-slate-100 bg-white shadow-sm">
                    <div className="aspect-video md:aspect-[16/7] bg-slate-50">
                      <img src={recipe.executionOverview.imageUrl} alt="Execution Issues Overview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-6 right-6 max-w-[40%] bg-white/95 backdrop-blur-sm p-6 rounded-[24px] shadow-2xl border border-white/20">
                      <h4 className="text-sm font-black text-red-600 uppercase tracking-wider mb-3">{recipe.executionOverview.title}</h4>
                      <ul className="space-y-2">
                        {recipe.executionOverview.points?.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-slate-800 leading-tight">
                            <span className="text-red-500 mt-0.5">•</span>{point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {recipe.executionIssues && recipe.executionIssues.length > 0 && (
                  <div className={cn('grid grid-cols-1 gap-4', recipe.executionIssues.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
                    {recipe.executionIssues.map((issue, i) => (
                      <div key={i} className="flex flex-col rounded-[24px] overflow-hidden border border-slate-100 bg-white">
                        <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                          <img src={issue.imageUrl} alt={issue.title || `Execution Issue ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                          {issue.title && <p className="text-sm font-black text-slate-900 leading-snug">{issue.title}</p>}
                          {issue.cause && <p className="text-[11px] text-slate-600 leading-relaxed"><span className="font-black text-slate-900">Cause: </span>{issue.cause}</p>}
                          {issue.correctiveAction && <p className="text-[11px] text-slate-600 leading-relaxed"><span className="font-black text-slate-900">Corrective Action: </span>{issue.correctiveAction}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Quality Guide */}
            {recipe.qualityGuide && (
              <section className="space-y-6">
                <SectionDivider label="Quality Standards" color="blue" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QualityCard title="Standard / Target" items={recipe.qualityGuide.standard.items} type="success" />
                  <QualityCard title="Execution Issues" items={recipe.qualityGuide.executionIssues.items} type="error" />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <button
      onClick={() => window.location.href = '/'}
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900 shrink-0"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-[11px] font-black uppercase tracking-widest">Recipes</span>
    </button>
  );
}

function SectionDivider({ label, color }: { label: string; color: 'blue' | 'red' }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className={cn('text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap', color === 'blue' ? 'text-blue-600' : 'text-red-600')}>{label}</h3>
      <div className="h-px grow bg-slate-100" />
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
      <div className="mb-3">{icon}</div>
      <div className="text-xl font-black font-mono text-slate-900">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

function Pill({ label, color = 'slate' }: { label: string; color?: 'slate' | 'red' }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest',
      color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-600'
    )}>{label}</span>
  );
}

function QualityCard({ title, items, type }: { title: string; items: string[]; type: 'success' | 'error' }) {
  return (
    <div className={cn('p-6 rounded-[32px] border', type === 'success' ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30')}>
      <div className={cn('text-[10px] font-black uppercase tracking-widest mb-4', type === 'success' ? 'text-emerald-600' : 'text-red-600')}>{title}</div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-500 flex gap-2">
            <span className={type === 'success' ? 'text-emerald-500' : 'text-red-500'}>{type === 'success' ? '✓' : '!'}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
