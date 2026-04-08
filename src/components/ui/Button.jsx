/**
 * Button.jsx — 通用按钮组件
 *
 * Props:
 *   - variant: 'primary' | 'secondary' | 'ghost'
 *   - loading: boolean（显示 loading 状态）
 *   - disabled: boolean
 *   - onClick, children 等标准 HTML button 属性
 */

const variants = {
  primary:
    'bg-accent hover:bg-[#e09610] text-black font-semibold shadow-sm',
  secondary:
    'bg-surface-raised hover:bg-surface-hover text-text-primary border border-border',
  ghost:
    'hover:bg-surface-raised text-text-muted hover:text-text-primary',
}

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13.5px] transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className,
      ].join(' ')}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
