import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, LogOut, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types/group';
import { getUserGroups, createGroup, leaveGroup, createGroupInvite } from '../services/groupService';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      loadGroups();
    }
  }, [currentUser]);

  const loadGroups = async () => {
    if (!currentUser?.email) return;

    try {
      const userGroups = await getUserGroups(currentUser.email);
      setGroups(userGroups);
      setError(null);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    try {
      await createGroup(
        currentUser.email,
        currentUser.email.split('@')[0],
        groupName,
        groupDescription,
        isPrivate
      );
      
      setSuccess('Group created successfully!');
      setShowCreateForm(false);
      setGroupName('');
      setGroupDescription('');
      setIsPrivate(false);
      await loadGroups();
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser?.email || !window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await leaveGroup(currentUser.email, groupId);
      setSuccess('You have left the group.');
      await loadGroups();
    } catch (err: any) {
      setError(err.message || 'Failed to leave group. Please try again.');
    }
  };

  const handleCreateInvite = async (groupId: string) => {
    try {
      const inviteCode = await createGroupInvite(groupId);
      await loadGroups();
      
      // Create the full invite URL
      const inviteUrl = `${window.location.origin}/groups/invite/${inviteCode}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteId(groupId);
      
      setSuccess('Invite link copied to clipboard!');
      
      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedInviteId(null);
      }, 3000);
    } catch (err) {
      setError('Failed to generate invite link. Please try again.');
    }
  };

  const copyInviteLink = async (groupId: string, inviteCode: string) => {
    try {
      const inviteUrl = `${window.location.origin}/groups/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteId(groupId);
      setSuccess('Invite link copied to clipboard!');
      
      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedInviteId(null);
      }, 3000);
    } catch (err) {
      setError('Failed to copy invite link. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                Make this group private (invite-only)
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                {group.description && (
                  <p className="text-gray-600 mt-1">{group.description}</p>
                )}
              </div>
              {group.isPrivate && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  Private
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{Object.keys(group.members).length} members</span>
            </div>

            {currentUser?.email && group.members[currentUser.email.replace(/\./g, ',')]?.role === 'owner' && (
              <div className="border-t mt-4 pt-4 space-y-2">
                {group.inviteCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">Share this invite link:</div>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded block overflow-x-auto">
                        {`${window.location.origin}/groups/invite/${group.inviteCode}`}
                      </code>
                    </div>
                    <button
                      onClick={() => copyInviteLink(group.id, group.inviteCode!)}
                      className="p-2 text-gray-500 hover:text-indigo-600 transition"
                      title="Copy invite link"
                    >
                      {copiedInviteId === group.id ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreateInvite(group.id)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Generate Invite Link</span>
                  </button>
                )}
              </div>
            )}

            {currentUser?.email && group.members[currentUser.email.replace(/\./g, ',')]?.role !== 'owner' && (
              <div className="border-t mt-4 pt-4">
                <button
                  onClick={() => handleLeaveGroup(group.id)}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Leave Group</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">You haven't joined any groups yet.</p>
            <p className="text-sm text-gray-500">Create your first group using the button above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Groups;