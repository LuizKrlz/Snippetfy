export const uiTheme = {
  layout: {
    app: "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_32%),#020617] text-slate-100",
    container: "mx-auto w-full max-w-6xl px-4 sm:px-6",
    shell:
      "rounded-3xl border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/25 backdrop-blur-xl",
  },
  surface: {
    card: "border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur-xl",
    elevated: "border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20",
    subtle: "border border-dashed border-white/12 bg-white/[0.03]",
  },
  text: {
    title: "text-balance font-semibold tracking-tight text-slate-50",
    body: "text-slate-200",
    muted: "text-slate-400",
    hint: "text-slate-500",
  },
  accent: {
    primary:
      "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 data-[hovered=true]:bg-emerald-400",
    ghost:
      "border border-white/12 bg-transparent text-slate-100 hover:bg-white/8 data-[hovered=true]:bg-white/8",
    danger:
      "bg-rose-500 text-white hover:bg-rose-400 data-[hovered=true]:bg-rose-400",
  },
  radius: {
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-3xl",
  },
} as const;
