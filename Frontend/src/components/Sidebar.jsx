// import { NavLink } from 'react-router-dom';
// import { Activity } from 'lucide-react';

// export default function Sidebar({ links = [], role }) {
//   return (
//     <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col px-4 py-6 shrink-0">
//       {/* Logo / Hospital name */}
//       <div className="flex items-center gap-2 px-2 mb-2">
//         <div className="p-1.5 bg-blue-600 rounded-lg text-white">
//           <Activity size={18} />
//         </div>
//         <span className="text-base font-bold text-gray-800 leading-tight">MediCore HMS</span>
//       </div>

//       {/* Role label */}
//       {role && (
//         <p className="px-2 mb-6 text-xs font-medium text-blue-500 uppercase tracking-widest">
//           {role}
//         </p>
//       )}

//       {/* Nav links */}
//       <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
//         {links.map(({ label, path, icon: Icon }) => (
//           <NavLink
//             key={path}
//             to={path}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg ${
//                 isActive
//                   ? 'bg-blue-50 text-blue-600 font-medium'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`
//             }
//           >
//             {Icon && <Icon size={18} />}
//             <span>{label}</span>
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// }


// Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { Activity, X } from 'lucide-react';

export default function Sidebar({
  links = [],
  role,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <div className="rounded-lg bg-blue-600 p-1.5 text-white">
              <Activity size={18} />
            </div>

            <span className="text-base font-bold text-gray-800">
              MediCore HMS
            </span>
          </div>

          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role */}
        {role && (
          <p className="mb-6 px-2 text-xs font-medium uppercase tracking-widest text-blue-500">
            {role}
          </p>
        )}

        {/* Links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {Icon && <Icon size={18} />}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}