import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--donkerblauw)' }} className="text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Kolom 1: Over */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}
              >
                BA
              </div>
              <span className="font-bold" style={{ fontFamily: 'Georgia, serif' }}>BevingsAdvies Groningen</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Onafhankelijk adviesbureau voor de controle van aardbevingsschade-rapporten. Niet gelieerd aan het IMG, aannemers of beoordelende partijen.
            </p>
          </div>

          {/* Kolom 2: Navigatie */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-60">Navigatie</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/" className="hover:opacity-100">Home</Link></li>
              <li><Link href="/hoe-het-werkt" className="hover:opacity-100">Hoe het werkt</Link></li>
              <li><Link href="/over-ons" className="hover:opacity-100">Over ons</Link></li>
              <li><Link href="/#upload" className="hover:opacity-100">Dossier uploaden</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Juridisch */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-60">Juridisch & Privacy</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/privacy" className="hover:opacity-100">Privacyverklaring</Link></li>
              <li><Link href="/voorwaarden" className="hover:opacity-100">Algemene voorwaarden</Link></li>
            </ul>
            <div className="mt-6 text-xs opacity-50 space-y-1">
              <p>KvK: 12345678</p>
              <p>BTW: NL123456789B01</p>
              <p>Groningen, Nederland</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-50">
          <p>© {new Date().getFullYear()} BevingsAdvies Groningen. Alle rechten voorbehouden.</p>
          <p>Uw gegevens worden vertrouwelijk behandeld conform de AVG.</p>
        </div>
      </div>
    </footer>
  );
}
