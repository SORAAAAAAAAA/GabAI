'use client';

import ModalContainer from '@/components/ModalContainer';
import Sidebar from '@/components/sidebar';

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalContainer>
      <div className="flex h-screen w-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </ModalContainer>
  );
}