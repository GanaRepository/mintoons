'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Calendar, Award, BookOpen, MessageCircle, Heart, Edit3, Save, X, Camera, Shield } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'mentor' | 'admin';
  ageGroup?: string;
  createdAt: string;
  stats: {
    storiesCount: number;
    commentsCount: number;
    likesReceived: number;
    achievements: number;
  };
  achievements: Achievement[];
  preferences: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showAgeGroup: boolean;
    allowMentorContact: boolean;
  };
}

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'writing' | 'engagement' | 'milestone' | 'special';
}

export default function ProfileClient() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
  
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    ageGroup: '',
    preferences: {
      emailNotifications: true,
      publicProfile: false,
      showAgeGroup: false,
      allowMentorContact: true
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm({
          name: data.profile.name || '',
          username: data.profile.username || '',
          bio: data.profile.bio || '',
          ageGroup: data.profile.ageGroup || '',
          preferences: data.profile.preferences || {
            emailNotifications: true,
            publicProfile: false,
            showAgeGroup: false,
            allowMentorContact: true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        
        // Update session if name changed
        if (editForm.name !== session?.user?.name) {
          await update({ name: editForm.name });
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, avatar: data.avatarUrl } : null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementIcon = (icon: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      '📚': <BookOpen className="w-6 h-6" />,
      '🏆': <Award className="w-6 h-6" />,
      '❤️': <Heart className="w-6 h-6" />,
      '💬': <MessageCircle className="w-6 h-6" />,
      '⭐': <Award className="w-6 h-6" />,
      '🎯': <Award className="w-6 h-6" />
    };
    return icons[icon] || <Award className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                )}
                
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(profile.role)}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.role}
                  </span>
                  
                  {profile.ageGroup && (
                    <span className="text-sm text-gray-600">Age: {profile.ageGroup}</span>
                  )}
                  
                  <span className="text-sm text-gray-500">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setEditForm({
                      name: profile.name || '',
                      username: profile.username || '',
                      bio: profile.bio || '',
                      ageGroup: profile.ageGroup || '',
                      preferences: profile.preferences
                    });
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700">{profile.bio || 'No bio added yet.'}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              
              {profile.username && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>@{profile.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.storiesCount}</div>
            <div className="text-sm text-gray-600">Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profile.stats.commentsCount}</div>
            <div className="text-sm text-gray-600">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{profile.stats.likesReceived}</div>
            <div className="text-sm text-gray-600">Likes Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{profile.stats.achievements}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Created "The Mystery of the Lost Treasure" 2 days ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Received feedback from mentor on "Space Adventure" 3 days ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-700">Got 5 likes on "The Magical Forest" 1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Achievements ({profile.achievements.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {profile.achievements.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet. Keep writing to unlock them!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy & Notifications</h3>
                <div className="space-y-4">
                  {Object.entries({
                    emailNotifications: 'Email notifications',
                    publicProfile: 'Make profile public',
                    showAgeGroup: 'Show age group on profile',
                    allowMentorContact: 'Allow mentors to contact me'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.preferences[key as keyof typeof editForm.preferences]}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              [key]: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}