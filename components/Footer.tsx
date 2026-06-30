export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--donkerblauw)' }} className="text-white mt-auto py-6 px-6 text-center text-sm opacity-80">
      <p>Onafhankelijk adviesbureau. Niet gelieerd aan enige beoordelende of uitvoerende partij in het schadeherstelproces.</p>
      <p className="mt-1 opacity-60">© {new Date().getFullYear()} BevingsAdvies Groningen</p>
    </footer>
  );
}
