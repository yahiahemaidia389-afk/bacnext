import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserAccount } from '../../types';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Search,
  Eye,
  ArrowUpRight,
  UserMinus,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  Calendar,
  Mail,
  BookOpen,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { users, currentUser, promoteUserToAdmin, demoteAdminToStudent } = useAuth();
  const { t, isRTL } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalStudents = users.filter((u) => u.role === 'student').length;

  const handlePromote = async (user: UserAccount) => {
    setActionFeedback(null);
    const res = await promoteUserToAdmin(user.id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `${user.full_name} a été promu Administrateur avec succès.`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Erreur lors de la promotion.',
      });
    }
  };

  const handleDemote = async (user: UserAccount) => {
    setActionFeedback(null);
    if (currentUser?.id === user.id) {
      setActionFeedback({
        type: 'error',
        message: t.admin.selfDemoteForbidden,
      });
      return;
    }

    const res = await demoteAdminToStudent(user.id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `${user.full_name} a été rétrogradé au rôle Étudiant.`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Erreur lors de la rétrogradation.',
      });
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Explanatory Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{t.admin.howToAddAdminTitle}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Workflow Sécurisé
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.admin.howToAddAdminDesc}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs text-slate-300">
                <span className="font-bold text-amber-400">Étape 1 :</span> Création de compte normal (étudiant)
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs text-slate-300">
                <span className="font-bold text-amber-400">Étape 2 :</span> Sélection dans la table ci-dessous
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs text-slate-300">
                <span className="font-bold text-amber-400">Étape 3 :</span> Clic sur « Promouvoir Admin »
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Utilisateurs Inscrits</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{users.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-[#131B2E] border border-amber-200 dark:border-amber-500/30 shadow-xs">
          <div className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.admin.cardTotalAdmins}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{totalAdmins}</div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-500/30 shadow-xs">
          <div className="text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.admin.cardTotalStudents}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{totalStudents}</div>
        </div>
      </div>

      {/* Action notification toast */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-500/50 text-rose-800 dark:text-rose-200'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{actionFeedback.message}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search
            className={`w-4 h-4 text-slate-400 absolute top-3 ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          />
          <input
            id="admin-users-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className={`w-full py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-colors ${
              isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          {(['all', 'admin', 'student'] as const).map((r) => (
            <button
              key={r}
              id={`filter-role-${r}`}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {r === 'all' ? 'Tous' : r === 'admin' ? 'Admins' : 'Étudiants'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t.admin.userColName}</th>
                <th className="py-3.5 px-4">{t.admin.userColRole}</th>
                <th className="py-3.5 px-4">{t.admin.userColStream}</th>
                <th className="py-3.5 px-4">{t.admin.userColCreated}</th>
                <th className="py-3.5 px-4 text-right">{t.admin.userColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">{t.admin.emptyList}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isUserAdmin = u.role === 'admin';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/40">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isUserAdmin
                              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                              : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40'
                          }`}
                        >
                          {isUserAdmin ? (
                            <>
                              <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>{t.auth.roleAdmin}</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>{t.auth.roleStudent}</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {u.stream === 'mathematiques'
                          ? t.common.streamMathShort
                          : t.common.streamSciShort}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {u.created_at ? u.created_at.split('T')[0] : '2026-09-01'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            id={`user-view-${u.id}`}
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={t.admin.viewDetails}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Role Action Button */}
                          {!isUserAdmin ? (
                            <button
                              id={`promote-btn-${u.id}`}
                              onClick={() => handlePromote(u)}
                              className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title={t.admin.promoteToAdmin}
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>{t.admin.promoteToAdmin}</span>
                            </button>
                          ) : (
                            <button
                              id={`demote-btn-${u.id}`}
                              disabled={isSelf}
                              onClick={() => handleDemote(u)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                isSelf
                                  ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/40 cursor-not-allowed'
                                  : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
                              }`}
                              title={
                                isSelf
                                  ? t.admin.selfDemoteForbidden
                                  : t.admin.demoteToStudent
                              }
                            >
                              <UserMinus className="w-3 h-3" />
                              <span>{t.admin.demoteToStudent}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t.admin.userDetailsTitle}</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-xs">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedUser.full_name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedUser.email}</div>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedUser.role === 'admin'
                          ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                          : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40'
                      }`}
                    >
                      {selectedUser.role === 'admin' ? t.auth.roleAdmin : t.auth.roleStudent}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Identifiant Supabase / ID :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 truncate max-w-[200px]">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Filière d’études :</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {selectedUser.stream === 'mathematiques'
                      ? t.common.streamMath
                      : t.common.streamSci}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Langue préférée :</span>
                  <span className="text-slate-800 dark:text-slate-200 uppercase">{selectedUser.language}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Date d'inscription :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300">
                    {selectedUser.created_at || '2026-09-01'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
