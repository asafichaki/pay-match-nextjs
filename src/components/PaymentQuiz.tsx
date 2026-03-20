"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CreditCard } from "lucide-react";
import QuizContent from "./QuizContent";

interface PaymentQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentQuiz = ({ open, onOpenChange }: PaymentQuizProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 [&>button]:hidden">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Find Your Perfect Payment Processor
          </DialogTitle>
        </DialogHeader>

        <QuizContent onComplete={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentQuiz;
