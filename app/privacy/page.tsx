import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacyverklaring — BevingsAdvies Groningen',
  description: 'Privacyverklaring van BevingsAdvies Groningen conform de Algemene Verordening Gegevensbescherming (AVG).',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />

      <section className="text-white py-12 px-6" style={{ background: 'linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Privacyverklaring</h1>
          <p className="opacity-70 text-sm">Versie 1.0 — Ingangsdatum 1 juli 2025</p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-sm max-w-none">

          <div className="p-4 rounded-lg mb-8 text-sm" style={{ backgroundColor: '#EEF4FF', color: 'var(--donkerblauw)' }}>
            <strong>Samenvatting:</strong> Wij verwerken uw PDF-dossier uitsluitend voor de analyse van uw schaderapport. Het PDF-bestand wordt na verwerking verwijderd. Wij slaan alleen de analyseresultaten op. Uw gegevens worden niet verkocht of gedeeld met adverteerders.
          </div>

          <Sectie titel="1. Wie zijn wij?">
            <p>BevingsAdvies Groningen is een onafhankelijk adviesbureau gevestigd in Groningen, Nederland. Wij zijn ingeschreven bij de Kamer van Koophandel onder nummer 12345678.</p>
            <p>Wij zijn verwerkingsverantwoordelijke in de zin van de Algemene Verordening Gegevensbescherming (AVG / GDPR) voor de persoonsgegevens die u ons verstrekt.</p>
            <p><strong>Contactgegevens:</strong><br />BevingsAdvies Groningen<br />Groningen, Nederland<br />KvK: 12345678</p>
          </Sectie>

          <Sectie titel="2. Welke persoonsgegevens verwerken wij?">
            <p>Wanneer u een PDF-dossier uploadt voor analyse, kan dat dossier de volgende persoonsgegevens bevatten:</p>
            <ul>
              <li>Naam en adresgegevens van de woningeigenaar</li>
              <li>Dossiernummer en zaaknummer bij het IMG</li>
              <li>Gegevens over de woning (adres, bouwjaar, bouwkundige staat)</li>
              <li>Beschrijving van de vastgestelde schades</li>
              <li>Financiële gegevens (vergoedingsbedragen)</li>
              <li>Eventueel overige gegevens vermeld in het IMG-adviesrapport</li>
            </ul>
            <p>Wij verwerken géén bijzondere persoonsgegevens zoals BSN, gezondheidsgegevens of strafrechtelijke gegevens, tenzij deze onverwacht in het dossier voorkomen.</p>
            <p>Daarnaast verwerken wij bij gebruik van onze website technische gegevens zoals IP-adres en browserinformatie, uitsluitend voor de beveiliging en goede werking van de dienst.</p>
          </Sectie>

          <Sectie titel="3. Doel en grondslag van de verwerking">
            <p>Wij verwerken uw persoonsgegevens voor de volgende doeleinden:</p>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr style={{ backgroundColor: 'var(--donkerblauw)', color: 'white' }}>
                  <th className="p-3 text-left rounded-tl-lg">Doel</th>
                  <th className="p-3 text-left">Grondslag (AVG art. 6)</th>
                  <th className="p-3 text-left rounded-tr-lg">Bewaartermijn</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Analyse van uw adviesrapport op fouten', 'Toestemming (art. 6 lid 1 sub a) + uitvoering overeenkomst (art. 6 lid 1 sub b)', 'PDF: onmiddellijk na analyse verwijderd; resultaten: 2 jaar'],
                  ['Levering van het volledige controlerapport', 'Uitvoering overeenkomst (art. 6 lid 1 sub b)', '2 jaar na levering'],
                  ['Betalingsverwerking', 'Uitvoering overeenkomst (art. 6 lid 1 sub b)', 'Conform fiscale bewaarplicht (7 jaar)'],
                  ['Verbetering van onze analyse (geanonimiseerd prijzengeheugen)', 'Gerechtvaardigd belang (art. 6 lid 1 sub f)', 'Onbeperkt na anonimisering'],
                  ['Beveiliging en fraudepreventie', 'Gerechtvaardigd belang (art. 6 lid 1 sub f)', '90 dagen'],
                ].map(([doel, grondslag, termijn], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 border-b border-gray-100">{doel}</td>
                    <td className="p-3 border-b border-gray-100">{grondslag}</td>
                    <td className="p-3 border-b border-gray-100">{termijn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sectie>

          <Sectie titel="4. Doorgifte aan derden (sub-verwerkers)">
            <p>Voor de uitvoering van onze dienst maken wij gebruik van de volgende sub-verwerkers. Met iedere sub-verwerker is een verwerkersovereenkomst gesloten:</p>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr style={{ backgroundColor: 'var(--donkerblauw)', color: 'white' }}>
                  <th className="p-3 text-left rounded-tl-lg">Sub-verwerker</th>
                  <th className="p-3 text-left">Doel</th>
                  <th className="p-3 text-left rounded-tr-lg">Land</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Anthropic, Inc. (Claude API)', 'Geautomatiseerde analyse van de dossiertekst', 'VS (adequaatheidsbesluit / SCC)'],
                  ['Vercel, Inc.', 'Hosting van de webapplicatie', 'VS (adequaatheidsbesluit / SCC)'],
                  ['Neon, Inc.', 'Opslag van analyseresultaten', 'VS (adequaatheidsbesluit / SCC)'],
                  ['Stripe, Inc.', 'Betalingsverwerking', 'VS (adequaatheidsbesluit / SCC)'],
                ].map(([naam, doel, land], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 border-b border-gray-100 font-medium">{naam}</td>
                    <td className="p-3 border-b border-gray-100">{doel}</td>
                    <td className="p-3 border-b border-gray-100">{land}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500">
              <strong>Opmerking Anthropic:</strong> Uw dossiertekst wordt voor de duur van de analyse naar de Claude API gestuurd. Anthropic verwerkt deze gegevens conform hun{' '}
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                privacybeleid
              </a>
              . Wij hebben Anthropic&apos;s API ingesteld om trainingsgebruik van API-data te weigeren.
            </p>
          </Sectie>

          <Sectie titel="5. Beveiliging">
            <p>Wij treffen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen:</p>
            <ul>
              <li>Alle verbindingen zijn versleuteld via HTTPS/TLS 1.3</li>
              <li>Het PDF-bestand wordt uitsluitend in het geheugen verwerkt en niet op schijf opgeslagen</li>
              <li>Toegang tot de database is beperkt tot onze eigen systemen via geauthenticeerde verbindingen</li>
              <li>Wij voeren regelmatige beveiligingscontroles uit</li>
            </ul>
          </Sectie>

          <Sectie titel="6. Uw rechten">
            <p>Op grond van de AVG heeft u de volgende rechten:</p>
            <ul>
              <li><strong>Recht op inzage (art. 15 AVG):</strong> U kunt opvragen welke gegevens wij van u hebben.</li>
              <li><strong>Recht op rectificatie (art. 16 AVG):</strong> U kunt onjuiste gegevens laten corrigeren.</li>
              <li><strong>Recht op verwijdering (art. 17 AVG):</strong> U kunt vragen uw gegevens te verwijderen (&apos;recht om vergeten te worden&apos;).</li>
              <li><strong>Recht op beperking (art. 18 AVG):</strong> U kunt de verwerking tijdelijk laten beperken.</li>
              <li><strong>Recht op overdraagbaarheid (art. 20 AVG):</strong> U kunt uw gegevens opvragen in een machineleesbaar formaat.</li>
              <li><strong>Recht van bezwaar (art. 21 AVG):</strong> U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</li>
              <li><strong>Recht om toestemming in te trekken:</strong> U kunt uw toestemming te allen tijde intrekken, zonder dat dit de rechtmatigheid van de verwerking vóór de intrekking aantast.</li>
            </ul>
            <p>U kunt uw rechten uitoefenen door contact met ons op te nemen via de contactgegevens in artikel 1.</p>
            <p>U heeft het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (AP): <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="underline">www.autoriteitpersoonsgegevens.nl</a>.</p>
          </Sectie>

          <Sectie titel="7. Cookies">
            <p>Wij maken uitsluitend gebruik van functioneel noodzakelijke cookies voor de werking van de website (sessie-cookies). Wij plaatsen geen tracking- of advertentiecookies.</p>
          </Sectie>

          <Sectie titel="8. Wijzigingen">
            <p>Wij kunnen deze privacyverklaring van tijd tot tijd aanpassen. De actuele versie staat altijd op <Link href="/privacy" className="underline">bevingsadvies.nl/privacy</Link>. Bij wezenlijke wijzigingen informeren wij u via de website.</p>
          </Sectie>

        </div>

        <div className="mt-8 text-center">
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

function Sectie({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
        {titel}
      </h2>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
