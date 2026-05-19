const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ size = 'md', color = 'text-blue-600' }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClass} ${color}`}
      role="status"
      aria-label="Loading"
    />
  );
}
