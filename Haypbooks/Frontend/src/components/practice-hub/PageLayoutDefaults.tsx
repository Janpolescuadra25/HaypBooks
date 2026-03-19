"use client"

/**
 * PageLayoutDefaults – invisible component that injects per-page CSS variable
 * defaults for the Practice Hub layout (sidebar offsets, topbar sizing, etc.).
 * Renders nothing visible; only emits a <style> tag consumed by layout utilities.
 */

export default function PageLayoutDefaults() {
  return (
    <style>{`
      :root {
        --ph-pbar-ml: 0px;
        --ph-pbar-mr: 0px;
        --ph-sbar-ml: 0px;
        --ph-sbar-mr: 0px;
        --hb-topbar-top: 12px;
        --hb-topbar-height: 48px;
        --hb-topbar-height-sm: 40px;
      }
    `}</style>
  )
}
