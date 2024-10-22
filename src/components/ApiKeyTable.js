import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, ClipboardIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function ApiKeyTable({ apiKeys, onEdit, onDelete, onCopy }) {
  const [visibleKeys, setVisibleKeys] = useState({});

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
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
            <td className="py-4">{apiKey.usage}</td>
            <td className="py-4">
              {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}
              <button onClick={() => toggleKeyVisibility(apiKey.id)} className="ml-2">
                {visibleKeys[apiKey.id] ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </td>
            <td className="py-4">
              <button onClick={() => onCopy(apiKey.key)} className="mr-2">
                <ClipboardIcon className="h-5 w-5" />
              </button>
              <button onClick={() => onEdit(apiKey)} className="mr-2">
                <PencilIcon className="h-5 w-5" />
              </button>
              <button onClick={() => onDelete(apiKey)}>
                <TrashIcon className="h-5 w-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
