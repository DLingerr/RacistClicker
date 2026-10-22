import type { Theme } from "./settingsSchema";

type RGB = {
  r: number;
  g: number;
  b: number;
};

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function rgba({ r, g, b }: RGB, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken({ r, g, b }: RGB, amount: number) {
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function lighten({ r, g, b }: RGB, amount: number) {
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function applyAccentTheme(accentColor: string, theme: Theme) {
  const root = document.documentElement;
  const rgb = hexToRgb(accentColor);
  const ember = theme === "ember";
  const light = theme === "light";

  root.style.setProperty("--accent", rgba(rgb, 0.9));
  root.style.setProperty("--accent-strong", rgba(rgb, 1));
  root.style.setProperty(
    "--accent-soft",
    rgba(rgb, ember ? 0.34 : light ? 0.12 : 0.18),
  );
  root.style.setProperty(
    "--accent-ring",
    rgba(rgb, ember ? 0.7 : light ? 0.4 : 0.5),
  );
  root.style.setProperty(
    "--accent-glow-1",
    rgba(rgb, ember ? 0.4 : light ? 0.25 : 0.35),
  );
  root.style.setProperty(
    "--accent-glow-2",
    rgba(rgb, ember ? 0.2 : light ? 0.12 : 0.18),
  );
  root.style.setProperty(
    "--accent-text",
    light ? darken(rgb, 0.1) : lighten(rgb, 0.55),
  );
}
