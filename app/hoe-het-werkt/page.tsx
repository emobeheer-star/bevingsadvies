import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hoe het werkt — BevingsAdvies Groningen',
  description: 'In drie stappen controleert BevingsAdvies uw aardbevingsschade-dossier op fouten en gemiste vergoedingen.',
};

const STAPPEN = [
  {
    nummer: '1',
    titel: 'Upload uw PDF-dossier',
    tekst: 'U uploadt het PDF-rapport dat u van het IMG heeft ontvangen. Dit is het adviesrapport met daarin de vastgestelde schades, oorzaakbeoordeling en berekende vergoeding. Het bestand wordt versleuteld verstuurd en niet gedeeld met derden.',
    detail: 'Werkt met alle dossierformaten van het IMG, inclusief meervoudige beoordelingsronden en aanvullende rapporten.',
    foto: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80',
    fotoAlt: 'PDF-dossier uploaden',
  },
  {
    nummer: '2',
    titel: 'AI-analyse van uw rapport',
    tekst: "Onze tool leest het volledige dossier en vergelijkt het systematisch met de officiële herstelmatrix van het IMG, de juridische conclusieschema’s en de bekende eenheidsprijzen uit vergelijkbare dossiers in dezelfde regio.",
    detail: 'Wij controleren alle schadeposten op stucloper, sauswerk, steigerwerk, tegelwerk, meubels en objecten op foto, trapgat-toeslagen en juridische conclusies op basis van de PGV-waarden en bouwkundige staat.',
    foto: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    fotoAlt: 'AI-analyse van schaderapporten',
  },
  {
    nummer: '3',
    titel: 'Ontvang uw controlerapport',
    tekst: 'Na betaling ontvangt u een volledig PDF-rapport met alle gevonden fouten per schade, de correcte berekening, de financiële impact per fout en een advies over het indienen van een zienswijze of bezwaar bij het IMG.',
    detail: 'U kunt het rapport direct gebruiken als bijlage bij uw zienswijze. Ons rapport is inhoudelijk onderbouwd en verwijst naar de specifieke herstelregels die zijn overtreden.',
    foto: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    fotoAlt: 'Controlerapport ontvangen',
  },
];

const REGELS = [
  { code: 'REGEL 1', omschrijving: 'Sauswerk & spackwerk — ruimteniveau', uitleg: 'Sauswerk wordt per hele ruimte berekend, niet per wand afzonderlijk. Te lage m²-berekening is de meest voorkomende fout.' },
  { code: 'REGEL 2', omschrijving: 'Tegelwerk — leeftijdsgebonden regels', uitleg: 'Als tegels nog verkrijgbaar zijn, moet de gehele wand herbetegeld worden. Losse tegelvervanging is alleen toegestaan bij wanden ouder dan 10 jaar met niet-verkrijgbare tegels.' },
  { code: 'REGEL 5', omschrijving: 'Steigerwerk vanaf 2,5 meter', uitleg: 'Bij werkzaamheden op 2,5 meter of hoger is een rolsteiger verplicht. Ontbreekt deze post vaak in dossiers met hoge ruimten of trappenhuizen.' },
  { code: 'REGEL 7', omschrijving: 'Stucloper — verplicht bij stucwerk', uitleg: 'Stucloper is verplicht bij alle stuc-, spack- en sierpleisterwerk. Berekend over de breedte van de wand; bij plafondwerk over het volledige vloeroppervlak.' },
  { code: 'REGEL 9', omschrijving: 'Bouwkundige staat — gevoeligheidsklasse', uitleg: 'Een onjuiste gevoeligheidsklasse kan ertoe leiden dat alle schades ten onrechte worden afgewezen. Dit is de meest impactvolle fout.' },
  { code: 'REGEL 10', omschrijving: 'Juridische conclusies (O1/O2/A t/m H)', uitleg: 'Wij toetsen of de juridische conclusie past bij de gemeten PGV-waarden, de bouwkundige staat en de aard van de schade.' },
];

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />

      {/* Hero */}
      <section className="text-white py-14 px-6" style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Hoe werkt de dossiercontrole?</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Van PDF-upload tot volledig controlerapport in drie stappen — onderbouwd door de officiële herstelmatrix van het IMG.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-14 w-full">

        {/* Drie stappen */}
        <section className="mb-20 space-y-16">
          {STAPPEN.map((stap, i) => (
            <div key={i} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
              <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-xl font-bold mb-4"
                  style={{ backgroundColor: 'var(--donkerblauw)' }}
                >
                  {stap.nummer}
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
                  {stap.titel}
                </h2>
                <p className="text-gray-600 mb-3 leading-relaxed">{stap.tekst}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{stap.detail}</p>
              </div>
              <div className={`relative h-64 rounded-2xl overflow-hidden shadow-lg ${i % 2 === 1 ? 'md:col-start-1' : ''}`}>
                <Image
                  src={stap.foto}
                  alt={stap.fotoAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </section>

        {/* Welke regels */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              Welke herstelregels controleren wij?
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Onze controle is gebaseerd op de officiële herstelmatrix, de Werkinstructie Causaliteit (v2.1) en de geldende berekeningsregels van het IMG.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REGELS.map((regel) => (
              <div key={regel.code} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--donkerblauw)', color: 'white' }}
                  >
                    {regel.code}
                  </span>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--donkerblauw)' }}>{regel.omschrijving}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{regel.uitleg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="rounded-2xl p-10 text-center text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Klaar om uw dossier te laten controleren?
          </h2>
          <p className="opacity-80 mb-6 text-sm max-w-md mx-auto">
            Upload uw dossier en ontdek gratis hoeveel fouten er zijn gevonden — zonder registratie, zonder abonnement.
          </p>
          <Link
            href="/#upload"
            className="inline-block px-8 py-3 rounded-full font-bold text-lg hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}
          >
            Gratis controleren
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
