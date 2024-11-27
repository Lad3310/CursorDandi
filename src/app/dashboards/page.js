'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';
import Notification from '@/components/Notification';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Add this new component
const CurrentPlan = () => (
  <div className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl p-8 text-white mb-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold">CURRENT PLAN</h2>
      <button className="bg-white text-orange-500 px-4 py-2 rounded-full text-sm">Manage Plan</button>
    </div>
    <h3 className="text-4xl font-bold mb-4">Researcher</h3>
    <p className="mb-2">API Limit</p>
    <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
      <div className="bg-white h-full rounded-full" style={{width: '0%'}}></div>
    </div>
    <p>0 / 1,000 Requests</p>
  </div>
);

export default function ApiKeyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchApiKeys = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', session.user.id);
    if (error) {
      console.error('Error fetching API keys:', error);
    } else {
      setApiKeys(data);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const memoizedFetchApiKeys = useCallback(fetchApiKeys, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      memoizedFetchApiKeys();
    }
  }, [session, memoizedFetchApiKeys]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateKeyModal = () => {
    setIsModalOpen(true);
    setEditingKey(null);
    setNewKeyName('');
  };

  const openEditKeyModal = (apiKey) => {
    setIsModalOpen(true);
    setEditingKey(apiKey);
    setNewKeyName(apiKey.name);
  };

  const handleCreateOrUpdateKey = async () => {
    if (editingKey) {
      // Update existing key
      const { error } = await supabase
        .from('api_keys')
        .update({ name: newKeyName })
        .eq('id', editingKey.id)
        .eq('user_id', session.user.id);
      if (error) {
        console.error('Error updating API key:', error);
        showNotification('Error updating API key', 'error');
      } else {
        showNotification('API key updated successfully', 'success');
      }
    } else {
      // Create new key
      const { error } = await supabase
        .from('api_keys')
        .insert([{ 
          name: newKeyName, 
          key: generateApiKey(),
          user_id: session.user.id 
        }]);
      if (error) {
        console.error('Error creating API key:', error);
        showNotification('Error creating API key', 'error');
      } else {
        showNotification('API key created successfully', 'success');
      }
    }
    setIsModalOpen(false);
    fetchApiKeys();
  };

  const handleDeleteKey = async (apiKey) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', apiKey.id);
    if (error) {
      console.error('Error deleting API key:', error);
      showNotification('Error deleting API key', 'error');
    } else {
      showNotification('API key deleted successfully', 'error'); // Changed to 'error' for red color
      fetchApiKeys();
    }
  };

  const generateApiKey = () => {
    return 'dandi-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    showNotification('API key copied to clipboard', 'info');
  };

  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      {/* Add the CurrentPlan component here */}
      <CurrentPlan />

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <button
            onClick={openCreateKeyModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition"
          >
            + Create New Key
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">NAME</th>
              <th className="pb-2">USAGE</th>
              <th className="pb-2">KEY</th>
              <th className="pb-2">OPTIONS</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="border-t border-gray-200">
                <td className="py-4">{apiKey.name}</td>
                <td className="py-4">{apiKey.usage || 0}</td>
                <td className="py-4">
                  {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                  <button onClick={() => toggleKeyVisibility(apiKey.id)} className="ml-2 text-gray-400 hover:text-gray-600">
                    {visibleKeys[apiKey.id] ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </td>
                <td className="py-4 flex items-center space-x-2">
                  <button 
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Copy API Key"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => openEditKeyModal(apiKey)}
                    className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                    title="Edit API Key"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteKey(apiKey)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete API Key"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">Have any questions, feedback or need support? We would love to hear from you!</p>
        <button className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-600 transition">
          Contact us
        </button>
      </div>

      {/* Create/Edit Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{editingKey ? 'Edit API Key' : 'Create New API Key'}</h2>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Enter key name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrUpdateKey}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingKey ? 'Update Key' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
