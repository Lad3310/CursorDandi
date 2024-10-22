'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';
import { supabase } from '@/supabaseClient';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        localStorage.setItem('apiKey', apiKey);
        setNotification({ message: 'Valid API key. Redirecting to protected page...', type: 'success' });
        setTimeout(() => router.push('/dashboards/protected'), 2000);
      } else {
        setNotification({ message: 'Invalid API Key.', type: 'error' });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setNotification({ message: 'Error validating API key.', type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">API Playground</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
            API Key
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="apiKey"
            type="text"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
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
