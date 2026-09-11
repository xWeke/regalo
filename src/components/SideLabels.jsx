export default function SideLabels({ left, right }) {
  return (
    <div className="pointer-events-none fixed inset-y-0 z-40 flex w-full justify-between px-4 py-10 sm:px-6">
      {left ? (
        <span
          className="self-end font-sans text-[0.65rem] tracking-[0.35em] uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {left}
        </span>
      ) : (
        <span />
      )}
      {right && (
        <span
          className="self-end font-sans text-[0.65rem] tracking-[0.35em] uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          {right}
        </span>
      )}
    </div>
  )
}
