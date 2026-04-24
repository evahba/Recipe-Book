import { useState } from 'react';
import { BookOpen } from 'lucide-react';

const KEY = 'rb_unlocked';
const PASSWORD = '1565';

export function isUnlocked(): boolean {
  return localStorage.getItem(KEY) === '1';
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value === PASSWORD) {
      localStorage.setItem(KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setValue('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-base font-black uppercase tracking-widest text-slate-900">Recipe Book</h1>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            placeholder="Enter password"
            autoFocus
            className={`w-full px-4 py-3 rounded-2xl border text-center text-lg font-mono tracking-widest outline-none transition-all
              ${error
                ? 'border-red-300 bg-red-50 text-red-700 placeholder:text-red-300'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 focus:border-blue-400'
              }`}
          />
          {error && (
            <p className="text-[11px] font-black uppercase tracking-widest text-red-500">Incorrect password</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
