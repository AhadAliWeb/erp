import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
          <ShieldOff size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Access Denied</h1>
        <p className="text-[#64748B] mb-6">You don't have permission to view this page.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#002365] text-white rounded-lg px-6 py-2.5 text-sm hover:bg-[#0033A0] transition-all duration-150"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}