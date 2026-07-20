export const HERO_FLOW_SETTINGS_VERSION = 1;

export type HeroFlowSettings = {
  cellSpacing: number;
  maxCells: number;
  frameRate: number;
  speed: number;
  ribbonWidth: number;
  ribbonAmplitude: number;
  detail: number;
  visibilityThreshold: number;
  opacity: number;
  baseGlyphSize: number;
  glyphSizeRange: number;
  accentThreshold: number;
  accentEvery: number;
  vignetteStrength: number;
};

export const DEFAULT_HERO_FLOW_SETTINGS: HeroFlowSettings = {
  cellSpacing: 16,
  maxCells: 4500,
  frameRate: 60,
  speed: 1.4,
  ribbonWidth: 1.65,
  ribbonAmplitude: 1.4,
  detail: 0.95,
  visibilityThreshold: 0.2,
  opacity: 0.2,
  baseGlyphSize: 7,
  glyphSizeRange: 5.5,
  accentThreshold: 0.76,
  accentEvery: 2,
  vignetteStrength: 1,
};

const limits: Record<keyof HeroFlowSettings, [number, number]> = {
  cellSpacing: [12, 32],
  maxCells: [800, 6000],
  frameRate: [12, 60],
  speed: [0, 2],
  ribbonWidth: [0.4, 2],
  ribbonAmplitude: [0.25, 1.75],
  detail: [0.4, 2],
  visibilityThreshold: [0.02, 0.45],
  opacity: [0.05, 0.6],
  baseGlyphSize: [5, 14],
  glyphSizeRange: [0, 10],
  accentThreshold: [0.3, 1],
  accentEvery: [2, 40],
  vignetteStrength: [0, 1],
};

const integerSettings = new Set<keyof HeroFlowSettings>([
  "cellSpacing",
  "maxCells",
  "frameRate",
  "accentEvery",
]);

export function normalizeHeroFlowSettings(
  input: Partial<HeroFlowSettings>,
): HeroFlowSettings {
  const normalized = { ...DEFAULT_HERO_FLOW_SETTINGS };

  (Object.keys(DEFAULT_HERO_FLOW_SETTINGS) as Array<keyof HeroFlowSettings>).forEach(
    (key) => {
      const candidate = Number(input[key]);
      if (!Number.isFinite(candidate)) return;
      const [minimum, maximum] = limits[key];
      const clamped = Math.min(maximum, Math.max(minimum, candidate));
      normalized[key] = integerSettings.has(key) ? Math.round(clamped) : clamped;
    },
  );

  return normalized;
}
