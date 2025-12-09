import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  HeartIcon,
  MapIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const UserProfile: React.FC = () => {
  const { user, updateProfile, signOut, isAuthenticated, session } = useAuth();
  const { cities } = useData();
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile</p>
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Build an effective user from either the loaded profile or the auth session
  const effectiveUser = user || (session && {
    id: session.user.id,
    email: session.user.email || '',
    full_name:
      (session.user.user_metadata as any)?.full_name ||
      session.user.email ||
      null,
    avatar_url: (session.user.user_metadata as any)?.avatar_url || null,
    favoriteDestinations: [] as string[],
    travel_preferences: {},
    phone: (session.user.user_metadata as any)?.phone || null,
    location: null as string | null,
    created_at: new Date().toISOString(),
    role: 'user',
  });

  if (!effectiveUser) {
    // Should be rare: authenticated but no session/user; show minimal fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your profile</h2>
          <p className="text-gray-600">Please wait a moment while we fetch your account details.</p>
        </div>
      </div>
    );
  }

  const [editForm, setEditForm] = useState({
    full_name: effectiveUser.full_name || effectiveUser.email,
    email: effectiveUser.email,
  });

  const favoriteDestinations = cities.filter((city) =>
    effectiveUser.favoriteDestinations?.includes?.(city.id)
  );

  const handleUpdateProfile = () => {
    updateProfile({
      full_name: editForm.full_name,
      email: editForm.email
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] px-6 sm:px-8 py-6 sm:py-7">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-5 md:gap-7">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-royal-blue to-primary-saffron flex items-center justify-center text-white text-3xl font-semibold shadow-lg shadow-primary-royal-blue/30">
                {(effectiveUser.full_name || effectiveUser.email || '?').trim().charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="text-2xl font-semibold bg-transparent border-b border-primary-saffron focus:outline-none focus:border-primary-royal-blue transition-colors"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="block text-sm text-gray-600 bg-transparent border-b border-slate-300 focus:outline-none focus:border-primary-royal-blue transition-colors"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 rounded-xl bg-primary-royal-blue text-white text-sm font-medium hover:bg-primary-royal-blue/90 transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {effectiveUser.full_name || effectiveUser.email.split('@')[0]}
                  </h1>
                  <p className="text-sm text-slate-600">{effectiveUser.email}</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-saffron text-white text-sm font-medium hover:bg-primary-saffron/90 transition-colors duration-200 shadow-sm"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={signOut}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors duration-200 border border-red-100"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center md:text-right">
              <div className="inline-flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-orange-50 border border-orange-100">
                <span className="text-xl font-semibold text-primary-saffron">
                  {favoriteDestinations.length}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-orange-700/80">
                  Favorites
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Favorite Destinations */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-[0_16px_30px_rgba(15,23,42,0.06)] p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  Favorite Destinations
                </h2>
              </div>

              {favoriteDestinations.length === 0 ? (
                <div className="text-center py-10">
                  <HeartIcon className="h-16 w-16 text-red-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No favorites yet</h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    Start exploring India and tap the heart icon to save places you love.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary-saffron text-white text-sm font-medium shadow hover:bg-primary-saffron/90 transition-colors duration-200"
                  >
                    Explore Destinations
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {favoriteDestinations.map((city) => (
                    <Link
                      key={city.id}
                      to={`/city/${city.id}`}
                      className="group block"
                    >
                      <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-saffron/50 transition-all duration-200 bg-white">
                        <img
                          src={(city as any).image_url || (city as any).imageUrl || '/images/placeholder.jpg'}
                          alt={city.name}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 mb-1">{city.name}</h3>
                          <p className="text-slate-600 text-xs mb-2 uppercase tracking-wide">{city.state}</p>
                          <p className="text-slate-500 text-sm line-clamp-2">{city.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Travel Stats */}
            <div className="rounded-3xl bg-slate-900 text-slate-50 p-6 shadow-[0_16px_30px_rgba(15,23,42,0.6)]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-4 flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-primary-saffron" />
                Travel snapshot
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Cities favorited</span>
                  <span className="font-semibold text-primary-saffron">{favoriteDestinations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Itineraries created</span>
                  <span className="font-semibold text-emerald-300">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Reviews written</span>
                  <span className="font-semibold text-sky-300">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary-royal-blue" />
                Recent activity
              </h3>
              <div className="space-y-4">
                <div className="text-center py-6">
                  <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">No trips on record yet.</p>
                  <p className="text-slate-500 text-xs">Plan or favorite a destination to see your journey here.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick actions</h3>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary-saffron text-white text-sm font-medium hover:bg-primary-saffron/90 transition-colors"
                >
                  Explore destinations
                </Link>
                <button className="block w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 hover:bg-slate-50 transition-colors">
                  Create itinerary
                </button>
                <button className="block w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 hover:bg-slate-50 transition-colors">
                  View travel tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;