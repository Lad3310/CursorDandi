'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  console.log('Auth Error Details:', {
    error,
    fullParams: Object.fromEntries(searchParams.entries())
  });
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-red-500">Error: {error}</p>
      <pre className="bg-gray-100 p-4 mt-4 rounded">
        {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
      </pre>
    </div>
  );
} 