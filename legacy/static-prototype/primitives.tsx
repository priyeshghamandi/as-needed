// Shared primitives: icons, buttons, badges, section chrome
declare const React: any;
declare const window: any;

(() => {
const { useState, useEffect, useRef, useMemo } = React;

type IconProps = { name: string; className?: string; strokeWidth?: number };
function Icon({ name, className = "w-4 h-4", strokeWidth = 1.75 }: IconProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = "";
    const icons = window.lucide.icons;
    const svg = window.lucide.createElement(icons[toPascal(name)] || icons.Circle);
    svg.setAttribute("stroke-width", String(strokeWidth));
    svg.classList.add(...className.split(" ").filter(Boolean));
    ref.current.appendChild(svg);
  }, [name, className, strokeWidth]);
  return <span ref={ref} className="inline-flex items-center justify-center" aria-hidden="true" />;
}
function toPascal(s: string): string {
  return s.split(/[-_ ]/).map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "teal";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = {
  children: any;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  as?: any;
  [key: string]: any;
};
function Button({ children, variant = "primary", size = "md", className = "", as: As = "button", ...rest }: ButtonProps) {
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

type BadgeTone = "neutral" | "teal" | "green" | "amber" | "red" | "dark";
type BadgeProps = { children: any; tone?: BadgeTone; className?: string };
function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-ink-100 text-ink-700 border-ink-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    dark: "bg-ink-900 text-paper border-ink-900",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-medium font-mono border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

type DotTone = "teal" | "green" | "amber" | "red" | "ink";
type DotProps = { tone?: DotTone; pulse?: boolean };
function Dot({ tone = "teal", pulse = false }: DotProps) {
  const tones: Record<DotTone, string> = {
    teal: "bg-teal-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    ink: "bg-ink-400",
  };
  return (
    <span className="relative inline-flex w-2 h-2">
      {pulse && <span className={`absolute inset-0 rounded-full ${tones[tone]} ping-slow`} />}
      <span className={`relative inline-flex w-2 h-2 rounded-full ${tones[tone]}`} />
    </span>
  );
}

function Eyebrow({ children, className = "" }: { children: any; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-teal-700 ${className}`}>
      <span className="block w-4 h-px bg-teal-700/60" />
      {children}
    </div>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
      <span className="text-teal-700">{index}</span>
      <span className="block w-6 h-px bg-ink-200" />
      <span>{label}</span>
    </div>
  );
}

type AvatarTone = "teal" | "amber" | "rose" | "sky" | "ink" | "violet";
type AvatarProps = { initials: string; tone?: AvatarTone; size?: number };
function Avatar({ initials, tone = "teal", size = 28 }: AvatarProps) {
  const tones: Record<AvatarTone, string> = {
    teal: "bg-teal-100 text-teal-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    sky:  "bg-sky-100 text-sky-800",
    ink:  "bg-ink-200 text-ink-700",
    violet:"bg-violet-100 text-violet-800",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-medium ${tones[tone]}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials}
    </span>
  );
}

type Person = { initials: string; tone: AvatarTone };
function AvatarStack({ people, max = 4 }: { people: Person[]; max?: number }) {
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

Object.assign(window, { Icon, Button, Badge, Dot, Eyebrow, SectionLabel, Avatar, AvatarStack });
})();
