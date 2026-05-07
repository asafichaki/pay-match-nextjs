import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import StickyCTABar from "@/components/StickyCTABar";
import SortingHatModalHost from "@/components/sorting-hat/SortingHatModalHost";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <ExitIntentPopup />
      <StickyCTABar />
      <SortingHatModalHost />
    </>
  );
}
