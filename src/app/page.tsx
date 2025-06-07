
import CalculatorCard from '@/components/calculator-card';
import MainLayout from '@/components/layout/main-layout';
import { calculators } from '@/lib/calculators';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl font-headline">
            Welcome to Global Invest Pro
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-auto">
            Your one-stop solution for various financial calculations, with global currency support.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6 font-headline">
            Our Calculators & Tools
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {calculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
