import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden — BevingsAdvies Groningen',
  description: 'Algemene voorwaarden van BevingsAdvies Groningen.',
};

const ARTIKELEN = [
  {
    titel: 'Artikel 1 — Definities',
    inhoud: [
      '"BevingsAdvies": BevingsAdvies Groningen, gevestigd te Groningen, KvK 12345678.',
      '"Klant": de natuurlijke of rechtspersoon die gebruikmaakt van onze diensten.',
      '"Dossier": het PDF-adviesrapport van het IMG dat de klant uploadt ter analyse.',
      '"Controlerapport": het door BevingsAdvies opgestelde rapport met bevindingen na analyse van het dossier.',
    ],
  },
  {
    titel: 'Artikel 2 — Toepasselijkheid',
    inhoud: [
      'Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten en leveringen van BevingsAdvies.',
      'Door gebruik te maken van onze dienst gaat de klant akkoord met deze voorwaarden.',
    ],
  },
  {
    titel: 'Artikel 3 — De dienst',
    inhoud: [
      'BevingsAdvies biedt een automatische analyse van IMG-adviesrapporten op basis van de geldende herstelmatrix en berekeningsregels.',
      'De gratis vooranalyse toont het aantal geconstateerde fouten en de geschatte gemiste vergoeding.',
      'Het volledige controlerapport (€250 incl. BTW) bevat alle bevindingen per schade, de financiële onderbouwing en een advies over een zienswijze of bezwaar.',
      'BevingsAdvies levert een inspanningsverplichting, geen resultaatverplichting. De analyse is gebaseerd op de tekst en afbeeldingen in het aangeleverde dossier.',
    ],
  },
  {
    titel: 'Artikel 4 — Totstandkoming overeenkomst',
    inhoud: [
      'Een overeenkomst komt tot stand zodra de klant het volledige rapport heeft besteld en de betaling is verwerkt.',
      'Na betaling wordt het controlerapport zo spoedig mogelijk — uiterlijk binnen 24 uur — aan de klant beschikbaar gesteld.',
    ],
  },
  {
    titel: 'Artikel 5 — Prijzen en betaling',
    inhoud: [
      'De gratis vooranalyse (aantal fouten en geschatte vergoeding) is kosteloos.',
      'Het volledige controlerapport kost €250 inclusief 21% BTW.',
      'Betaling geschiedt vooraf via Stripe (iDEAL, creditcard of andere aangeboden betaalmethoden).',
      'Alle bedragen op de website zijn inclusief BTW, tenzij anders vermeld.',
    ],
  },
  {
    titel: 'Artikel 6 — Herroepingsrecht',
    inhoud: [
      'De klant heeft het recht de overeenkomst te herroepen binnen 14 dagen na totstandkoming, zonder opgave van redenen.',
      'Het herroepingsrecht vervalt zodra de klant uitdrukkelijk heeft ingestemd met onmiddellijke uitvoering en erkent dat hij daarmee het herroepingsrecht verliest. Bij het downloaden van het controlerapport geldt dit als instemming.',
    ],
  },
  {
    titel: 'Artikel 7 — Aansprakelijkheid',
    inhoud: [
      'BevingsAdvies is uitsluitend aansprakelijk voor directe schade als gevolg van een toerekenbare tekortkoming in de nakoming van de overeenkomst.',
      'De aansprakelijkheid van BevingsAdvies is te allen tijde beperkt tot het door de klant betaalde bedrag voor de betreffende dienst.',
      'BevingsAdvies is niet aansprakelijk voor beslissingen die de klant neemt op basis van het controlerapport, noch voor de uitkomst van bezwaar- of zienswijzeprocedures.',
      'Het controlerapport is een hulpmiddel en vervangt geen juridisch advies van een advocaat of gecertificeerd bouwkundige.',
    ],
  },
  {
    titel: 'Artikel 8 — Vertrouwelijkheid en privacy',
    inhoud: [
      'BevingsAdvies verwerkt het geüploade dossier vertrouwelijk conform de AVG. Zie de privacyverklaring op bevingsadvies.nl/privacy.',
      'Het PDF-bestand wordt na verwerking verwijderd. Analyseresultaten worden geanonimiseerd bewaard voor verbetering van de dienst.',
    ],
  },
  {
    titel: 'Artikel 9 — Intellectueel eigendom',
    inhoud: [
      'Alle rechten op de website en het controlerapport berusten bij BevingsAdvies.',
      'Het controlerapport mag uitsluitend worden gebruikt voor persoonlijk gebruik door de klant, waaronder het indienen van een zienswijze of bezwaar.',
    ],
  },
  {
    titel: 'Artikel 10 — Toepasselijk recht en geschillen',
    inhoud: [
      'Op deze voorwaarden is Nederlands recht van toepassing.',
      'Geschillen worden bij voorkeur in onderling overleg opgelost. Lukt dit niet, dan is de bevoegde rechter in het arrondissement Noord-Nederland bevoegd.',
    ],
  },
];

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />

      <section className="text-white py-12 px-6" style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Algemene voorwaarden</h1>
          <p className="opacity-70 text-sm">Versie 1.0 — Ingangsdatum 1 juli 2025</p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          {ARTIKELEN.map((artikel) => (
            <div key={artikel.titel}>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
                {artikel.titel}
              </h2>
              <ul className="space-y-2">
                {artikel.inhoud.map((zin, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-3">
                    <span className="text-gray-300 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{zin}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/privacy"
            className="inline-block px-6 py-3 rounded-full font-semibold text-sm border hover:bg-gray-50 transition"
            style={{ color: 'var(--donkerblauw)', borderColor: 'var(--donkerblauw)' }}
          >
            Privacyverklaring
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--donkerblauw)', color: 'white' }}
          >
            ← Terug naar home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
