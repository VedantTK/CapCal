import SiteHeader from '@/components/site-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="fade-in">
        {children}
      </main>
      <footer className="border-t border-border bg-muted/30">
        <div className="container-simple py-8">
          <div className="text-center space-y-4">
            <p className="text-small">
              © {new Date().getFullYear()} Financial Calculator. All rights reserved.
            </p>
            <p className="text-small">
              Professional financial calculators for investment planning and analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}