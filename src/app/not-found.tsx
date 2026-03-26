import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen  flex items-center justify-center bg-[var(--background)] px-4 overflow-hidden">
      {/* Floating background coins */}
      <div className="pointer-events-none absolute inset-0">
        {["coin-1", "coin-2", "coin-3", "coin-4", "coin-5"].map((id, i) => (
          <span
            key={id}
            className="absolute text-3xl opacity-10 animate-[float_ease-in-out_infinite]"
            style={{
              left: `${15 + i * 18}%`,
              animationName: "float",
              animationDuration: `${4 + i * 1.2}s`,
              animationDelay: `${i * 0.6}s`,
              top: "100%",
            }}
          >
            {["💰", "💳", "🪙", "💵", "📊"][i]}
          </span>
        ))}
      </div>

      <div className="relative text-center max-w-md">
        {/* Animated 404 number */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <span
              className="block text-[120px] sm:text-[160px] font-black leading-none tracking-tight animate-[fadeInDown_0.6s_ease-out_both]"
              style={{ color: "var(--primary)", opacity: 0.15 }}
            >
              404
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-[120px] sm:text-[160px] font-black leading-none tracking-tight animate-[fadeInDown_0.6s_ease-out_0.15s_both]"
              style={{ color: "var(--primary)" }}
            >
              404
            </span>
          </div>
        </div>

        {/* Animated wallet icon */}
        <div className="flex justify-center mb-6 animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 animate-[bounce_2s_ease-in-out_infinite]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-2xl animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
              style={{ backgroundColor: "var(--primary)", opacity: 0.05 }}
            />
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3 animate-[fadeInUp_0.5s_ease-out_0.45s_both]">
          Oops! Page not found
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-8 animate-[fadeInUp_0.5s_ease-out_0.6s_both]">
          Looks like this page got lost in the transactions.
          <br />
          Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeInUp_0.5s_ease-out_0.75s_both]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg shadow-[var(--primary)]/25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--accent)] hover:scale-105 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
            </svg>
            View Transactions
          </Link>
        </div>
      </div>

      {/* Keyframe animations via inline style tag */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.1; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
