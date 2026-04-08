/**
 * Textarea.jsx — 通用多行文本输入组件
 *
 * Props:
 *   - label: 标签文字
 *   - placeholder
 *   - value, onChange 等标准 textarea 属性
 */

export default function Textarea({ label, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12px] font-medium text-text-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={[
          'w-full bg-base border border-border rounded-lg px-3.5 py-3 text-[13.5px] text-text-primary placeholder-text-faint resize-none outline-none transition-colors duration-150',
          'focus:border-accent/50 focus:ring-1 focus:ring-accent/20',
          className,
        ].join(' ')}
      />
      {hint && <p className="text-[11.5px] text-text-faint">{hint}</p>}
    </div>
  )
}
