import ModalContainer from '@/components/ModalContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalContainer>
      {children}
    </ModalContainer>
  );
}