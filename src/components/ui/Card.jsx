/**
 * Card.jsx — 通用卡片容器
 *
 * Props:
 *   - className: 额外的 Tailwind 类名
 *   - children
 */

export default function Card({ children, className = '' }) {
  return (
    <div className={['bg-surface border border-border rounded-xl', className].join(' ')}>
      {children}
    </div>
  )
}
