import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const toneMap = {
  success: { icon: CheckCircle2, classes: "border-emerald-300/20 bg-emerald-500/10 text-emerald-50" },
  error: { icon: XCircle, classes: "border-rose-300/20 bg-rose-500/10 text-rose-50" },
  info: { icon: Info, classes: "border-sky-300/20 bg-sky-500/10 text-sky-50" },
};

export function StatusToast({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-24 z-50 flex w-[min(420px,calc(100%-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.tone] || toneMap.info;
        const Icon = tone.icon;
        return (
          <div key={toast.id} className={`rounded-[1.6rem] border px-4 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-xl ${tone.classes}`}>
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm text-current/80">{toast.description}</p>
              </div>
              <button type="button" onClick={() => onDismiss(toast.id)} className="rounded-full p-1 text-current/70 transition hover:bg-white/10 hover:text-current">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

