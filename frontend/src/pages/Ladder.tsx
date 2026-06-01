import { useState, useRef, useEffect, useCallback } from "react";
import { COLORS } from "../lib/colors";

type Phase = "setup" | "ready";

interface Bridge {
    row: number;
    col: number;
}

function generateBridges(cols: number, rows: number): Bridge[] {
    const bridges: Bridge[] = [];
    for (let r = 0; r < rows; r++) {
        const used = new Set<number>();
        for (let c = 0; c < cols - 1; c++) {
            if (!used.has(c) && !used.has(c + 1) && Math.random() < 0.45) {
                bridges.push({ row: r, col: c });
                used.add(c);
                used.add(c + 1);
            }
        }
    }
    return bridges;
}

function tracePath(start: number, bridges: Bridge[], rows: number): number[] {
    const path: number[] = [start];
    let col = start;
    for (let r = 0; r < rows; r++) {
        const right = bridges.find((b) => b.row === r && b.col === col);
        const left = bridges.find((b) => b.row === r && b.col === col - 1);
        if (right) col += 1;
        else if (left) col -= 1;
        path.push(col);
    }
    return path;
}

const ROWS = 8;
const CELL_W = 100;
const CELL_H = 52;
const PAD_X = 60;
const PAD_Y = 20;

export default function Ladder() {
    const [phase, setPhase] = useState<Phase>("setup");
    const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
    const [results, setResults] = useState<string[]>(["", "", "", ""]);
    const [bridges, setBridges] = useState<Bridge[]>([]);
    const [paths, setPaths] = useState<number[][]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [animating, setAnimating] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const count = players.length;
    const canvasW = PAD_X * 2 + CELL_W * (count - 1);
    const canvasH = PAD_Y * 2 + CELL_H * ROWS;

    const xOf = (c: number) => PAD_X + c * CELL_W;
    const yOf = (r: number) => PAD_Y + r * CELL_H;

    const buildSegments = useCallback((path: number[]) => {
        const segs: [number, number, number, number][] = [];
        for (let r = 0; r < ROWS; r++) {
            const cur = path[r];
            const next = path[r + 1];
            const x = xOf(cur);
            const mid = yOf(r) + CELL_H / 2;
            segs.push([x, yOf(r), x, mid]);
            if (next !== cur) segs.push([x, mid, xOf(next), mid]);
            else segs.push([x, mid, x, yOf(r + 1)]);
        }
        return segs;
    }, []);

    // 단일 경로만 하이라이트. progress 1이면 전체, 0~1이면 부분(애니메이션).
    const drawLadder = useCallback(
        (ctx: CanvasRenderingContext2D, active: number | null, progress: number) => {
            ctx.clearRect(0, 0, canvasW, canvasH);

            // 기본 사다리 (모두 흐리게)
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.lineWidth = 1.5;
            for (let c = 0; c < count; c++) {
                ctx.beginPath();
                ctx.moveTo(xOf(c), yOf(0));
                ctx.lineTo(xOf(c), yOf(ROWS));
                ctx.stroke();
            }
            ctx.strokeStyle = "rgba(255,255,255,0.18)";
            for (const b of bridges) {
                const y = yOf(b.row) + CELL_H / 2;
                ctx.beginPath();
                ctx.moveTo(xOf(b.col), y);
                ctx.lineTo(xOf(b.col + 1), y);
                ctx.stroke();
            }

            // 선택된 경로 굴곡선 하이라이트
            if (active === null) return;
            const path = paths[active];
            if (!path) return;
            const color = COLORS[active % COLORS.length];
            const segs = buildSegments(path);

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const drawn = Math.floor(progress * segs.length);
            ctx.beginPath();
            let started = false;
            for (let i = 0; i <= Math.min(drawn, segs.length - 1); i++) {
                const [x1, y1, x2, y2] = segs[i];
                if (!started) {
                    ctx.moveTo(x1, y1);
                    started = true;
                }
                if (i < drawn) {
                    ctx.lineTo(x2, y2);
                } else {
                    const frac = progress * segs.length - drawn;
                    ctx.lineTo(x1 + (x2 - x1) * frac, y1 + (y2 - y1) * frac);
                }
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        },
        [bridges, count, canvasW, canvasH, paths, buildSegments],
    );

    // 정적 렌더 (애니메이션 중에는 rAF 루프가 그림)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || phase !== "ready") return;
        if (animating !== null) return;
        const ctx = canvas.getContext("2d")!;
        drawLadder(ctx, selected, 1);
    }, [phase, selected, animating, drawLadder]);

    const startGame = () => {
        const b = generateBridges(count, ROWS);
        const p = players.map((_, i) => tracePath(i, b, ROWS));
        setBridges(b);
        setPaths(p);
        setSelected(null);
        setAnimating(null);
        setPhase("ready");
    };

    const selectPath = (pi: number) => {
        if (animating !== null) return;
        setSelected(pi);
        setAnimating(pi);

        const duration = 900;
        const start = performance.now();
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            drawLadder(ctx, pi, progress);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setAnimating(null);
            }
        };
        requestAnimationFrame(tick);
    };

    const reset = () => {
        setPhase("setup");
        setSelected(null);
        setAnimating(null);
    };

    const updateCount = (n: number) => {
        setPlayers((p) => {
            const a = [...p];
            while (a.length < n) a.push("");
            return a.slice(0, n);
        });
        setResults((r) => {
            const a = [...r];
            while (a.length < n) a.push("");
            return a.slice(0, n);
        });
    };

    const resultMap = paths.map((p) => p[ROWS]);
    const selectedDest = selected !== null ? resultMap[selected] : -1;

    return (
        <>
            {/* ── Setup ── */}
            {phase === "setup" && (
                <div className="flex flex-col items-center gap-9 px-6 pt-12 pb-16 w-full max-w-lg">
                    {/* 인원 선택 */}
                    <div className="flex gap-2.5">
                        {[2, 3, 4, 5, 6].map((n) => (
                            <button
                                key={n}
                                onClick={() => updateCount(n)}
                                className={[
                                    "w-14 h-10 rounded-xl text-sm font-semibold border transition-all cursor-pointer",
                                    players.length === n
                                        ? "border-violet-400 bg-violet-400/15 text-violet-400"
                                        : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-violet-400/50 hover:text-violet-400 hover:bg-violet-400/8",
                                ].join(" ")}
                            >
                                {n}명
                            </button>
                        ))}
                    </div>

                    {/* 입력 카드 */}
                    <div className="w-full flex border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.03]">
                        {/* 참가자 */}
                        <div className="flex-1 p-6 flex flex-col gap-3">
                            <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600 mb-1">
                                참가자
                            </p>
                            {players.map((val, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2.5"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{
                                            background:
                                                COLORS[i % COLORS.length],
                                        }}
                                    />
                                    <input
                                        value={val}
                                        onChange={(e) => {
                                            const next = [...players];
                                            next[i] = e.target.value;
                                            setPlayers(next);
                                        }}
                                        placeholder={`참가자 ${i + 1}`}
                                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-400/50 focus:bg-violet-400/[0.06] transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 구분선 */}
                        <div className="w-px bg-white/[0.08] my-5" />

                        {/* 결과 */}
                        <div className="flex-1 p-6 flex flex-col gap-3">
                            <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600 mb-1">
                                결과
                            </p>
                            {results.map((val, i) => (
                                <input
                                    key={i}
                                    value={val}
                                    onChange={(e) => {
                                        const next = [...results];
                                        next[i] = e.target.value;
                                        setResults(next);
                                    }}
                                    placeholder={`결과 ${i + 1}`}
                                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-400/50 focus:bg-violet-400/[0.06] transition-all"
                                />
                            ))}
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button
                        onClick={startGame}
                        className="w-64 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,58,237,0.55)] active:translate-y-0 transition-all cursor-pointer"
                    >
                        사다리 생성
                    </button>
                </div>
            )}

            {/* ── Game ── */}
            {phase === "ready" && (
                <div className="flex flex-col items-center pt-8 pb-16">
                    {/* 다시 설정 */}
                    <button
                        onClick={reset}
                        className="self-end mb-4 text-sm text-slate-500 border border-white/10 rounded-lg px-3.5 py-1.5 hover:text-slate-300 hover:border-white/20 transition-all cursor-pointer"
                        style={{ marginRight: PAD_X }}
                    >
                        다시 설정
                    </button>

                    {/* 참가자 태그 */}
                    <div
                        className="flex justify-between items-center"
                        style={{ width: canvasW, paddingInline: PAD_X }}
                    >
                        {players.map((name, i) => {
                            const color = COLORS[i % COLORS.length];
                            const isActive = selected === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => selectPath(i)}
                                    style={{
                                        width: CELL_W - 20,
                                        ["--tag-color" as string]: color,
                                        backgroundColor: isActive
                                            ? `color-mix(in srgb, ${color} 12%, transparent)`
                                            : undefined,
                                        borderColor: isActive
                                            ? color
                                            : undefined,
                                        color: isActive ? color : undefined,
                                    }}
                                    className={[
                                        "h-9 rounded-xl text-[13px] font-semibold border transition-all truncate px-1.5 cursor-pointer",
                                        isActive
                                            ? ""
                                            : "border-white/10 bg-white/5 text-slate-400 hover:border-(--tag-color) hover:text-(--tag-color)",
                                        animating === i ? "tag-animating" : "",
                                    ].join(" ")}
                                >
                                    {name || `참가자 ${i + 1}`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        width={canvasW}
                        height={canvasH}
                        className="block"
                    />

                    {/* 결과 태그 */}
                    <div
                        className="flex justify-between items-center"
                        style={{ width: canvasW, paddingInline: PAD_X }}
                    >
                        {results.map((r, i) => {
                            const isHit = i === selectedDest;
                            const color =
                                isHit && selected !== null
                                    ? COLORS[selected % COLORS.length]
                                    : undefined;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: CELL_W - 20,
                                        borderColor: color,
                                        color: color,
                                        backgroundColor: color
                                            ? `color-mix(in srgb, ${color} 12%, transparent)`
                                            : undefined,
                                        boxShadow: color
                                            ? `0 0 16px color-mix(in srgb, ${color} 25%, transparent)`
                                            : undefined,
                                    }}
                                    className={[
                                        "h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold border truncate px-1.5 transition-all duration-400",
                                        color
                                            ? ""
                                            : "border-white/[0.08] text-slate-600 bg-white/[0.03]",
                                    ].join(" ")}
                                >
                                    {r || `결과 ${i + 1}`}
                                </div>
                            );
                        })}
                    </div>

                    {/* 결과 요약 */}
                    {selected !== null && animating === null && (
                        <div className="mt-9 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-6 py-5 flex items-center gap-2.5 text-[15px] font-semibold animate-slide-up">
                            <span
                                className="min-w-[72px] text-right"
                                style={{ color: COLORS[selected % COLORS.length] }}
                            >
                                {players[selected] || `참가자 ${selected + 1}`}
                            </span>
                            <span className="text-slate-700">→</span>
                            <span className="text-slate-300">
                                {results[resultMap[selected]] ||
                                    `결과 ${resultMap[selected] + 1}`}
                            </span>
                        </div>
                    )}

                    <p className="mt-5 text-[13px] text-slate-700">
                        {animating !== null
                            ? "이동 중..."
                            : selected === null
                              ? "참가자를 클릭해서 경로를 확인하세요"
                              : "다른 참가자를 클릭하면 경로가 바뀝니다"}
                    </p>
                </div>
            )}
        </>
    );
}
