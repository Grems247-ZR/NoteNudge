/**
 * TopicList.jsx — 选题结果列表
 *
 * Props:
 *   - topics: TopicCard[] 数据数组
 *   - loading: boolean（显示骨架屏或 loading 动画）
 *   - error: string | null
 *
 * 三种状态：
 *   1. loading — 显示 loading 动画
 *   2. error   — 显示错误提示
 *   3. 有数据   — 渲染 TopicCard 列表
 */

import Card from '../ui/Card'
import TopicCard from './TopicCard'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-text-faint">
            <path d="M9 12h6M9 16h4M7 4H4a1 1 0 00-1 1v15a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 4a1 1 0 011-1h4a1 1 0 011 1v1H9V4z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-[14px] font-medium text-text-primary">等待分析</p>
        <p className="text-[12.5px] text-text-muted leading-relaxed max-w-[240px]">
          填写左侧表单后点击「开始分析」，<br />AI 将为你生成选题灵感
        </p>
      </div>
      <div className="flex items-center gap-4 mt-2">
        {['爆款潜力', '差异化角度', '用户共鸣'].map((tag) => (
          <span key={tag} className="text-[11px] text-text-faint px-2.5 py-1 rounded-full border border-border bg-surface-raised">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3 p-1 overflow-auto h-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-surface-raised" />
            <div className="h-4 bg-surface-raised rounded w-2/3" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-surface-raised rounded w-full" />
            <div className="h-3 bg-surface-raised rounded w-4/5" />
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-5 w-14 bg-surface-raised rounded-full" />
            <div className="h-5 w-14 bg-surface-raised rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onReset, onDebugAuth, debugMessage, checkingAuth }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-[13.5px] font-medium text-text-primary">出错了</p>
        <p className="text-[12px] text-text-muted max-w-[260px]">{message}</p>
      </div>
      <button
        onClick={onReset}
        className="text-[12.5px] text-accent hover:text-accent/80 transition-colors mt-1"
      >
        重新尝试
      </button>
      <button
        onClick={onDebugAuth}
        disabled={checkingAuth}
        className="text-[12px] text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {checkingAuth ? '检测中...' : '检测权限'}
      </button>
      {debugMessage && (
        <p className="text-[11.5px] text-text-faint max-w-[340px] text-center leading-relaxed">
          {debugMessage}
        </p>
      )}
    </div>
  )
}

export default function TopicList({ topics, loading, error, onReset, onDebugAuth, debugMessage, checkingAuth }) {
  return (
    <Card className="h-full overflow-hidden">
      {loading && <LoadingState />}
      {!loading && error && (
        <ErrorState
          message={error}
          onReset={onReset}
          onDebugAuth={onDebugAuth}
          debugMessage={debugMessage}
          checkingAuth={checkingAuth}
        />
      )}
      {!loading && !error && topics.length === 0 && <EmptyState />}
      {!loading && !error && topics.length > 0 && (
        <div className="h-full overflow-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-accent" />
              <h2 className="text-[13px] font-semibold text-text-primary">
                选题建议
              </h2>
              <span className="text-[11px] text-text-faint bg-surface-raised border border-border px-2 py-0.5 rounded-full">
                {topics.length} 个
              </span>
            </div>
            <button
              onClick={onReset}
              className="text-[12px] text-text-muted hover:text-text-primary transition-colors"
            >
              清空
            </button>
          </div>
          {topics.map((topic, i) => (
            <TopicCard key={i} topic={topic} index={i + 1} />
          ))}
        </div>
      )}
    </Card>
  )
}
