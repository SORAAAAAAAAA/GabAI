import ModalContainer from '@/components/ModalContainer';

export default function SessionLayout({
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