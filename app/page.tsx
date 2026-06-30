'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CONTROLE_TEGELS = [
  { icon: '🔍', titel: 'Volledigheid van het dossier', tekst: 'Wij controleren of alle gemelde schades ook daadwerkelijk zijn opgenomen en berekend in het adviesrapport.' },
  { icon: '📏', titel: 'Juiste herstelomvang per schadepost', tekst: 'Per schadepost beoordelen wij of de omvang van het herstel overeenkomt met de vastgestelde herstelregels.' },
  { icon: '💶', titel: 'Correcte tarieven en eenheidsprijzen', tekst: 'Wij toetsen of de gehanteerde prijzen en eenheden overeenkomen met de geldende normen voor schadeherstel.' },
  { icon: '📋', titel: 'Toepassing van de herstelregels', tekst: 'Er gelden specifieke regels voor hoe schades berekend moeten worden. Wij controleren of deze correct zijn toegepast.' },
  { icon: '📸', titel: "Vergelijking van foto's met calculatie", tekst: "Wij beoordelen of zichtbare objecten op foto's overeenkomen met wat er is berekend." },
  { icon: '➕', titel: 'Opslagen en toeslagen', tekst: 'Bepaalde omstandigheden geven recht op extra vergoeding. Wij beoordelen of deze in uw dossier zijn meegenomen.' },
  { icon: '⚖️', titel: 'Onderbouwing en consistentie', tekst: 'Wij controleren of het dossier intern consistent is en of de conclusies aansluiten bij de geconstateerde schades.' },
  { icon: '🏚️', titel: 'Bouwkundige staat van het gebouw', tekst: 'Wij controleren of het gebouw correct is beoordeeld — dit kan invloed hebben op alle schades.' },
];

const STAPPEN = [
  'Document inlezen...',
  'Schade-items identificeren...',
  "Overzichtsfoto's bekijken...",
  'Herstelregels toepassen...',
  'Bekende eenheidsprijzen raadplegen...',
  'Bevindingen samenstellen...',
];

type SchermStatus = 'upload' | 'analyseren' | 'resultaat';

