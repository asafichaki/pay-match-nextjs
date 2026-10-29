"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Microsoft Clarity, loaded everywhere except the pages whose whole purpose is
 * collecting a name, email and phone. Session replay on a lead form is the
 * CIPA exposure; every other form on the site carries data-clarity-mask so
 * what a reader types is never captured.
 *
 * Once loaded, Clarity keeps running on client-side navigation, so a reader who
 * lands on an article and then opens /quiz is still covered by the form mask.
 */
const NO_CLARITY_PREFIXES = ["/quiz", "/thank-you"];

export default function ClarityLoader() {
  const pathname = usePathname() || "/";
  if (NO_CLARITY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wsoc2oyogw");`}
    </Script>
  );
}
