import Image from 'next/image';
import Link from 'next/link';
import { Scale, ClipboardList, Lock, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over ons — BevingsAdvies Groningen',
  description: 'BevingsAdvies Groningen is een onafhankelijk adviesbureau gespecialiseerd in de controle van aardbevingsschade-rapporten in Groningen.',
};

const WAARDEN = [
  {
    icon: Scale,
    titel: 'Volledig onafhankelijk',
    tekst: 'Wij zijn niet gelieerd aan het IMG, aannemers of andere partijen in het schadeherstelproces. Ons enige belang is het belang van de eigenaar.',
  },
  {
    icon: ClipboardList,
    titel: 'Gebaseerd op officiële regelgeving',
    tekst: 'Onze controles zijn gebaseerd op de officiële herstelmatrix (versie D71), de Werkinstructie Causaliteit (versie 2.1) en de geldende IMG-berekeningsregels.',
  },
  {
    icon: Lock,
    titel: 'Vertrouwelijk & AVG-conform',
    tekst: 'Uw dossier bevat persoonsgegevens. Wij verwerken deze uitsluitend voor de analyse en verwijderen het PDF-bestand daarna. Zie onze privacyverklaring.',
  },
  {
    icon: Target,
    titel: 'Alleen in uw voordeel',
    tekst: 'Wij rapporteren uitsluitend fouten die u geld kosten — niet fouten die u zouden benadelen als het IMG ze zou zien. Uw belang staat centraal.',
  },
];

export default function OverOnsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />

      {/* Hero */}
      <section className="text-white py-14 px-6" style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>Over BevingsAdvies Groningen</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Wij helpen gedupeerde woningbezitters in Groningen om te achterhalen of hun schadevergoeding correct is berekend.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-14 w-full">

        {/* Missie */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              Waarom BevingsAdvies?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              De aardbevingsproblematiek in Groningen treft duizenden woningbezitters. Het schadeproces via het IMG is complex en de adviesrapporten bevatten regelmatig fouten in de herstelcalculatie — fouten die eigenaren geld kosten zonder dat ze het weten.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Uit onze ervaring met geanalyseerde dossiers blijkt dat in de overgrote meerderheid gevallen één of meerdere rekenfouten voorkomen. Gemiddeld gaat het om honderden tot duizenden euro&apos;s aan gemiste vergoeding.
            </p>
            <p className="text-gray-600 leading-relaxed">
              BevingsAdvies biedt een toegankelijke, betaalbare manier om uw dossier te laten controleren — zonder advocaat, zonder maandenlange wachttijden.
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80"
              alt="Woning in Groningen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* Waarden */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
            Onze werkwijze
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WAARDEN.map((waarde) => (
              <div key={waarde.titel} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#EEF4FF' }}
                >
                  <waarde.icon className="w-6 h-6" style={{ color: 'var(--middenblauw)' }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--donkerblauw)' }}>{waarde.titel}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{waarde.tekst}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gegevens */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
            Bedrijfsgegevens
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
            {[
              { label: 'Handelsnaam', waarde: 'BevingsAdvies Groningen' },
              { label: 'KvK-nummer', waarde: '12345678' },
              { label: 'BTW-nummer', waarde: 'NL123456789B01' },
              { label: 'Vestigingsplaats', waarde: 'Groningen, Nederland' },
              { label: 'Gespecialiseerd in', waarde: 'Aardbevingsschade Noord-Nederland' },
              { label: 'Privacyverklaring', waarde: 'Zie /privacy' },
            ].map(({ label, waarde }) => (
              <div key={label}>
                <dt className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</dt>
                <dd className="text-gray-800">{waarde}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section
          className="rounded-2xl p-10 text-center text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Twijfelt u of uw vergoeding klopt?
          </h2>
          <p className="opacity-80 mb-6 text-sm max-w-md mx-auto">
            Upload uw dossier en ontdek gratis hoeveel fouten er zijn gevonden.
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
