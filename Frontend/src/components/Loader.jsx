import Spinner from './Spinner';

export default function Loader({ fullPage = false, message = 'Loading...' }) {
  const base = 'flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm z-40';
  const positionClass = fullPage
    ? 'fixed inset-0'
    : 'absolute inset-0';

  return (
    <div className={`${base} ${positionClass}`} role="status" aria-live="polite">
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      )}
    </div>
  );
}
