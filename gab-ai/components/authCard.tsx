interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      {children}
      {footer && <div className="mt-4 text-sm text-center">{footer}</div>}
    </div>
  );
}