interface ResultaatData {
  analyseId: string;
  totaal_fouten: number;
  totale_gemiste_vergoeding: number | null;
  categorieen: Array<{ naam: string; aantal: number }>;
}

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scherm, setScherm] = useState<SchermStatus>('upload');
  const [stapIndex, setStapIndex] = useState(0);
  const [resultaat, setResultaat] = useState<ResultaatData | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [betalingBezig, setBetalingBezig] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFout('Alleen PDF-bestanden zijn toegestaan.');
      return;
    }

    setFout(null);
    setScherm('analyseren');
    setStapIndex(0);

    let stap = 0;
    const interval = setInterval(() => {
      stap++;
      if (stap < STAPPEN.length - 1) setStapIndex(stap);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const testMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true';
      const resp = await fetch(`/api/analyseer-dossier${testMode ? '?test=true' : ''}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setStapIndex(STAPPEN.length - 1);

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error ?? 'Onbekende fout');
      }

      if (testMode && data.volledig) {
        router.push(`/rapport/${data.analyseId}?test=true`);
        return;
      }

      setResultaat(data);
      setTimeout(() => setScherm('resultaat'), 800);

    } catch (err) {
      clearInterval(interval);
      setFout((err as Error).message ?? 'Er is een fout opgetreden. Probeer opnieuw.');
      setScherm('upload');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleBetalen = async () => {
    if (!resultaat) return;
    setBetalingBezig(true);
    try {
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyseId: resultaat.analyseId }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setFout('Betaalpagina kon niet worden geopend.');
        setBetalingBezig(false);
      }
    } catch {
      setFout('Verbindingsfout. Probeer opnieuw.');
      setBetalingBezig(false);
    }
  };

  if (scherm === 'analyseren') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--donkerblauw)' }}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-white text-center max-w-md">
            <div className="text-6xl mb-8 animate-pulse">🔍</div>
            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Uw dossier wordt geanalyseerd
            </h2>
            <div className="space-y-3">
              {STAPPEN.map((stap, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-500 ${
                    i < stapIndex ? 'opacity-40' : i === stapIndex ? 'opacity-100 bg-white/10' : 'opacity-20'
                  }`}
                >
                  <span className="text-lg">{i < stapIndex ? '✓' : i === stapIndex ? '⏳' : '○'}</span>
                  <span className="text-sm">{stap}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm opacity-60">Dit kan 30-60 seconden duren.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (scherm === 'resultaat' && resultaat) {
    const maxAantal = Math.max(...resultaat.categorieen.map(c => c.aantal), 1);

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-40 h-40 rounded-full text-white text-5xl font-bold shadow-xl mb-4"
              style={{ backgroundColor: 'var(--rood)' }}
            >
              {resultaat.totaal_fouten}
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              {resultaat.totaal_fouten === 1 ? 'fout gevonden' : 'fouten gevonden'} in uw dossier
            </h2>
          </div>

          {resultaat.totale_gemiste_vergoeding !== null && resultaat.totale_gemiste_vergoeding > 0 && (
            <div
              className="rounded-xl p-5 mb-8 text-center shadow"
              style={{ backgroundColor: 'var(--goud)', color: '#1a0a00' }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Geschatte gemiste vergoeding</p>
              <p className="text-4xl font-bold mt-1">
                €{resultaat.totale_gemiste_vergoeding.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs mt-1 opacity-60">Inclusief BTW, op basis van dossier-eenheidsprijzen</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--donkerblauw)' }}>Verdeling per categorie</h3>
            <div className="space-y-3">
              {resultaat.categorieen.filter(c => c.aantal > 0).map((cat) => (
                <div key={cat.naam}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.naam}</span>
                    <span className="font-semibold">{cat.aantal}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(cat.aantal / maxAantal) * 100}%`, backgroundColor: 'var(--middenblauw)' }}
                    />
                  </div>
                </div>
              ))}
              {resultaat.categorieen.every(c => c.aantal === 0) && (
                <p className="text-gray-400 text-sm">Geen fouten per categorie gevonden.</p>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-8 text-center text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))` }}
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Ontvang het volledige foutrapport
            </h3>
            <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
              Inclusief alle bevindingen per schade, de financiële onderbouwing en een toelichting per gevonden fout — zodat u precies weet wat er mis is en wat u kunt doen.
            </p>
            <ul className="text-sm opacity-70 mb-6 space-y-1 text-left inline-block">
              <li>✓ Alle fouten gegroepeerd per schade</li>
              <li>✓ Financiële impact berekend per fout</li>
              <li>✓ Advies over zienswijze of bezwaar</li>
              <li>✓ Eenmalige kosten, geen abonnement</li>
            </ul>
            <br />
            <button
              onClick={handleBetalen}
              disabled={betalingBezig}
              className="px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: 'var(--goud-donker)' }}
            >
              {betalingBezig ? 'Doorsturen...' : 'Volledig rapport ontvangen — €250'}
            </button>
            <p className="text-xs opacity-50 mt-3">Beveiligd betalen via iDEAL of creditcard</p>
          </div>

          {fout && <p className="text-red-600 mt-4 text-center text-sm">{fout}</p>}

          <div className="text-center mt-6">
            <button
              onClick={() => { setScherm('upload'); setResultaat(null); }}
              className="text-sm underline opacity-50 hover:opacity-80 cursor-pointer"
            >
              Ander dossier uploaden
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
            Is uw adviesrapport correct berekend?
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Upload uw dossier en wij analyseren het automatisch op fouten in de herstelcalculatie. U ziet gratis hoeveel fouten er zijn gevonden.
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-10 ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
          <div className="text-5xl mb-4">📂</div>
          <p className="font-semibold text-lg" style={{ color: 'var(--donkerblauw)' }}>
            Sleep uw PDF hier naartoe of klik om te kiezen
          </p>
          <p className="text-sm text-gray-400 mt-2">Alleen PDF-bestanden — uw dossier blijft vertrouwelijk</p>
        </div>

        {fout && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm text-center">
            {fout}
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-5 text-center" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
            Wat controleren wij in uw dossier?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTROLE_TEGELS.map((tegel) => (
              <div key={tegel.titel} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-3">
                <span className="text-2xl flex-shrink-0">{tegel.icon}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--donkerblauw)' }}>{tegel.titel}</p>
                  <p className="text-xs text-gray-500 mt-1">{tegel.tekst}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-5 text-sm"
          style={{ backgroundColor: 'var(--donkerblauw)', color: 'rgba(255,255,255,0.8)' }}
        >
          <span className="font-semibold text-white">💡 Lerend systeem:</span> Onze tool onthoudt eenheidsprijzen uit eerder geanalyseerde dossiers, zodat ook schades die ten onrechte zijn afgewezen toch een betrouwbare schatting van de gemiste vergoeding krijgen.
        </div>
      </main>
      <Footer />
    </div>
  );
}
