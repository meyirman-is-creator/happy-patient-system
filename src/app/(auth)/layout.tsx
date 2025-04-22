export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary">
            Happy Patient
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Medical center appointment management system
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 border">
          {children}
        </div>
      </div>
    </div>
  );
}
