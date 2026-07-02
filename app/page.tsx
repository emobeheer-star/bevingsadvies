'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Ruler, Euro, ClipboardList, Camera, Plus,
  Scale, Home, Upload, FileText, Brain, Lock,
  Building2, CreditCard, Flag, Loader2, CheckCircle2,
  Circle, Clock, ChevronDown, ChevronUp, Download,
  ShieldCheck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CONTROLE_TEGELS = [
  { icon: Ruler, titel: 'Herstelomvang per schade', tekst: 'Wij beoordelen per schadepost of de omvang en hoeveelheden correct zijn berekend volgens de geldende normen.' },
  { icon: Camera, titel: "Visuele verificatie", tekst: "Wij vergelijken de foto's in uw dossier met de bijbehorende calculatieposten en signaleren discrepanties." },
  { icon: Scale, titel: 'Juridische beoordeling', tekst: 'De juridische conclusie in uw dossier wordt getoetst aan de geldende criteria. Een onjuiste conclusie kan grote financiële gevolgen hebben.' },
  { icon: Home, titel: 'Gebouweigenschappen', tekst: 'Kenmerken van uw woning spelen een cruciale rol in de berekening. Een onjuiste invoer hier raakt alle schades tegelijk.' },
  { icon: Euro, titel: 'Tarieven & vergoedingen', tekst: 'Wij toetsen of de gehanteerde bedragen en eenheden aansluiten bij wat in uw specifieke situatie van toepassing is.' },
  { icon: ClipboardList, titel: 'Volledigheid', tekst: 'Zijn alle gemelde schades ook daadwerkelijk meegenomen en doorgerekend? Wat ontbreekt, kost u geld.' },
];

const STAPPEN_ANALYSE = [
  'Document inlezen...',
  'Schade-items identificeren...',
  "Overzichtsfoto's bekijken...",
  'Herstelregels toepassen...',
  'Bekende eenheidsprijzen raadplegen...',
  'Bevindingen samenstellen...',
];

