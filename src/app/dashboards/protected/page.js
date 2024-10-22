'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';
import { supabase } from '@/supabaseClient';

export default function Protected() {
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const storedApiKey = localStorage.getItem('apiKey');
      if (!storedApiKey) {
        setNotification({ message: 'No API key found. Redirecting...', type: 'error' });
        setTimeout(() => router.push('/dashboards/playground'), 2000);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('key', storedApiKey)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setNotification({ message: 'Access granted to protected page.', type: 'success' });
        } else {
          throw new Error('Invalid API key');
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setNotification({ message: 'Access denied. Redirecting...', type: 'error' });
        setTimeout(() => router.push('/dashboards/playground'), 2000);
      }
    };

    checkAccess();
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Protected Page</h1>
      <p>This is a protected page that can only be accessed with a valid API key.</p>
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
