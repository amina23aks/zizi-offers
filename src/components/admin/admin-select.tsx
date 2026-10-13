"use client";

import type { SelectHTMLAttributes } from "react";

// A native select preserves keyboard/touch navigation and viewport-aware menus.
export function AdminSelect({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} dir="rtl" className={`admin-select ${className}`}>{children}</select>;
}
