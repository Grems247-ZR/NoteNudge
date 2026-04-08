import { useState } from 'react'

// ─── 难度标签 ─────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  入门: 'bg-green-500 text-black',
  进阶: 'bg-orange-500 text-white',
  挑战: 'bg-red-500 text-white',
  高难: 'bg-red-500 text-white',
  // 兼容别名
  简单: 'bg-green-500 text-black',
  中等: 'bg-orange-500 text-white',
  较难: 'bg-red-500 text-white',
}

function DifficultyBadge({ level }) {
  const cls = DIFFICULTY_STYLES[level] ?? DIFFICULTY_STYLES['进阶']
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {level}
    </span>
  )
}

// ─── 骨架屏 ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="h-full overflow-auto p-5 space-y-4">
      {/* 骨架卡片 1：较高 */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-surface-hover" />
          <div className="h-3.5 w-20 bg-surface-hover rounded" />
        </div>
        <div className="space-y-2.5 pt-1">
          {[85, 70, 78].map((w, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-surface-hover flex-shrink-0 mt-0.5" />
              <div className={`h-3 bg-surface-hover rounded w-[${w}%] flex-1`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* 骨架卡片 2：较矮 */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3 animate-pulse" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-surface-hover" />
          <div className="h-3.5 w-16 bg-surface-hover rounded" />
        </div>
        <div className="h-10 bg-surface-hover rounded-lg" />
      </div>

      {/* 骨架卡片 3：选题列表 */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3 animate-pulse" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-surface-hover" />
          <div className="h-3.5 w-24 bg-surface-hover rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 pt-1 border-t border-border first:border-0 first:pt-0">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-surface-hover flex-shrink-0" />
              <div className="h-3.5 bg-surface-hover rounded w-3/5" />
              <div className="ml-auto h-5 w-10 bg-surface-hover rounded-full" />
            </div>
            <div className="ml-7 space-y-1.5">
              <div className="h-2.5 bg-surface-hover rounded w-full" />
              <div className="h-2.5 bg-surface-hover rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 卡片标题行 ───────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-[3px] h-4 rounded-full bg-accent flex-shrink-0" />
        <h3 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em]">{title}</h3>
      </div>
      {badge != null && (
        <span className="text-[11px] text-text-faint bg-surface-raised border border-border px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  )
}

// ─── 卡片1：账号诊断 ──────────────────────────────────────────────────────────

function AnalysisCard({ analysis }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title="账号诊断" badge={`${analysis?.length ?? 0} 条洞察`} />
      <ol className="space-y-3">
        {analysis?.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-accent/12 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-[13px] text-text-primary leading-relaxed">{item}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── 卡片2：爆款公式 ──────────────────────────────────────────────────────────

function FormulaCard({ formula }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(formula).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title="爆款公式" />
      <div className="relative group">
        <pre className="font-mono text-[13px] text-accent leading-relaxed whitespace-pre-wrap break-all bg-accent/5 border border-accent/15 rounded-lg px-4 py-3 pr-20">
          {formula}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 text-[11.5px] text-text-muted hover:text-accent transition-colors px-2.5 py-1 rounded-md border border-border hover:border-accent/30 bg-base opacity-0 group-hover:opacity-100"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  )
}

// ─── 卡片3 内部：单条选题 ─────────────────────────────────────────────────────

function TopicRow({ topic, index }) {
  const [copied, setCopied] = useState(false)

  function formatTopicForCopy(data) {
    return [
      `【标题】${data?.title ?? ''}`,
      `【钩子】${data?.hook ?? ''}`,
      `【适合原因】${data?.reason ?? ''}`,
    ].join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(formatTopicForCopy(topic)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="group py-3.5 border-t border-border first:border-0 first:pt-0">
      {/* 标题行 */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-5 h-5 rounded-md bg-accent/12 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index}
        </span>
        <p className="flex-1 text-[13.5px] font-semibold text-text-primary leading-snug tracking-[-0.01em]">
          {topic.title}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {topic.difficulty && <DifficultyBadge level={topic.difficulty} />}
          <button
            onClick={handleCopy}
            className="text-[11px] text-text-muted hover:text-accent transition-colors px-2 py-0.5 rounded border border-border hover:border-accent/30 bg-base opacity-0 group-hover:opacity-100"
          >
            {copied ? '已复制' : '复制卡片'}
          </button>
        </div>
      </div>

      {/* 钩子句 */}
      {topic.hook && (
        <p className="mt-2 ml-8 text-[12px] text-text-muted leading-relaxed">
          <span className="text-accent/60 font-medium mr-1.5">钩子句</span>
          {topic.hook}
        </p>
      )}

      {/* 适合原因 */}
      {topic.reason && (
        <p className="mt-1 ml-8 text-[11.5px] text-text-faint leading-relaxed">
          {topic.reason}
        </p>
      )}
    </div>
  )
}

// ─── 卡片3：选题建议 ──────────────────────────────────────────────────────────

function TopicsCard({ topics }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title="选题建议" badge={`${topics?.length ?? 0} 个`} />
      <div>
        {topics?.map((topic, i) => (
          <TopicRow key={i} topic={topic} index={i + 1} />
        ))}
      </div>
    </div>
  )
}

function KeyValueCard({ title, value, copyable = false, mono = false }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title={title} />
      <div className="relative group">
        <p className={[
          'text-[13px] text-text-primary leading-relaxed bg-surface-raised border border-border rounded-lg px-4 py-3 pr-20 whitespace-pre-wrap',
          mono ? 'font-mono text-accent bg-accent/5 border-accent/15' : '',
        ].join(' ')}>
          {value}
        </p>
        {copyable && (
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 text-[11.5px] text-text-muted hover:text-accent transition-colors px-2.5 py-1 rounded-md border border-border hover:border-accent/30 bg-base opacity-0 group-hover:opacity-100"
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}

function ListCard({ title, items }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title={title} badge={`${items?.length ?? 0} 条`} />
      <ol className="space-y-3">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-accent/12 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-[13px] text-text-primary leading-relaxed">{item}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function ResultPanel({ mode = 'topic', result, isLoading }) {
  if (isLoading) return <Skeleton />

  if (!result) return null

  if (mode === 'deconstruct') {
    return (
      <div className="h-full overflow-auto p-1 space-y-4 scrollbar-thin">
        {result.titleFormula && (
          <KeyValueCard title="标题公式" value={result.titleFormula} mono copyable />
        )}
        {result.hookType && (
          <KeyValueCard title="钩子类型" value={result.hookType} />
        )}
        {result.painPoints?.length > 0 && (
          <ListCard title="评论区潜在痛点" items={result.painPoints} />
        )}
        {result.reusableStructure && (
          <KeyValueCard title="可复用结构模板" value={result.reusableStructure} />
        )}
        {result.whyItWorked?.length > 0 && (
          <ListCard title="为什么会爆" items={result.whyItWorked} />
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-1 space-y-4 scrollbar-thin">
      {result.analysis?.length > 0 && (
        <AnalysisCard analysis={result.analysis} />
      )}
      {result.formula && (
        <FormulaCard formula={result.formula} />
      )}
      {result.topics?.length > 0 && (
        <TopicsCard topics={result.topics} />
      )}
    </div>
  )
}
