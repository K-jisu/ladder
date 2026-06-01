import { useState, useRef } from "react";
import { randomInt, shuffle } from "es-toolkit";
import { COLORS } from "../lib/colors";

const SIZE = 300;
const R = SIZE / 2;

export default function Roulette() {
    const [items, setItems] = useState<string[]>(["", "", "", ""]);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState<number | null>(null);
    const rotationRef = useRef(0);

    const n = items.length;
    const seg = 360 / n;

    const labels = items.map((v, i) => v.trim() || `항목 ${i + 1}`);

    // conic-gradient background
    const gradient = `conic-gradient(${labels
        .map((_, i) => {
            const c = COLORS[i % COLORS.length];
            return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
        })
        .join(", ")})`;

    const setCount = (delta: number) => {
        setItems((prev) => {
            const next = [...prev];
            if (delta > 0 && next.length < 8) next.push("");
            if (delta < 0 && next.length > 2) next.pop();
            return next;
        });
        setWinner(null);
    };

    const spin = () => {
        if (spinning) return;
        setWinner(null);
        setSpinning(true);

        // es-toolkit: 당첨자 무작위 선택
        const picked = randomInt(0, n);

        // 당첨 세그먼트 중앙이 상단 포인터(0deg)에 오도록 회전량 계산
        const segCenter = (picked + 0.5) * seg;
        const base = rotationRef.current;
        const currentMod = ((base % 360) + 360) % 360;
        const target = 360 - segCenter; // 포인터에 맞출 각도
        let delta = target - currentMod;
        if (delta < 0) delta += 360;
        const total = base + delta + 360 * 5; // 5바퀴 추가 회전

        rotationRef.current = total;
        setRotation(total);

        window.setTimeout(() => {
            setSpinning(false);
            setWinner(picked);
        }, 4200);
    };

    const reshuffle = () => {
        if (spinning) return;
        setItems((prev) => shuffle(prev));
        setWinner(null);
    };

    return (
        <div className="flex flex-col items-center gap-10 px-6 pt-12 pb-16 w-full max-w-lg">
            {/* 항목 개수 조절 */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setCount(-1)}
                    disabled={spinning || n <= 2}
                    className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 text-lg leading-none hover:border-violet-400/50 hover:text-violet-400 disabled:opacity-30 transition-all cursor-pointer"
                >
                    −
                </button>
                <span className="text-sm font-semibold text-slate-300 w-16 text-center">
                    {n}개 항목
                </span>
                <button
                    onClick={() => setCount(1)}
                    disabled={spinning || n >= 8}
                    className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 text-lg leading-none hover:border-violet-400/50 hover:text-violet-400 disabled:opacity-30 transition-all cursor-pointer"
                >
                    +
                </button>
            </div>

            {/* 휠 */}
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                {/* 포인터 */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: "11px solid transparent",
                        borderRight: "11px solid transparent",
                        borderTop: "20px solid #f8fafc",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                    }}
                />

                <div
                    className="rounded-full border-4 border-white/10"
                    style={{
                        width: SIZE,
                        height: SIZE,
                        background: gradient,
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning
                            ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                            : "none",
                        boxShadow:
                            "0 0 40px rgba(124,58,237,0.25), inset 0 0 30px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* 라벨 */}
                    {labels.map((label, i) => {
                        const angle = (i + 0.5) * seg;
                        return (
                            <div
                                key={i}
                                className="absolute left-1/2 top-1/2 origin-top-left"
                                style={{
                                    transform: `rotate(${angle}deg) translateY(-${R - 28}px)`,
                                }}
                            >
                                <span
                                    className="block -translate-x-1/2 text-[13px] font-bold text-white/90 max-w-[90px] truncate text-center"
                                    style={{
                                        transform: `rotate(90deg)`,
                                        textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* 중앙 허브 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0f17] border-4 border-white/15 z-[5] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-violet-400" />
                </div>
            </div>

            {/* 당첨 결과 */}
            {winner !== null && (
                <div className="flex flex-col items-center gap-1 animate-slide-up">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
                        당첨
                    </span>
                    <span
                        className="text-2xl font-bold"
                        style={{ color: COLORS[winner % COLORS.length] }}
                    >
                        {labels[winner]}
                    </span>
                </div>
            )}

            {/* 컨트롤 */}
            <div className="flex gap-3">
                <button
                    onClick={spin}
                    disabled={spinning}
                    className="w-44 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,58,237,0.55)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 transition-all cursor-pointer"
                >
                    {spinning ? "돌리는 중..." : "돌리기"}
                </button>
                <button
                    onClick={reshuffle}
                    disabled={spinning}
                    className="h-12 px-5 rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 text-sm font-semibold hover:border-white/20 hover:text-slate-200 disabled:opacity-40 transition-all cursor-pointer"
                >
                    섞기
                </button>
            </div>

            {/* 항목 입력 */}
            <div className="w-full grid grid-cols-2 gap-2.5">
                {items.map((val, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <input
                            value={val}
                            onChange={(e) => {
                                const next = [...items];
                                next[i] = e.target.value;
                                setItems(next);
                                setWinner(null);
                            }}
                            placeholder={`항목 ${i + 1}`}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-400/50 focus:bg-violet-400/[0.06] transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
