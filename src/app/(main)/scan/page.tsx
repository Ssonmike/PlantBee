import { Suspense } from "react";
import ScannerClient from "@/components/scan/ScannerClient";

export const metadata = { title: "Escanear planta" };

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ScannerClient />
    </Suspense>
  );
}
