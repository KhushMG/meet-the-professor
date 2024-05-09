"use client"
import {
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Welcome() {

  const [isOpen, setIsOpen] = useState(true); // Control the open state
  const handleClose = () => setIsOpen(false); // Handler to close the dialog

  return (
    <Dialog defaultOpen open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="hidden" /> 
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg p-5">
        <DialogHeader>
          <DialogTitle>Welcome to our app!</DialogTitle>
          <DialogDescription>
            We&apos;re excited to have you on board. Let&apos;s get started.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>Let&apos;s go</Button> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
