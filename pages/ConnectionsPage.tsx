
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Theme, Language, User } from '../types';
import { translations } from '../translations';
import { MOCK_USERS } from '../constants';
import * as Icons from '../components/Icons';

interface ConnectionsPageProps {
  theme: Theme;
  language: Language;
  connectedUserIds: string[];
  onToggleConnect: (userId: string) => void;
}

const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ 
  theme, language, connectedUserIds, onToggleConnect 
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.handle.toLowerCase().includes(search.toLowerCase())
  );

  const suggestedUsers = filteredUsers.filter(u => !connectedUserIds.includes(u.id));
  const myConnections = filteredUsers.filter(u => connectedUserIds.includes(u.id));

  // Added key prop to the type definition to fix the "Property 'key' does not exist" error
  const UserRow = ({ user, isConnected }: { user: User; isConnected: boolean; key?: string | number }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border mb-3 transition-all ${
      isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <Link to={`/u/${user.handle.replace(/^@/, '')}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
        <div>
          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h4>
          <p className="text-xs text-gray-500">{user.handle}</p>
        </div>
      </Link>
      <button 
        onClick={() => onToggleConnect(user.id)}
        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
          isConnected 
            ? (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
            : (isDark ? 'bg-white text-black' : 'bg-black text-white shadow-lg shadow-black/10')
        }`}
      >
        {isConnected ? t.connected : t.connect}
      </button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{t.connections}</h1>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 focus-within:border-gray-400'
        }`}>
          <Icons.Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t.searchUser}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="space-y-10">
        {suggestedUsers.length > 0 && (
          <section>
            <h3 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.suggested}</h3>
            <div className="flex flex-col">
              {suggestedUsers.map(user => <UserRow key={user.id} user={user} isConnected={false} />)}
            </div>
          </section>
        )}

        <section>
          <h3 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.myConnections} ({myConnections.length})</h3>
          <div className="flex flex-col">
            {myConnections.map(user => <UserRow key={user.id} user={user} isConnected={true} />)}
            {myConnections.length === 0 && (
              <div className={`p-10 rounded-3xl border-2 border-dashed text-center ${isDark ? 'border-gray-800 text-gray-700' : 'border-gray-50 text-gray-400'}`}>
                <p className="text-xs font-medium tracking-tight">Belum ada koneksi. Mulai jalin hubungan baru!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConnectionsPage;
