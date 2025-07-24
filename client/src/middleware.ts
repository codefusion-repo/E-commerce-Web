import { verify } from "crypto";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Definir un tipo para la función que será throttled
type Procedure = (...args: any[]) => void;

// Función de throttle con tipos de TypeScript
function throttle(func: Procedure, limit: number): Procedure {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next();

  const areCookiesActive = request.cookies.get("areCookiesActive");

  if (!areCookiesActive) {
    response.cookies.set("areCookiesActive", "true");
  }

  const areMessagesActive = request.cookies.get("areMessagesActive");

  if (!areMessagesActive) {
    response.cookies.set("areMessagesActive", "true");
  }

  return response;
}
