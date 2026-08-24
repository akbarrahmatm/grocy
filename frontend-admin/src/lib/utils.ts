export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function avatarColor(seed: string): string {
  const palette = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}
