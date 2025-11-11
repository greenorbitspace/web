import React from "react";

/**
 * CTA Component
 * A reusable call-to-action button for the Green Orbit website.
 *
 * Props:
 * - text: string — button label
 * - link: string — destination URL
 * - icon: React component (optional) — e.g. from lucide-react
 * - bgColor: string (optional) — Tailwind background class
 * - hoverColor: string (optional) — Tailwind hover state
 * - textColor: string (optional) — Tailwind text color
 * - fullWidth: boolean (optional) — expands CTA to full width
 */

export default function CTA({
  text,
  link = "#",
  icon: Icon,
  bgColor = "bg-accent-500",
  hoverColor = "hover:bg-accent-700",
  textColor = "text-white",
  fullWidth = false,
}) {
  return (
    <a
      href={link}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-2xl font-semibold text-base transition-colors duration-200
        shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
        ${bgColor} ${hoverColor} ${textColor}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{text}</span>
    </a>
  );
}