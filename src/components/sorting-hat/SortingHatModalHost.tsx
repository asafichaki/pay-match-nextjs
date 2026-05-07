"use client";

// Single mounted PaymentQuiz instance, controlled by useSortingHatModal.
// Place once in the (public)/layout so all components can call openSortingHat().

import PaymentQuiz from "../PaymentQuiz";
import { useSortingHatModal } from "./useSortingHatModal";

export default function SortingHatModalHost() {
  const { open, initialBusinessType, setOpen } = useSortingHatModal();
  return (
    <PaymentQuiz
      open={open}
      onOpenChange={setOpen}
      initialBusinessType={initialBusinessType}
    />
  );
}
