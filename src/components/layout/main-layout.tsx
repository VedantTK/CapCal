import SiteHeader from '@/components/site-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Global Invest Pro © {new Date().getFullYear()}. All results are estimates and subject to market risks.
      </footer>
    </div>
  );
}
