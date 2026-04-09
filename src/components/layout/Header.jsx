/**
 * Header.jsx — 顶部导航栏
 *
 * 展示应用名称、Logo（可选）和平台标签（小红书 / 抖音）。
 */

const toneStyles = {
  gold: 'text-accent/90 bg-accent/10 border-accent/20',
  orange: 'text-orange-200 bg-orange-500/20 border-orange-400/35',
  red: 'text-red-100 bg-red-500/20 border-red-400/35',
}

export default function Header({ usageStatusText = '', usageBadgeTone = 'gold', onOpenGuide }) {
  return (
    <header className="border-b border-border px-6 h-14 flex items-center">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/notenudge-icon.png"
            alt="NoteNudge logo"
            className="w-6 h-6 rounded-[6px] object-cover flex-shrink-0"
          />
          <span className="text-text-primary font-semibold text-[15px] tracking-[-0.01em]">
            NoteNudge
          </span>
          <span className="w-[1.5px] h-3.5 rounded-full bg-accent/80 animate-pulse" />
          <span className="ml-1 text-[11px] text-text-faint font-normal tracking-wide uppercase">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {usageStatusText && (
            <span className={['text-[11px] sm:text-[12px] border px-2 py-1 sm:px-2.5 rounded-md', toneStyles[usageBadgeTone] || toneStyles.gold].join(' ')}>
              {usageStatusText}
            </span>
          )}
          <button
            className="text-[13px] text-text-muted hover:text-text-primary transition-colors duration-150 px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-surface-raised border border-transparent hover:border-border inline-flex items-center gap-1.5"
            onClick={onOpenGuide}
            aria-label="使用说明"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90">
              <path d="M12 17h.01M12 13a3 3 0 10-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="hidden md:inline">使用说明</span>
          </button>
        </div>
      </div>
    </header>
  )
}
