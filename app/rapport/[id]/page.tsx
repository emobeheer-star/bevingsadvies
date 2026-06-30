'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { AnalyseResultaat } from '@/lib/types';

export default function RapportPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isTest = searchParams.get('test') === 'true';
  const [resultaat, setResultaat] = useState<AnalyseResultaat | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [upsellBezig, setUpsellBezig] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRapport = async () => {
      const resp = await fetch(`/api/rapport/${id}${isTest ? '?test=true' : ''}`);
      if (resp.status === 402) {
        setFout('Dit rapport is nog niet vrijgegeven. Voltooi de betaling om het volledige rapport te bekijken.');
        return;
      }
      if (!resp.ok) {
        setFout('Rapport niet gevonden.');
        return;
      }
      const data = await resp.json();
      setResultaat(data.resultaat);
    };

    fetchRapport();
  }, [id, isTest]);

  const handleUpsell = async (type: string) => {
    setUpsellBezig(type);
    try {
      const resp = await fetch('/api/upsell-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyseId: id, upsellType: type }),
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setUpsellBezig(null);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/rapport/${id}/pdf${isTest ? '?test=true' : ''}`, '_blank');
  };

  if (fout) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>Rapport niet beschikbaar</h2>
            <p className="text-gray-600 mb-6">{fout}</p>
            <a href="/" className="inline-block px-6 py-2 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: 'var(--donkerblauw)' }}>
              Terug naar upload
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!resultaat) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">📄</div>
            <p>Rapport laden...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              Volledig foutrapport
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {resultaat.totaal_fouten} {resultaat.totaal_fouten === 1 ? 'fout' : 'fouten'} gevonden
              {resultaat.totale_gemiste_vergoeding ? ` — geschatte gemiste vergoeding: €${resultaat.totale_gemiste_vergoeding.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : ''}
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold text-sm shadow hover:opacity-90 transition cursor-pointer"
            style={{ backgroundColor: 'var(--donkerblauw)' }}
          >
            <span>⬇</span> Rapport downloaden (PDF)
          </button>
        </div>

        {/* Kritieke bevindingen */}
        {resultaat.kritieke_bevindingen.length > 0 && (
          <div className="mb-8">
            <div className="rounded-xl p-6 mb-4 text-white" style={{ backgroundColor: 'var(--paars)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>Kritieke bevindingen</h3>
              </div>
              <p className="text-sm opacity-80 mb-4">
                De onderstaande bevindingen kunnen het <strong>gehele dossier</strong> raken, niet alleen één losse schade.
              </p>
              {resultaat.kritieke_bevindingen.map((bev, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 mb-3 last:mb-0">
                  <p className="font-semibold">{bev.titel}</p>
                  <p className="text-sm opacity-80 mt-1">{bev.uitleg}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="opacity-60">{bev.regel}</span>
                    {bev.zienswijze_kansrijk && (
                      <span className="bg-green-500/30 rounded px-2 py-0.5">Kansrijk voor zienswijze</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per schade */}
        {resultaat.schades.length > 0 ? (
          <div className="space-y-6 mb-10">
            {resultaat.schades.map((schade, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: 'var(--donkerblauw)' }}>{schade.schadenummer}</h4>
                    <p className="text-sm text-gray-500">{schade.ruimte_omschrijving}</p>
                  </div>
                  {schade.schade_totaal_euro !== null && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Gemist</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--rood)' }}>
                        €{schade.schade_totaal_euro.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {schade.fouten.map((fout, j) => (
                    <div key={j} className="border-l-4 pl-4 py-1" style={{ borderColor: fout.type === 'fout' ? 'var(--rood)' : 'var(--goud)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{fout.titel}</p>
                        {fout.impact_euro !== null && (
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--rood)' }}>
                            €{fout.impact_euro.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{fout.uitleg}</p>
                      {fout.impact_onderbouwing && (
                        <p className="text-xs text-gray-400 mt-1 italic">{fout.impact_onderbouwing}</p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{fout.regel}</span>
                        {fout.zienswijze_kansrijk && (
                          <span className="text-xs rounded px-2 py-0.5 text-white" style={{ backgroundColor: 'var(--groen)' }}>
                            Kansrijk voor zienswijze
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 mb-10">
            <div className="text-4xl mb-3">✅</div>
            <p>Geen specifieke schadeposten met fouten gevonden.</p>
          </div>
        )}

        {/* Totaalblok */}
        {resultaat.totale_gemiste_vergoeding !== null && resultaat.totale_gemiste_vergoeding > 0 && (
          <div
            className="rounded-xl p-6 text-center mb-10"
            style={{ backgroundColor: 'var(--donkerblauw)', color: 'white' }}
          >
            <p className="text-sm opacity-70 uppercase tracking-wide">Totaal gemiste vergoeding</p>
            <p className="text-4xl font-bold mt-1" style={{ color: 'var(--goud)' }}>
              €{resultaat.totale_gemiste_vergoeding.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-50 mt-1">Inclusief BTW — berekend op basis van dossier-eenheidsprijzen</p>
            <button
              onClick={handleDownloadPdf}
              className="mt-4 px-6 py-2 rounded-full font-semibold text-sm cursor-pointer hover:opacity-90 transition"
              style={{ backgroundColor: 'var(--goud)', color: '#1a0a00' }}
            >
              ⬇ Download PDF-rapport
            </button>
          </div>
        )}

        {/* Upsell */}
        {!isTest && (
          <div className="bg-white rounded-xl shadow p-8 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              Wilt u dat wij actie ondernemen?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Wij kunnen namens u een formele zienswijze of bezwaar indienen. Onze deskundigen zorgen voor een juridisch correcte en goed onderbouwde reactie.
            </p>
            <div className="text-xs text-gray-400 mb-6">
              <strong>Hoe het werkt:</strong>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>U kiest een optie en betaalt</li>
                <li>Wij nemen binnen 2 werkdagen contact op</li>
                <li>Wij stellen het stuk op en dienen het in namens u</li>
              </ol>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border-2 rounded-xl p-5" style={{ borderColor: 'var(--groen)' }}>
                <p className="font-bold text-lg" style={{ color: 'var(--groen)' }}>Zienswijze indienen</p>
                <p className="text-2xl font-bold mt-1">€495</p>
                <p className="text-xs text-gray-500 mt-2 mb-4">
                  Wij schrijven en dienen een formele zienswijze in op basis van de gevonden fouten.
                </p>
                <button
                  onClick={() => handleUpsell('zienswijze')}
                  disabled={upsellBezig !== null}
                  className="w-full py-2 rounded-full text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: 'var(--groen)' }}
                >
                  {upsellBezig === 'zienswijze' ? 'Doorsturen...' : 'Kies zienswijze'}
                </button>
              </div>
              <div className="border-2 rounded-xl p-5" style={{ borderColor: 'var(--middenblauw)' }}>
                <p className="font-bold text-lg" style={{ color: 'var(--middenblauw)' }}>Zienswijze + Bezwaar</p>
                <p className="text-2xl font-bold mt-1">€895</p>
                <p className="text-xs text-gray-500 mt-2 mb-4">
                  Volledige bijstand: zienswijze én bezwaarschrift, inclusief begeleiding door het hele proces.
                </p>
                <button
                  onClick={() => handleUpsell('zienswijze_bezwaar')}
                  disabled={upsellBezig !== null}
                  className="w-full py-2 rounded-full text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: 'var(--middenblauw)' }}
                >
                  {upsellBezig === 'zienswijze_bezwaar' ? 'Doorsturen...' : 'Kies zienswijze + bezwaar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <a href="/" className="text-sm underline opacity-40 hover:opacity-70">Ander dossier uploaden</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
