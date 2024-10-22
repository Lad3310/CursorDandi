'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';

export default function Protected() {
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/validate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey: localStorage.getItem('apiKey') }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setNotification({ message: 'Access granted to protected page.', type: 'success' });
        } else {
          throw new Error('Access denied');
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
