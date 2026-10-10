"use client";

import type { ComponentProps } from "react";

// A GET form that applies itself as soon as any choice changes.
export function AutoSubmitForm(props: ComponentProps<"form">) {
  return <form method="get" {...props} onChange={(e) => e.currentTarget.requestSubmit()} />;
}
