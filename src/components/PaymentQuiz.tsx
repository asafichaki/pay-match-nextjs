"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CreditCard } from "lucide-react";
import SortingHat from "./sorting-hat/SortingHat";
import type { BusinessType } from "@/lib/funnel/types";

interface PaymentQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBusinessType?: BusinessType | null;
}

const PaymentQuiz = ({ open, onOpenChange, initialBusinessType = null }: PaymentQuizProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4 sr-only">
          <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Find Your Match
          </DialogTitle>
        </DialogHeader>

        <SortingHat
          onComplete={handleClose}
          variant="popup"
          initialBusinessType={initialBusinessType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentQuiz;
