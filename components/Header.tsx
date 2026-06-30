export default function Header() {
  return (
    <header style={{ backgroundColor: 'var(--donkerblauw)' }} className="text-white py-4 px-6 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="text-2xl">🏚️</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            BevingsAdvies Groningen
          </h1>
          <p className="text-xs opacity-70">Onafhankelijke controle van uw adviesrapport</p>
        </div>
      </div>
    </header>
  );
}
