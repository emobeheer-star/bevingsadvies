'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/hoe-het-werkt', label: 'Hoe het werkt' },
  { href: '/over-ons', label: 'Over ons' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ backgroundColor: 'var(--donkerblauw)' }} className="text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}
          >
            BA
          </div>
          <div>
            <div className="text-lg font-bold leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              BevingsAdvies Groningen
            </div>
            <div className="text-xs opacity-60">Onafhankelijke controle van uw adviesrapport</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                pathname === href ? 'text-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={pathname === href ? { color: 'var(--goud)' } : {}}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#upload"
            className="px-4 py-2 rounded-full text-sm font-bold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}
          >
            Dossier uploaden
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg opacity-80 hover:opacity-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium opacity-80 hover:opacity-100"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#upload"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-full text-sm font-bold text-center"
            style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}
          >
            Dossier uploaden
          </Link>
        </div>
      )}
    </header>
  );
}
