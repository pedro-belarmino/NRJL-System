import React, { useState } from 'react';
import { addToWhitelist } from '../../services/authService';
import type { Role } from '../../types/auth';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhitelistPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('facilitator');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const ALLOWED_DOMAIN = '@escoteiros';
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      setMessage({ type: 'error', text: `Email must end with ${ALLOWED_DOMAIN}` });
      setLoading(false);
      return;
    }

    try {
      await addToWhitelist(email, role);
      setMessage({ type: 'success', text: `User ${email} added successfully as ${role}!` });
      setEmail('');
      setRole('facilitator');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user to whitelist';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Whitelist Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register new users in the system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`p-4 rounded-md flex items-start space-x-3 ${
              message.type === 'success' ? 'bg-green-50 border-l-4 border-green-400 text-green-700' : 'bg-red-50 border-l-4 border-red-400 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="user@escoteiros"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Role
              </label>
              <select
                id="role"
                name="role"
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="facilitator">Facilitator (Read-only)</option>
                <option value="coordinator">Coordinator (Manage Facilitators)</option>
                <option value="developer">Developer (Full Access)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Add to Whitelist"}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500 text-center"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhitelistPage;
