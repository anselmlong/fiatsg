"use client";

import { useEffect, useRef } from "react";

// Brings its parent into view on arrival, e.g. a confirmation the visitor lands on below the fold.
export function ScrollIntoView() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ref.current?.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  return <span ref={ref} hidden />;
}
