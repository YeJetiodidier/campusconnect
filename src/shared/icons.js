// src/shared/icons.js
// Small inline SVG icons (stroke-based, 20x20) used across the sidebar,
// stat cards, and panels — replaces emoji glyphs for a more polished,
// professional look. Each export is a ready-to-inject HTML string.

function svg(paths, viewBox = "0 0 24 24") {
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

export const icons = {
  dashboard: svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  briefcase: svg('<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/><path d="M2.5 12.5h19"/>'),
  calendar: svg('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 3v3M16 3v3M3 9.5h18"/>'),
  bell: svg('<path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
  heart: svg('<path d="M12 20.5S3.5 15.2 3.5 9.3A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.5 3.3c0 5.9-8.5 11.2-8.5 11.2Z"/>'),
  messages: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.4A8 8 0 1 1 21 12Z"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.5 2.4a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.77.65 1.66 1.16 2.6 1.5L10 22h4l.5-2.4a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"/>'),
  location: svg('<path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  chevronLeft: svg('<path d="M15 18l-6-6 6-6"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  checkDouble: svg('<path d="M2 12.5l4 4L14 8"/><path d="M9 12.5l4 4L21 8"/>'),
  megaphone: svg('<path d="M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.2-5H10l9 4V6l-9 4H3Z"/>'),
};

export function iconSpan(name, extraClass = "") {
  return `<span class="icon ${extraClass}">${icons[name] || ""}</span>`;
}
