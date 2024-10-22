'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  LightBulbIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  ReceiptPercentIcon, 
  BookOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { Icon: HomeIcon, label: 'Overview', href: '/dashboards' },
    { Icon: LightBulbIcon, label: 'Research Assistant', href: '/dashboards/research-assistant' },
    { Icon: DocumentTextIcon, label: 'Research Reports', href: '/dashboards/research-reports' },
    { Icon: CodeBracketIcon, label: 'API Playground', href: '/dashboards/playground' },
    { Icon: ReceiptPercentIcon, label: 'Invoices', href: '/dashboards/invoices' },
    { Icon: BookOpenIcon, label: 'Documentation', href: '/dashboards/documentation' },
  ];

  if (!isOpen) return null;

  return (
    <nav className="sidebar bg-white h-screen w-64 py-8 px-4 overflow-y-auto transition-all duration-300 ease-in-out fixed top-0 left-0 z-50">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onClose}
          className="text-purple-500 hover:text-purple-700 focus:outline-none"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      {menuItems.map((item, index) => {
        const Icon = item.Icon;
        const isActive = pathname === item.href;
        return (
          <Link 
            key={index} 
            href={item.href} 
            className={`sidebar-item flex items-center py-3 px-4 mb-2 rounded-lg transition-colors duration-200
              ${isActive || (item.label === 'Overview' && pathname === '/dashboards')
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon className={`h-5 w-5 mr-3 ${isActive || (item.label === 'Overview' && pathname === '/dashboards') ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-sm whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
