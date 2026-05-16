"use client";

import type { ElementType, ReactNode } from "react";
import * as LucideIcons from "lucide-react";

function kebabToPascal(name: string): string {
  return name
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/** Lucide names that do not match kebab→Pascal conversion from the prototype. */
const ICON_ALIASES: Record<string, keyof typeof LucideIcons> = {
  "triangle-alert": "AlertTriangle",
};

type IconProps = { name: string; className?: string; strokeWidth?: number };

export function Icon({ name, className = "w-4 h-4", strokeWidth = 1.75 }: IconProps) {
  const pascal = ICON_ALIASES[name] ?? (kebabToPascal(name) as keyof typeof LucideIcons);
  const Cmp = (LucideIcons[pascal] ?? LucideIcons.Circle) as typeof LucideIcons.Circle;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "teal";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  as?: ElementType;
} & Record<string, unknown>;

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: As = "button",
  ...rest
}: ButtonProps) {
  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-11 px-5 text-[14px]",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900",
    secondary: "bg-white text-ink-900 hover:bg-ink-50 border border-ink-200",
    ghost: "bg-transparent text-ink-700 hover:bg-ink-100 border border-transparent",
    teal: "bg-teal-700 text-white hover:bg-teal-800 border border-teal-700",
  };
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}

type BadgeTone = "neutral" | "teal" | "green" | "amber" | "red" | "dark" | "rose";
type BadgeProps = { children: ReactNode; tone?: BadgeTone | string; className?: string };

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-ink-100 text-ink-700 border-ink-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    dark: "bg-ink-900 text-paper border-ink-900",
  };
  const k = (tone in tones ? tone : "neutral") as BadgeTone;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-medium font-mono border ${tones[k]} ${className}`}
    >
      {children}
    </span>
  );
}

type DotTone = "teal" | "green" | "amber" | "red" | "ink" | "rose";
type DotProps = { tone?: DotTone | string; pulse?: boolean };

export function Dot({ tone = "teal", pulse = false }: DotProps) {
  const tones: Record<DotTone, string> = {
    teal: "bg-teal-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    rose: "bg-rose-500",
    ink: "bg-ink-400",
  };
  const k = (tone in tones ? tone : "teal") as DotTone;
  return (
    <span className="relative inline-flex w-2 h-2">
      {pulse && <span className={`absolute inset-0 rounded-full ${tones[k]} ping-slow`} />}
      <span className={`relative inline-flex w-2 h-2 rounded-full ${tones[k]}`} />
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-teal-700 ${className}`}
    >
      <span className="block w-4 h-px bg-teal-700/60" />
      {children}
    </div>
  );
}

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
      <span className="text-teal-700">{index}</span>
      <span className="block w-6 h-px bg-ink-200" />
      <span>{label}</span>
    </div>
  );
}

type AvatarTone = "teal" | "amber" | "rose" | "sky" | "ink" | "violet";
type AvatarProps = { initials: string; tone?: AvatarTone | string; size?: number };

export function Avatar({ initials, tone = "teal", size = 28 }: AvatarProps) {
  const tones: Record<AvatarTone, string> = {
    teal: "bg-teal-100 text-teal-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    sky: "bg-sky-100 text-sky-800",
    ink: "bg-ink-200 text-ink-700",
    violet: "bg-violet-100 text-violet-800",
  };
  const t = (tone in tones ? tone : "teal") as AvatarTone;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-medium ${tones[t]}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials}
    </span>
  );
}

type Person = { initials: string; tone: AvatarTone };

export function AvatarStack({ people, max = 4 }: { people: Person[]; max?: number }) {
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((p, i) => (
        <span key={i} className="ring-2 ring-white rounded-full">
          <Avatar initials={p.initials} tone={p.tone} size={24} />
        </span>
      ))}
      {extra > 0 && (
        <span className="ring-2 ring-white rounded-full bg-ink-100 text-ink-600 inline-flex items-center justify-center w-6 h-6 text-[10px] font-mono">
          +{extra}
        </span>
      )}
    </div>
  );
}
