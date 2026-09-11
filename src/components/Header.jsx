export default function Header({ mark = 'Para ti', backVisible = false, onBack }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-6 py-8 sm:px-10">
      <span className="pointer-events-auto font-display text-lg tracking-tight">{mark}</span>
      <button
        type="button"
        onClick={onBack}
        data-cursor="grow"
        tabIndex={backVisible ? 0 : -1}
        aria-hidden={!backVisible}
        className={`group flex items-center gap-3 font-sans text-xs tracking-[0.25em] uppercase transition-opacity duration-700 hover:opacity-70 ${
          backVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span className="inline-block h-px w-8 bg-current transition-all group-hover:w-12" />
        Volver al inicio
      </button>
    </header>
  )
}
