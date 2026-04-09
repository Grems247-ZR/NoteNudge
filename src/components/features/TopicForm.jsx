import Card from '../ui/Card'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { useEffect, useMemo, useState } from 'react'

const DIRECTION_OPTIONS = ['职场穿搭', '美食探店', '情感生活', '副业赚钱', '母婴育儿', '健身减脂', '学习考研', '旅行攻略', '数码科技', '其他']
const AUDIENCE_OPTIONS = ['18-24岁学生', '25-30岁职场新人', '30-35岁都市女性', '宝妈群体', '男性用户', '不确定']

const VIRAL_QUICK_EXAMPLES = {
  food: '标题：打工人下班后也能做的10分钟热汤面，成本不到8块\n正文：今天加班到9点，回家真的只想躺平。但胃里空空又睡不着，我就做了这碗「番茄鸡蛋热汤面」：\n1）番茄先炒出汁，加一勺生抽和一点点糖\n2）加开水煮开后下面，2分钟就好\n3）最后淋蛋液，撒点葱花\n真的很治愈，热乎乎一碗下去，整个人都活过来了。评论区一堆姐妹问我要详细克数和减脂版做法。',
  outfit: '标题：155小个子通勤穿搭，不显矮的3个关键细节\n正文：我身高155，之前穿西装总像偷穿大人衣服，后来摸索出三个“显高公式”：\n- 上短下长（上衣塞衣角，腰线一定要出来）\n- 同色系延长比例（鞋子和裤子同色更显腿长）\n- 外套不过臀（长度卡在腰臀之间最友好）\n今天这套是米色短西装+高腰直筒裤+浅口鞋，地铁里被问了两次链接。评论区都在问“通勤能不能舒服又好看”，我把单品清单放在最后了。',
  emotion: '标题：成年人最体面的告别，是不追问那句“为什么”\n正文：以前我总觉得，关系结束一定要有个标准答案，后来才懂很多离开根本没有完整解释。你越追问，越容易把自己困在“是不是我不够好”。\n这两年我学会的，是把注意力收回来：\n1）允许难过，但不给自己反复复盘的机会\n2）停止去对方那里寻找确认\n3）把时间放回自己的生活节奏\n不是突然放下，而是某一天你发现，原来没有那个人，你也在慢慢发光。评论区很多人分享了自己的经历，看完真的很想抱抱大家。',
}

export default function TopicForm({
  activeTab,
  onTabChange,
  topicDirection, onTopicDirectionChange,
  targetAudience, onTargetAudienceChange,
  extraInfo, onExtraInfoChange,
  viralNote, onViralNoteChange,
  onFillExample,
  directionErrorTick,
  onSubmit, loading,
  fieldError,
  notice,
  recentAnalyses,
  onRestoreRecent,
  onClearRecent,
}) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [flashDirectionTitle, setFlashDirectionTitle] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit()
  }

  const historyItems = useMemo(
    () => (Array.isArray(recentAnalyses) ? recentAnalyses.slice(0, 5) : []),
    [recentAnalyses],
  )

  useEffect(() => {
    if (!directionErrorTick) return
    setFlashDirectionTitle(true)
    const timer = setTimeout(() => setFlashDirectionTitle(false), 700)
    return () => clearTimeout(timer)
  }, [directionErrorTick])

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
            <div className="flex flex-col gap-3">
              <p className={['text-[12.5px] font-medium transition-colors', flashDirectionTitle ? 'text-red-400 animate-pulse' : 'text-text-primary'].join(' ')}>
                你主要做什么内容？
              </p>
              <div className="flex flex-wrap gap-2">
                {DIRECTION_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onTopicDirectionChange(item)}
                    className={[
                      'text-[12px] px-2.5 py-1.5 rounded-full border transition-colors',
                      topicDirection === item
                        ? 'bg-accent text-black border-accent'
                        : 'bg-base text-text-muted border-border hover:text-text-primary',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[12.5px] text-text-primary font-medium">你的主要读者是？</p>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onTargetAudienceChange(item)}
                    className={[
                      'text-[12px] px-2.5 py-1.5 rounded-full border transition-colors',
                      targetAudience === item
                        ? 'bg-accent text-black border-accent'
                        : 'bg-base text-text-muted border-border hover:text-text-primary',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[12.5px] text-text-primary font-medium">还有什么想告诉AI的？（可不填）</p>
                <span className="text-[11px] text-text-faint">{extraInfo.length}/100</span>
              </div>
              <input
                type="text"
                value={extraInfo}
                onChange={(e) => onExtraInfoChange(e.target.value)}
                placeholder="比如：我在北京、最近想做年终总结方向…"
                className="w-full bg-base border border-border rounded-lg px-3.5 py-3 text-[13px] text-text-primary placeholder-text-faint outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0">
            <div className="mb-2 overflow-x-auto whitespace-nowrap pb-1">
              <div className="inline-flex gap-1.5">
              <button
                type="button"
                onClick={() => onViralNoteChange(VIRAL_QUICK_EXAMPLES.food)}
                className="text-[11.5px] px-2.5 py-1 rounded-md border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised"
              >
                美食类爆款示例
              </button>
              <button
                type="button"
                onClick={() => onViralNoteChange(VIRAL_QUICK_EXAMPLES.outfit)}
                className="text-[11.5px] px-2.5 py-1 rounded-md border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised"
              >
                穿搭类爆款示例
              </button>
              <button
                type="button"
                onClick={() => onViralNoteChange(VIRAL_QUICK_EXAMPLES.emotion)}
                className="text-[11.5px] px-2.5 py-1 rounded-md border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised"
              >
                情感类爆款示例
              </button>
              </div>
            </div>
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
          {activeTab === 'topic' && (
            <button
              type="button"
              onClick={onFillExample}
              className="w-full mb-2 text-[12px] text-text-muted hover:text-accent transition-colors border border-border rounded-lg py-2 bg-base hover:bg-surface-raised"
            >
              一键示例
            </button>
          )}
          {activeTab === 'topic' && (
            <p className="text-[11px] text-accent text-center mb-2">
              AI将根据你的选择生成10个专属选题
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="w-full py-3 text-[14px]"
          >
            {loading ? '分析中…' : activeTab === 'topic' ? '生成选题 →' : '开始解构'}
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