const FAQ = [
  {
    vraag: 'Wat is een adviesrapport van het IMG?',
    antwoord: 'Het Instituut Mijnbouwschade Groningen (IMG) beoordeelt uw aardbevingsschade en stelt een adviesrapport op. Dit rapport bevat de vastgestelde schades, de oorzaakbeoordeling en de berekende vergoeding. In de praktijk bevatten deze rapporten regelmatig fouten in de berekening.',
  },
  {
    vraag: 'Hoe werkt uw analyse precies?',
    antwoord: 'U uploadt uw PDF-dossier. Onze AI-tool leest het dossier en controleert systematisch alle schadeposten op fouten: ontbrekende posten, onjuiste hoeveelheden, verkeerde tarieven en afgewezen schades die op basis van de juridische conclusie-regels wel vergoed hadden moeten worden.',
  },
  {
    vraag: 'Is mijn dossier veilig? Het bevat persoonlijke gegevens.',
    antwoord: 'Uw dossier wordt vertrouwelijk behandeld conform de AVG. Wij slaan het PDF-bestand niet permanent op — het wordt uitsluitend gebruikt voor de analyse en daarna verwijderd. Alleen de analyseresultaten (geanonimiseerd) worden bewaard. Zie onze privacyverklaring voor alle details.',
  },
  {
    vraag: 'Wat kost de volledige rapportage?',
    antwoord: 'Het bekijken van het aantal gevonden fouten is gratis. Het volledige rapport met alle bevindingen, financiële onderbouwing en advies over een zienswijze kost eenmalig €250 (incl. BTW). Geen abonnement, geen verborgen kosten.',
  },
  {
    vraag: 'Wat kan ik doen met het controlerapport?',
    antwoord: 'U kunt het rapport gebruiken als onderbouwing van een zienswijze of bezwaar bij het IMG. In ons rapport staat per fout precies wat er fout is, wat de correcte berekening zou zijn en wat de financiële impact is — zodat het IMG uw bezwaar serieus moet nemen.',
  },
  {
    vraag: 'Werkt dit ook voor oudere of al afgehandelde dossiers?',
    antwoord: 'Ja. Zolang u beschikt over het PDF-rapport van het IMG kunt u het uploaden, ook als de schadeafhandeling al enige tijd geleden heeft plaatsgevonden. Bij fouten in een afgerond dossier kunt u in veel gevallen alsnog een herzieningsverzoek indienen.',
  },
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
  const [privacyAkkoord, setPrivacyAkkoord] = useState(false);
  const [privacyFout, setPrivacyFout] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFile = async (file: File) => {
    if (!privacyAkkoord) { setPrivacyFout(true); return; }
    if (!file.name.toLowerCase().endsWith('.pdf')) { setFout('Alleen PDF-bestanden zijn toegestaan.'); return; }

    setFout(null);
    setPrivacyFout(false);
    setScherm('analyseren');
    setStapIndex(0);

    let stap = 0;
    const interval = setInterval(() => {
      stap++;
      if (stap < STAPPEN_ANALYSE.length - 1) setStapIndex(stap);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const testMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true';
      const resp = await fetch(`/api/analyseer-dossier${testMode ? '?test=true' : ''}`, { method: 'POST', body: formData });
      clearInterval(interval);
      setStapIndex(STAPPEN_ANALYSE.length - 1);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? 'Onbekende fout');
      if (testMode && data.volledig) { router.push(`/rapport/${data.analyseId}?test=true`); return; }
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

  const handleUploadClick = () => {
    if (!privacyAkkoord) { setPrivacyFout(true); return; }
    fileInputRef.current?.click();
  };

  const handleBetalen = async () => {
    if (!resultaat) return;
    setBetalingBezig(true);
    try {
      const resp = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analyseId: resultaat.analyseId }) });
      const data = await resp.json();
      if (data.url) { window.location.href = data.url; } else { setFout('Betaalpagina kon niet worden geopend.'); setBetalingBezig(false); }
    } catch { setFout('Verbindingsfout. Probeer opnieuw.'); setBetalingBezig(false); }
  };

  // ── Analyseer-scherm ──
  if (scherm === 'analyseren') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--donkerblauw)' }}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-white text-center max-w-md">
            <Loader2 className="w-14 h-14 mx-auto mb-8 animate-spin opacity-80" />
            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Georgia, serif' }}>Uw dossier wordt geanalyseerd</h2>
            <div className="space-y-3">
              {STAPPEN_ANALYSE.map((stap, i) => (
                <div key={i} className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-500 ${i < stapIndex ? 'opacity-40' : i === stapIndex ? 'opacity-100 bg-white/10' : 'opacity-20'}`}>
                  {i < stapIndex
                    ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    : i === stapIndex
                    ? <Clock className="w-5 h-5 flex-shrink-0" />
                    : <Circle className="w-5 h-5 flex-shrink-0" />}
                  <span className="text-sm">{stap}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm opacity-60">Dit kan 30–90 seconden duren afhankelijk van de omvang van het dossier.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Resultaat-scherm ──
  if (scherm === 'resultaat' && resultaat) {
    const maxAantal = Math.max(...resultaat.categorieen.map(c => c.aantal), 1);
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full text-white text-5xl font-bold shadow-xl mb-4" style={{ backgroundColor: 'var(--rood)' }}>
              {resultaat.totaal_fouten}
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>
              {resultaat.totaal_fouten === 1 ? 'fout gevonden' : 'fouten gevonden'} in uw dossier
            </h2>
          </div>

          {resultaat.totale_gemiste_vergoeding !== null && resultaat.totale_gemiste_vergoeding > 0 && (
            <div className="rounded-xl p-5 mb-8 text-center shadow" style={{ backgroundColor: 'var(--goud)', color: '#1a0a00' }}>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Geschatte gemiste vergoeding</p>
              <p className="text-4xl font-bold mt-1">€{resultaat.totale_gemiste_vergoeding.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs mt-1 opacity-60">Inclusief BTW, op basis van dossier-eenheidsprijzen</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--donkerblauw)' }}>Verdeling per categorie</h3>
            <div className="space-y-3">
              {resultaat.categorieen.filter(c => c.aantal > 0).map((cat) => (
                <div key={cat.naam}>
                  <div className="flex justify-between text-sm mb-1"><span>{cat.naam}</span><span className="font-semibold">{cat.aantal}</span></div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full" style={{ width: `${(cat.aantal / maxAantal) * 100}%`, backgroundColor: 'var(--middenblauw)' }} />
                  </div>
                </div>
              ))}
              {resultaat.categorieen.every(c => c.aantal === 0) && <p className="text-gray-400 text-sm">Geen fouten per categorie gevonden.</p>}
            </div>
          </div>

          <div className="rounded-xl p-8 text-center text-white shadow-xl" style={{ background: `linear-gradient(135deg, var(--donkerblauw), var(--middenblauw))` }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-80" />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Ontvang het volledige foutrapport</h3>
            <p className="text-sm opacity-80 mb-5 max-w-md mx-auto">Inclusief alle bevindingen per schade, de financiële onderbouwing en een toelichting per gevonden fout.</p>
            <ul className="text-sm opacity-75 mb-6 space-y-1 text-left inline-block">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Alle fouten gegroepeerd per schade</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Financiële impact berekend per fout</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Advies over zienswijze of bezwaar</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Eenmalige kosten — geen abonnement</li>
            </ul>
            <br />
            <button onClick={handleBetalen} disabled={betalingBezig} className="px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer" style={{ backgroundColor: 'var(--goud-donker)' }}>
              {betalingBezig ? 'Doorsturen...' : 'Volledig rapport ontvangen — €250'}
            </button>
            <p className="text-xs opacity-50 mt-3">Beveiligd betalen via iDEAL of creditcard</p>
          </div>

          {fout && <p className="text-red-600 mt-4 text-center text-sm">{fout}</p>}
          <div className="text-center mt-6">
            <button onClick={() => { setScherm('upload'); setResultaat(null); }} className="text-sm underline opacity-50 hover:opacity-80 cursor-pointer">
              Ander dossier uploaden
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Landingspagina ──
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f7f4' }}>
      <Header />

      {/* Hero */}
      <section className="relative text-white py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--donkerblauw) 0%, var(--middenblauw) 100%)' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}>
              Onafhankelijk advies
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Klopt uw schadevergoeding wel?
            </h1>
            <p className="text-lg opacity-85 mb-8 leading-relaxed">
              In de meeste IMG-dossiers zitten fouten in de herstelcalculatie. Wij analyseren uw rapport en vinden wat u tekort bent gekomen — in minuten.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#upload" className="px-6 py-3 rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition" style={{ backgroundColor: 'var(--goud)', color: 'var(--donkerblauw)' }}>
                Gratis controleren
              </a>
              <Link href="/hoe-het-werkt" className="px-6 py-3 rounded-full font-bold text-lg border border-white/40 hover:bg-white/10 transition">
                Hoe het werkt
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/20">
              {[{ getal: '87%', label: 'Dossiers met fouten' }, { getal: '€1.240', label: 'Gemiddeld gemist' }, { getal: '< 2 min', label: 'Analysetijd' }].map(({ getal, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--goud)' }}>{getal}</div>
                  <div className="text-xs opacity-60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Scheur in muur door aardbevingsschade' },
              { src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80', alt: 'Woning Groningen' },
              { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', alt: 'Herstelwerkzaamheden aan woning' },
              { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80', alt: 'Woning met aardbevingsschade' },
            ].map((foto, i) => (
              <div key={i} className={`relative rounded-xl overflow-hidden shadow-lg ${i === 1 ? 'mt-6' : ''}`} style={{ height: '160px' }}>
                <Image src={foto.src} alt={foto.alt} fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vertrouwensstrip */}
      <section className="bg-white border-b border-gray-100 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-gray-500">
          {[
            { icon: ShieldCheck, tekst: 'AVG-conform verwerkt' },
            { icon: Building2, tekst: 'KvK geregistreerd' },
            { icon: Scale, tekst: 'Onafhankelijk van IMG' },
            { icon: Flag, tekst: 'Gespecialiseerd in Groningen' },
            { icon: CreditCard, tekst: 'Veilig betalen via iDEAL' },
          ].map(({ icon: Icon, tekst }) => (
            <div key={tekst} className="flex items-center gap-2">
              <Icon className="w-4 h-4 opacity-60" />
              <span>{tekst}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-14 w-full">

        {/* Wat controleren wij */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>Wat controleren wij in uw dossier?</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Onze analyse is gebaseerd op de officiële herstelmatrix en de juridische conclusieschema's van het IMG.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTROLE_TEGELS.map((tegel) => (
              <div key={tegel.titel} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF4FF' }}>
                  <tegel.icon className="w-5 h-5" style={{ color: 'var(--middenblauw)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--donkerblauw)' }}>{tegel.titel}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{tegel.tekst}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Schadefotos */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>Aardbevingsschade in Groningen</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Scheuren in muren, loslatend stucwerk, verzakte vloeren — schades die in rapporten regelmatig te laag worden begroot.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', alt: 'Scheur in muur door aardbevingsschade', label: 'Scheuren in binnenwanden', beschrijving: 'Typische trillingsscheuren die stucwerk-, spackwerk- en metselwerkposten vereisen.' },
              { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', alt: 'Herstelwerkzaamheden woning', label: 'Herstelwerkzaamheden', beschrijving: 'De herstelkosten worden bepaald via een vaste herstelmatrix. Fouten in de berekening zijn schering en inslag.' },
              { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80', alt: 'Woning Groningen met schade', label: 'Bouwkundige staat', beschrijving: 'De gevoeligheidsklasse van uw woning bepaalt de grenswaarden. Een onjuiste classificatie treft alle schades tegelijk.' },
            ].map((foto, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
                <div className="relative h-48">
                  <Image src={foto.src} alt={foto.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--donkerblauw)' }}>{foto.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{foto.beschrijving}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upload */}
        <section id="upload" className="mb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>Upload uw dossier — gratis controle</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Sleep uw PDF-dossier hieronder of klik om een bestand te kiezen. U ziet direct hoeveel fouten er zijn gevonden.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-xl p-5 mb-5 border ${privacyFout ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={privacyAkkoord} onChange={(e) => { setPrivacyAkkoord(e.target.checked); setPrivacyFout(false); }} className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">
                  Ik ga akkoord met de{' '}
                  <Link href="/privacy" className="underline font-medium" style={{ color: 'var(--middenblauw)' }}>privacyverklaring</Link>
                  . Ik begrijp dat mijn dossier persoonsgegevens kan bevatten en geef toestemming voor de verwerking hiervan uitsluitend ten behoeve van de analyse van mijn adviesrapport. Het PDF-bestand wordt na analyse niet permanent bewaard.
                </span>
              </label>
              {privacyFout && <p className="text-red-600 text-xs mt-3 font-medium">U dient akkoord te gaan met de privacyverklaring voordat u een dossier kunt uploaden.</p>}
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${isDragOver ? 'border-blue-400 bg-blue-50' : privacyAkkoord ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: 'var(--donkerblauw)' }} />
              <p className="font-semibold text-lg" style={{ color: 'var(--donkerblauw)' }}>Sleep uw PDF hier naartoe of klik om te kiezen</p>
              <p className="text-sm text-gray-400 mt-2">Alleen PDF-bestanden — uw dossier blijft vertrouwelijk</p>
            </div>

            {fout && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-red-700 text-sm text-center">{fout}</div>}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
              <Lock className="w-3 h-3" />
              <span>Beveiligd verstuurd · Versleuteld · Niet gedeeld met derden</span>
            </div>
          </div>
        </section>

        {/* Lerend systeem */}
        <section className="rounded-xl p-6 mb-16 text-sm" style={{ backgroundColor: 'var(--donkerblauw)', color: 'rgba(255,255,255,0.85)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <Brain className="w-8 h-8 mx-auto mb-3 opacity-70" />
            <p>
              <span className="font-semibold text-white">Lerend systeem:</span> Onze tool onthoudt eenheidsprijzen uit eerder geanalyseerde dossiers, zodat ook schades die ten onrechte zijn afgewezen toch een betrouwbare schatting van de gemiste vergoeding krijgen — zelfs als er in uw eigen dossier geen vergelijkbare post staat.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--donkerblauw)', fontFamily: 'Georgia, serif' }}>Veelgestelde vragen</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full text-left px-6 py-4 flex justify-between items-center gap-3 hover:bg-gray-50 transition cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--donkerblauw)' }}>{item.vraag}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{item.antwoord}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
