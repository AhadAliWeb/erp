// import { LogOut } from 'lucide-react';
// import Badge from './Badge';

// export default function Navbar({ title, user, onLogout }) {
//   return (
//     <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//       <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
//           <Badge label={user?.role} variant="info" />
//         </div>
//         <button
//           onClick={onLogout}
//           className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
//           aria-label="Logout"
//         >
//           <LogOut size={16} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </nav>
//   );
// }

// Navbar.jsx
import { LogOut, Menu } from 'lucide-react';
import Badge from './Badge';

export default function Navbar({
  title,
  user,
  role,
  onLogout,
  onMenuClick,
}) {

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-base font-semibold text-gray-800 sm:text-lg">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-medium text-gray-700">
            {user?.fullName}
          </span>

          <Badge label={role} variant="info" />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={18} />

          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}