"use client";
// `app/template.tsx`

import { useMobile } from "../context/mobile/mobileContext";
import Image from "next/image";
import loadingGif from "../assets/cargando/loading2.gif";

export default function Template({ children }: { children: React.ReactNode }) {
  const { hasWindow } = useMobile();
  return (
    <>
      {hasWindow ? (
        <>{children}</>
      ) : (
        <div className="flex box-xxl m-height-full a-center j-center">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
        </div>
      )}
    </>
  );
}
