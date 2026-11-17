import type { Category } from "@territorio-vivo/core";

export const categoryLook: Record<
  Category,
  { bg: string; ink: string; icon: string }
> = {
  playa: {
    bg: "#08b9c9",
    ink: "#22162e",
    icon: '<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><circle cx="17" cy="6" r="3"/>',
  },
  naturaleza: {
    bg: "#159b60",
    ink: "#ffffff",
    icon: '<path d="M12 3 5 13h4l-3 5h12l-3-5h4z"/><path d="M12 18v3"/>',
  },
  cultura: {
    bg: "#dd512d",
    ink: "#ffffff",
    icon: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/>',
  },
  gastronomia: {
    bg: "#f2aa19",
    ink: "#22162e",
    icon: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 2-2 6 0 8v10"/>',
  },
};
