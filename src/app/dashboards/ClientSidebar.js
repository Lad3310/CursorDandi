'use client';

import Sidebar from './sidebar';

export default function ClientSidebar({ isOpen, onClose }) {
  return <Sidebar isOpen={isOpen} onClose={onClose} />;
}
