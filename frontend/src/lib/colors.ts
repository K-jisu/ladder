export const COLORS = [
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#fb923c",
    "#facc15",
    "#38bdf8",
    "#4ade80",
];

export const colorOf = (i: number) => COLORS[i % COLORS.length];
