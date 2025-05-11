
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

const ComplianceModal = ({ isOpen, onClose, onAcknowledge }: ComplianceModalProps) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">Important Compliance Information</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base text-muted-foreground space-y-3 pt-2">
            <p>
              By using Lexy, you acknowledge and agree to the following:
            </p>
            <p>
              <strong>NDA Protection:</strong> All data processed through Lexy is treated with strict confidentiality, akin to Non-Disclosure Agreement standards. Your proprietary information is secure.
            </p>
            <p>
              <strong>Authorized Use of BOP Transcriptions:</strong> You confirm that you have the necessary rights and authorizations to transcribe any audio or video content, especially those involving identifiable individuals or groups, and specifically any content related to the Bureau of Prisons (BOP). Lexy is to be used responsibly and legally.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction onClick={onAcknowledge} className="w-full">
            I Acknowledge and Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ComplianceModal;
