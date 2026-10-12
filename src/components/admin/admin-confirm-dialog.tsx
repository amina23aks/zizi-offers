"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function AdminConfirmDialog({
  open,
  busy,
  title,
  children,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  busy: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => cancelRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!busy) onCancel();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [busy, onCancel, open]);

  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <div ref={panelRef} className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <h3 id="admin-confirm-title">{title}</h3>
        <div className="admin-dialog-body">{children}</div>
        <div className="admin-dialog-actions">
          <button ref={cancelRef} type="button" className="admin-secondary" disabled={busy} onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={danger ? "admin-danger" : "admin-primary"} disabled={busy} onClick={() => void onConfirm()}>{busy ? "جارٍ التنفيذ…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
