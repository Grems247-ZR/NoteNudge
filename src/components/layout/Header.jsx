/**
 * Header.jsx — 顶部导航栏
 *
 * 展示应用名称、Logo（可选）和平台标签（小红书 / 抖音）。
 */

export default function Header() {
  return (
    <header className="border-b border-border px-6 h-14 flex items-center">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-black text-[11px] font-bold leading-none">选</span>
          </div>
          <span className="text-text-primary font-semibold text-[15px] tracking-[-0.01em]">
            选题灵感
          </span>
          <span className="w-[1.5px] h-3.5 rounded-full bg-accent/80 animate-pulse" />
          <span className="ml-1 text-[11px] text-text-faint font-normal tracking-wide uppercase">
            Beta
          </span>
        </div>

        <button
          className="text-[13px] text-text-muted hover:text-text-primary transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-surface-raised border border-transparent hover:border-border"
          onClick={() => {}}
        >
          使用说明
        </button>
      </div>
    </header>
  )
}
