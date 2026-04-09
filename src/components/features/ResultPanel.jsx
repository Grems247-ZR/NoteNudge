import { useMemo, useState } from 'react'

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

function TopicRow({ topic, index, onGeneratePost }) {
  const [copied, setCopied] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState('')
  const [postResult, setPostResult] = useState(null)
  const [postCopied, setPostCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(topic?.title ?? '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  async function handleGeneratePost() {
    if (!onGeneratePost) return
    setPostLoading(true)
    setPostError('')
    const res = await onGeneratePost(topic?.title ?? '')
    if (!res?.ok) {
      setPostError(res?.error ?? '生成失败，请重试')
      setPostResult(null)
      setPostLoading(false)
      return
    }
    setPostResult(res.data)
    setPostLoading(false)
  }

  function handleCopyPost() {
    if (!postResult) return
    const text = [
      postResult.content ?? '',
      '',
      ...(postResult.hashtags ?? []).map((t) => `#${t}`),
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setPostCopied(true)
      setTimeout(() => setPostCopied(false), 1800)
    })
  }

  return (
    <div className="group py-3.5 border-t border-border first:border-0 first:pt-0">
      {/* 标题行 */}
      <div className="flex flex-col md:flex-row items-start gap-3">
        <span className="flex-shrink-0 w-5 h-5 rounded-md bg-accent/12 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index}
        </span>
        <p className="flex-1 text-[14.5px] md:text-[13.5px] font-semibold text-text-primary leading-snug tracking-[-0.01em]">
          {topic.title}
        </p>
        <div className="flex items-center gap-2 w-full md:w-auto md:flex-shrink-0 md:ml-2 justify-between md:justify-start">
          {topic.difficulty && <DifficultyBadge level={topic.difficulty} />}
          <button
            onClick={handleCopy}
            className="text-[13px] md:text-[12px] text-text-primary hover:text-black transition-colors px-3 py-2.5 md:py-1.5 rounded-lg border border-accent/40 bg-accent/20 hover:bg-accent font-medium w-full md:w-auto min-h-11 md:min-h-0"
          >
            {copied ? '已复制' : '复制标题'}
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

      <div className="mt-3 ml-8">
        <button
          onClick={handleGeneratePost}
          disabled={postLoading}
          className="text-[13px] md:text-[12px] text-text-primary bg-surface border border-border hover:border-accent/40 hover:bg-surface-hover rounded-lg px-3 py-2.5 md:py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-h-11 md:min-h-0"
        >
          {postLoading ? '生成中…' : '生成文案'}
        </button>
      </div>

      {postError && (
        <p className="mt-2 ml-8 text-[11.5px] text-red-400">{postError}</p>
      )}

      {postResult && (
        <div className="mt-3 ml-8 bg-base border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-text-muted">已生成小红书文案</p>
            <button
              onClick={handleCopyPost}
              className="text-[11.5px] text-text-primary hover:text-black bg-accent/20 hover:bg-accent px-2.5 py-1 rounded-md transition-colors"
            >
              {postCopied ? '已复制' : '复制文案'}
            </button>
          </div>
          <p className="text-[12.5px] text-text-primary leading-relaxed whitespace-pre-wrap">
            {postResult.content}
          </p>
          {(postResult.hashtags?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {postResult.hashtags.map((tag) => (
                <span key={tag} className="text-[11px] text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// ─── 卡片3：选题建议 ──────────────────────────────────────────────────────────

function TopicsCard({ topics, onGeneratePost }) {
  const [expanded, setExpanded] = useState(false)
  const visibleTopics = useMemo(
    () => (expanded ? (topics ?? []) : (topics ?? []).slice(0, 5)),
    [expanded, topics],
  )

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SectionHeader title="选题建议" badge={`${topics?.length ?? 0} 个`} />
      <div>
        {visibleTopics?.map((topic, i) => (
          <TopicRow key={i} topic={topic} index={i + 1} onGeneratePost={onGeneratePost} />
        ))}
      </div>
      {(topics?.length ?? 0) > 5 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-[12.5px] text-accent hover:text-accent/80 border border-border rounded-lg py-2 bg-base hover:bg-surface-raised transition-colors flex items-center justify-center gap-1.5"
        >
          <span>{expanded ? '收起' : '查看全部10个'}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
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

export default function ResultPanel({ mode = 'topic', result, isLoading, onGeneratePost }) {
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
        <TopicsCard topics={result.topics} onGeneratePost={onGeneratePost} />
      )}
    </div>
  )
}
