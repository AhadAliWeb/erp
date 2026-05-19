const variantClasses = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ label, variant = 'default' }) {
  const classes = variantClasses[variant] || variantClasses.default;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium inline-block ${classes}`}>
      {label}
    </span>
  );
}
