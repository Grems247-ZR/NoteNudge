/**
 * TopicCard.jsx — 单条选题展示卡片
 *
 * Props:
 *   - topic: {
 *       title: string,       // 选题标题
 *       hook: string,        // 开头钩子句
 *       tags: string[],      // 推荐标签
 *       reason: string,      // 为什么这个选题有潜力
 *     }
 *   - index: number（用于显示序号）
 */

import { useState } from 'react'

export default function TopicCard({ topic, index }) {
  const [copied, setCopied] = useState(false)

  function copyTitle() {
    navigator.clipboard.writeText(topic.title).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="group bg-surface-raised border border-border rounded-xl p-4 hover:border-white/12 transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-md bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
            {index}
          </span>
          <h3 className="text-[14px] font-semibold text-text-primary leading-snug tracking-[-0.01em]">
            {topic.title}
          </h3>
        </div>
        <button
          onClick={copyTitle}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[11.5px] text-text-muted hover:text-accent px-2.5 py-1 rounded-md border border-border hover:border-accent/30 bg-base"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {topic.hook && (
        <div className="mt-3 ml-8">
          <p className="text-[12px] text-text-muted leading-relaxed">
            <span className="text-accent/70 font-medium">钩子句  </span>
            {topic.hook}
          </p>
        </div>
      )}

      {topic.reason && (
        <div className="mt-2 ml-8">
          <p className="text-[12px] text-text-faint leading-relaxed">
            {topic.reason}
          </p>
        </div>
      )}

      {topic.tags && topic.tags.length > 0 && (
        <div className="mt-3 ml-8 flex flex-wrap gap-1.5">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-text-muted bg-base border border-border px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
