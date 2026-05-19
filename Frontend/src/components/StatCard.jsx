export default function StatCard({ title, value, icon, iconBg = 'bg-blue-100', iconColor = 'text-blue-600', prefix = '' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      {/* Icon */}
      <div className={`p-3 rounded-lg shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {prefix}{value}
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}
