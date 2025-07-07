'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserPlus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
  MessageCircle,
  BookOpen,
  Award,
  Ban,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  ageGroup?: string;
  createdAt: string;
  lastActive?: string;
  emailVerified: boolean;
  stats: {
    storiesCount: number;
    commentsCount: number;
    likesReceived: number;
  };
  avatar?: string;
}

interface BulkAction {
  type: 'update_role' | 'update_status' | 'send_email' | 'export';
  data?: any;
}

export default function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    students: 0,
    mentors: 0,
    admins: 0,
    activeUsers: 0,
    suspendedUsers: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = async (
    userId: string,
    updates: Partial<User>,
    reason?: string
  ) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates, reason }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
        setEditingUser(null);
        setShowEditModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleUserDelete = async (userId: string, permanent = false) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    const confirmMessage = permanent
      ? `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all their data.`
      : `Are you sure you want to deactivate ${user.name}? Their account will be suspended and data anonymized.`;

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(
        `/api/admin/users?userId=${userId}&permanent=${permanent}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    const userIds = Array.from(selectedUsers);
    if (userIds.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: `bulk_${action.type}`,
          userIds,
          data: action.data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Bulk action completed. Affected ${result.affectedUsers} users.`);
        setSelectedUsers(new Set());
        setShowBulkActions(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Bulk action failed');
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u._id)));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'suspended':
        return <Ban className="w-4 h-4" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage platform users, roles, and permissions
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {selectedUsers.size > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Bulk Actions ({selectedUsers.size})
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalUsers}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>

        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-600">
            {summary.students}
          </div>
          <div className="text-sm text-gray-600">Students</div>
        </div>

        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {summary.mentors}
          </div>
          <div className="text-sm text-gray-600">Mentors</div>
        </div>

        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-red-600">
            {summary.admins}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>

        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {summary.activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>

        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-orange-600">
            {summary.suspendedUsers}
          </div>
          <div className="text-sm text-gray-600">Suspended</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="lastActive-desc">Recently Active</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.size === users.length && users.length > 0
                    }
                    onChange={selectAllUsers}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="rounded"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.ageGroup && (
                            <div className="text-xs text-gray-400">
                              Age: {user.ageGroup}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}
                      >
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{user.stats.storiesCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{user.stats.commentsCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{user.stats.likesReceived}</span>
                        </div>
                      </div>
                      {user.lastActive && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last active:{' '}
                          {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!user.emailVerified && (
                        <div className="text-xs text-red-500 mt-1">
                          Email not verified
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleUserDelete(user._id, false)}
                          className="p-1 text-orange-600 hover:text-orange-800"
                          title="Suspend user"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleUserDelete(user._id, true)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete user permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button className="p-1 text-gray-600 hover:text-gray-800">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Bulk Actions ({selectedUsers.size} users)
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const role = prompt(
                    'Enter new role (student, mentor, admin):'
                  );
                  if (role && ['student', 'mentor', 'admin'].includes(role)) {
                    handleBulkAction({ type: 'update_role', data: { role } });
                  }
                }}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">Update Role</div>
                <div className="text-sm text-gray-600">
                  Change role for selected users
                </div>
              </button>

              <button
                onClick={() => {
                  const status = prompt(
                    'Enter new status (active, suspended):'
                  );
                  if (status && ['active', 'suspended'].includes(status)) {
                    handleBulkAction({
                      type: 'update_status',
                      data: { status },
                    });
                  }
                }}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">Update Status</div>
                <div className="text-sm text-gray-600">
                  Change status for selected users
                </div>
              </button>

              <button
                onClick={() => {
                  const subject = prompt('Email subject:');
                  const template = prompt('Email template name:');
                  if (subject && template) {
                    handleBulkAction({
                      type: 'send_email',
                      data: { subject, template },
                    });
                  }
                }}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">Send Email</div>
                <div className="text-sm text-gray-600">
                  Send bulk email to selected users
                </div>
              </button>

              <button
                onClick={() => handleBulkAction({ type: 'export' })}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-gray-600">
                  Export selected users data
                </div>
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBulkActions(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit User: {editingUser.name}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updates = {
                  name: formData.get('name') as string,
                  role: formData.get('role') as string,
                  status: formData.get('status') as string,
                  ageGroup: formData.get('ageGroup') as string,
                };
                const reason = formData.get('reason') as string;
                handleUserUpdate(editingUser._id, updates, reason);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser.status}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    name="ageGroup"
                    defaultValue={editingUser.ageGroup || ''}
                    placeholder="e.g., 8-12"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason for Change
                  </label>
                  <textarea
                    name="reason"
                    placeholder="Explain why you're making this change..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as string,
                  ageGroup: formData.get('ageGroup') as string,
                  sendWelcomeEmail:
                    (formData.get('sendWelcomeEmail') as string) === 'on',
                };

                try {
                  const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    alert(
                      `User created successfully! ${userData.sendWelcomeEmail ? 'Welcome email sent.' : `Temporary password: ${result.tempPassword}`}`
                    );
                    setShowCreateModal(false);
                    fetchUsers();
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to create user');
                  }
                } catch (error) {
                  console.error('Error creating user:', error);
                  alert('Failed to create user');
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border rounded-lg"
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border rounded-lg"
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    name="ageGroup"
                    placeholder="e.g., 8-12"
                    className="w-full p-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional for mentors and admins
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="sendWelcomeEmail"
                    id="sendWelcomeEmail"
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor="sendWelcomeEmail" className="text-sm">
                    Send welcome email with login credentials
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> A temporary password will be
                    generated. The user will be required to change it on first
                    login.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
