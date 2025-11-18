interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>
        
        {/* Form Content */}
        <div className="space-y-6">
          {children}
        </div>
        
        {/* Footer Section */}
        {footer && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-center text-gray-600">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
