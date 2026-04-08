import Card from '../ui/Card'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { useMemo, useState } from 'react'

export default function TopicForm({
  activeTab,
  onTabChange,
  notes, onNotesChange,
  accountBio, onAccountBioChange,
  viralNote, onViralNoteChange,
  onSubmit, loading,
  fieldError,
  notice,
  recentAnalyses,
  onRestoreRecent,
  onClearRecent,
}) {
  const [historyOpen, setHistoryOpen] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit()
  }

  const historyItems = useMemo(
    () => (Array.isArray(recentAnalyses) ? recentAnalyses.slice(0, 5) : []),
    [recentAnalyses],
  )

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleString('zh-CN', { hour12: false })
    } catch {
      return '-'
    }
  }

  return (
    <Card className="flex flex-col h-full p-5 gap-5 overflow-hidden">
      <div className="flex items-center gap-1 p-1 bg-base border border-border rounded-lg flex-shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('topic')}
          className={[
            'flex-1 text-[12.5px] py-2 rounded-md transition-colors',
            activeTab === 'topic'
              ? 'bg-surface-raised text-text-primary'
              : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          选题生成
        </button>
        <button
          type="button"
          onClick={() => onTabChange('deconstruct')}
          className={[
            'flex-1 text-[12.5px] py-2 rounded-md transition-colors',
            activeTab === 'deconstruct'
              ? 'bg-surface-raised text-text-primary'
              : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          爆款解构
        </button>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-1 h-4 rounded-full bg-accent" />
        <h2 className="text-[13px] font-semibold text-text-primary tracking-[-0.01em]">
          {activeTab === 'topic' ? '输入你的内容' : '输入爆款内容'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
        {activeTab === 'topic' ? (
          <>
            <div className="flex-1 min-h-0">
              <div className="relative h-full min-h-[200px]">
                <Textarea
                  label="最近笔记"
                  placeholder="把你最近3篇笔记的标题和正文粘贴进来…"
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  className="h-full min-h-[200px] pr-32"
                />
                <p className="absolute right-3 bottom-2 text-[10.5px] text-accent">
                  粘贴 2–5 篇效果最好
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-muted uppercase tracking-wide">
                  账号定位
                </label>
                <input
                  type="text"
                  placeholder="用一句话描述你的账号：如'专注职场穿搭的女性博主'"
                  value={accountBio}
                  onChange={(e) => onAccountBioChange(e.target.value)}
                  className="w-full bg-base border border-border rounded-lg px-3.5 py-3 text-[13.5px] text-text-primary placeholder-text-faint outline-none transition-colors duration-150 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0">
            <Textarea
              label="爆款笔记"
              hint="建议包含标题、正文和关键评论"
              placeholder="粘贴一篇爆款笔记的标题+正文"
              value={viralNote}
              onChange={(e) => onViralNoteChange(e.target.value)}
              className="h-full min-h-[200px]"
            />
          </div>
        )}

        <div className="flex-shrink-0 pt-1">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="w-full py-3 text-[14px]"
          >
            {loading ? '分析中…' : activeTab === 'topic' ? '开始分析' : '开始解构'}
          </Button>

          {/* 校验错误：红色 */}
          {fieldError && !loading && (
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-red-400 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {fieldError}
            </p>
          )}
          {!fieldError && notice && !loading && (
            <p className="text-center text-[11.5px] text-accent mt-2">
              {notice}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border pt-3 mt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="text-[12px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <span className="text-text-faint">{historyOpen ? '▾' : '▸'}</span>
              最近分析
            </button>
            <button
              type="button"
              onClick={onClearRecent}
              disabled={historyItems.length === 0}
              className="text-[11.5px] text-text-faint hover:text-text-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              清空
            </button>
          </div>

          {historyOpen && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-auto pr-1">
              {historyItems.length === 0 && (
                <p className="text-[11.5px] text-text-faint">暂无分析记录</p>
              )}
              {historyItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onRestoreRecent(item)}
                  className="w-full text-left bg-base border border-border hover:border-white/15 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] text-text-primary truncate">
                      {item.preview}
                    </p>
                    <span className="text-[10.5px] text-text-faint flex-shrink-0">
                      {item.mode === 'deconstruct' ? '解构' : '生成'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-faint mt-1">
                    {formatTime(item.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </Card>
  )
}
