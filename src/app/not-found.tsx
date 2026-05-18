import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main
        id="main-content"
        className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            404
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Page not found
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has moved. Here are a
            few places that might help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/comparisons"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Compare processors
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Find your match
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
