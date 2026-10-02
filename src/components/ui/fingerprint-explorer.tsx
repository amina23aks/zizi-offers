"use client";

import { X } from "@phosphor-icons/react";
import { useState } from "react";
import { fingerprintNames } from "@/data/catalog";
import { FingerPrintIcon } from "@/components/ui/animated-icons";

export function FingerprintExplorer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(fingerprintNames[0]);

  return (
    <section className="fingerprint-panel" aria-labelledby="fingerprints-title">
      <div className="fingerprint-intro">
        <button
          type="button"
          className="fingerprint-button"
          aria-expanded={open}
          aria-controls="fingerprint-list"
          onClick={() => setOpen((value) => !value)}
        >
          <FingerPrintIcon className="fingerprint-icon" size={58} />
          <span>استكشفي البصمات</span>
        </button>
      </div>

      {open ? (
        <div id="fingerprint-list" className="fingerprint-list">
          <div className="fingerprint-list-head">
            <h2 id="fingerprints-title">البصمات</h2>
            <button type="button" className="icon-button subtle" onClick={() => setOpen(false)} aria-label="إغلاق">
              <X size={18} weight="bold" />
            </button>
          </div>
          <div className="fingerprint-name-grid">
            {fingerprintNames.map((name) => (
              <button
                key={name}
                type="button"
                className={selected === name ? "selected" : undefined}
                aria-pressed={selected === name}
                onClick={() => setSelected(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
