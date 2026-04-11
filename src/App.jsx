import { useEffect, useState } from 'react'
import Layout from './components/layout/Layout'
import TopicForm from './components/features/TopicForm'
import TopicList from './components/features/TopicList'
import ResultPanel from './components/features/ResultPanel'
import Card from './components/ui/Card'
import { analyzeContent, analyzeViralContent, generatePostCopy } from './lib/analyzer'
import { REDEEM_CODE_LIST } from './config/redeemCodes'

const HISTORY_KEY = 'xiaohongshu-recent-analyses'
const USAGE_KEY = 'xiaohongshu-usage-state'
const USAGE_RESET_ONCE_KEY = 'xiaohongshu-usage-reset-once-v1'
const FREE_DAILY_LIMIT = 3
const EXPERIENCE_TIMES = 20
const TOPIC_EXAMPLE_COMBOS = [
  { direction: '职场穿搭', audience: '25-30岁职场新人' },
  { direction: '美食探店', audience: '30-35岁都市女性' },
  { direction: '情感生活', audience: '18-24岁学生' },
  { direction: '副业赚钱', audience: '25-30岁职场新人' },
  { direction: '母婴育儿', audience: '宝妈群体' },
  { direction: '健身减脂', audience: '男性用户' },
  { direction: '学习考研', audience: '18-24岁学生' },
  { direction: '旅行攻略', audience: '不确定' },
]

function getLocalDateStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = `${now.getMonth() + 1}`.padStart(2, '0')
  const d = `${now.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeUsageState(raw) {
  const today = getLocalDateStr()
  const base = {
    date: today,
    freeUsed: 0,
    packRemaining: 0,
    monthCardExpiry: null,
    redeemedCodes: [],
  }

  const state = { ...base, ...(raw || {}) }
  if (state.date !== today) {
    state.date = today
    state.freeUsed = 0
  }

  state.freeUsed = Number.isFinite(state.freeUsed) ? Math.max(0, state.freeUsed) : 0
  state.packRemaining = Number.isFinite(state.packRemaining) ? Math.max(0, state.packRemaining) : 0
  state.redeemedCodes = Array.isArray(state.redeemedCodes) ? state.redeemedCodes : []

  if (state.monthCardExpiry && Date.now() > state.monthCardExpiry) {
    state.monthCardExpiry = null
  }

  return state
}

function getUsageStatusText(usageState) {
  if (usageState.monthCardExpiry && usageState.monthCardExpiry > Date.now()) {
    const d = new Date(usageState.monthCardExpiry)
    return `月卡有效期至 ${d.getMonth() + 1}月${d.getDate()}日`
  }
  if (usageState.packRemaining > 0) {
    return `剩余 ${usageState.packRemaining} 次`
  }
  const left = Math.max(0, FREE_DAILY_LIMIT - usageState.freeUsed)
  return `今日剩余 ${left} 次`
}

function RedeemModal({ open, onClose, onRedeem }) {
  const [planTab, setPlanTab] = useState('experience')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  if (!open) return null

  function submitRedeem() {
    const res = onRedeem(code, planTab)
    if (!res.ok) {
      setMsg(res.message)
      return
    }
    setMsg('兑换成功，已激活')
    setCode('')
    setTimeout(() => {
      setMsg('')
      onClose()
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-t-[20px] sm:rounded-xl p-5 max-h-[90vh] overflow-auto fixed bottom-0 left-0 right-0 sm:static sm:max-h-none">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-text-primary">今日免费次数已用完</h3>
          <button onClick={onClose} className="text-text-faint hover:text-text-primary text-sm">关闭</button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row bg-base border border-border rounded-lg p-1 gap-1 sm:gap-0">
          <button
            onClick={() => setPlanTab('experience')}
            className={['flex-1 py-2 rounded-md text-left px-2.5', planTab === 'experience' ? 'bg-surface-raised text-text-primary' : 'text-text-muted'].join(' ')}
          >
            <p className="text-[12px] font-medium">体验包：9.9元 / 20次</p>
            <p className="text-[10.5px] text-text-faint mt-0.5">约0.5元/次</p>
          </button>
          <button
            onClick={() => setPlanTab('month')}
            className={['flex-1 py-2 rounded-md text-left px-2.5 relative', planTab === 'month' ? 'bg-surface-raised text-text-primary' : 'text-text-muted'].join(' ')}
          >
            <span className="absolute top-2 right-2 text-[10px] text-black bg-accent px-1.5 py-0.5 rounded">
              最划算
            </span>
            <p className="text-[13.2px] font-semibold">月卡：29元 / 30天无限次</p>
          </button>
        </div>

        <p className="text-[11px] text-text-faint text-center mt-2">
          大多数博主选择月卡
        </p>

        <div className="mt-4 h-36 rounded-lg border border-dashed border-border bg-base flex items-center justify-center text-text-faint text-[12px]">
          <img
            src={planTab === 'month' ? '/pay-month.png' : '/pay-trial.png'}
            alt="收款码"
            className="h-full w-full object-contain rounded-lg"
          />
        </div>

        <p className="text-[12px] text-text-muted mt-3 leading-relaxed">
          扫码付款后，截图发微信 ZYZB247
          <br />
          我们将在5分钟内手动发送兑换码
        </p>

        <div className="mt-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入兑换码"
            className="w-full bg-base border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary placeholder-text-faint outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
          />
          {!!msg && <p className="text-[12px] mt-2 text-accent">{msg}</p>}
        </div>

        <button
          onClick={submitRedeem}
          className="w-full mt-4 bg-accent text-black rounded-lg py-2.5 text-[13px] font-semibold hover:bg-[#e09610] transition-colors"
        >
          立即兑换
        </button>
      </div>
    </div>
  )
}

function GuideModal({ open, onClose }) {
  if (!open) return null

  const steps = [
    {
      no: '1️⃣',
      icon: '🧭',
      title: '选择你的内容方向',
      desc: '点击标签选择账号类型和目标人群，也可以补充一句话描述',
    },
    {
      no: '2️⃣',
      icon: '✨',
      title: '点击「生成选题」',
      desc: 'AI 将在10秒内为你生成10个专属选题，每个附带钩子句和难度评级',
    },
    {
      no: '3️⃣',
      icon: '📝',
      title: '一键生成文案',
      desc: '看到喜欢的选题，点「生成文案」直接得到小红书风格正文+话题标签',
    },
  ]

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-[580px] max-h-[88vh] overflow-auto bg-surface rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-text-primary">NoteNudge 使用指南</h2>
            <div className="w-16 h-[3px] rounded-full bg-accent mt-2" />
          </div>
          <button
            onClick={onClose}
            className="text-text-faint hover:text-text-primary text-sm px-2 py-1 rounded-md hover:bg-base transition-colors"
          >
            关闭
          </button>
        </div>

        <section className="mt-5">
          <p className="text-[13px] text-text-muted mb-3">第一部分：三步开始</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.no}
                className="bg-[#242424] border border-border hover:border-accent/50 rounded-xl p-3 transition-colors"
              >
                <p className="text-[12px] text-accent">{s.no} {s.icon}</p>
                <p className="text-[13px] font-medium text-text-primary mt-1">{s.title}</p>
                <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <p className="text-[13px] text-text-muted mb-3">第二部分：免费次数说明</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-base border border-border rounded-lg px-3 py-2.5 text-[12px] text-text-primary">🎁 每天免费使用 3 次，次日自动重置</div>
            <div className="bg-base border border-border rounded-lg px-3 py-2.5 text-[12px] text-text-primary">⚡ 体验包 9.9元：解锁20次使用机会</div>
            <div className="bg-base border border-border rounded-lg px-3 py-2.5 text-[12px] text-text-primary">👑 月卡 29元：当月无限次使用</div>
            <div className="bg-base border border-border rounded-lg px-3 py-2.5 text-[12px] text-text-primary">🔄 兑换码激活后立即生效，无需重新登录</div>
          </div>
        </section>

        <section className="mt-5">
          <p className="text-[13px] text-text-muted mb-2">第三部分：使用技巧</p>
          <div className="space-y-1.5">
            <p className="text-[12px] text-text-primary"><span className="text-accent mr-1.5">•</span>粘贴真实笔记内容，AI分析更精准</p>
            <p className="text-[12px] text-text-primary"><span className="text-accent mr-1.5">•</span>爆款解构适合研究同类账号的爆款逻辑</p>
            <p className="text-[12px] text-text-primary"><span className="text-accent mr-1.5">•</span>生成的选题可以直接复制标题发布测试</p>
          </div>
        </section>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-accent text-black rounded-lg py-2.5 text-[13px] font-semibold hover:bg-[#e09610] transition-colors"
        >
          开始使用
        </button>
      </div>
    </div>
  )
}

export default function App() {
  // 一次性重置：便于当前联调测试免费次数
  useEffect(() => {
    try {
      const done = localStorage.getItem(USAGE_RESET_ONCE_KEY)
      if (done === '1') return
      localStorage.removeItem(USAGE_KEY)
      localStorage.setItem(USAGE_RESET_ONCE_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  const [activeTab, setActiveTab] = useState('topic')
  const [topicDirection, setTopicDirection] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [viralNote,   setViralNote]   = useState('')
  const [result,      setResult]      = useState(null)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState(null)
  const [fieldError,  setFieldError]  = useState('')   // 表单校验提示
  const [notice,      setNotice]      = useState('')
  const [debugMessage, setDebugMessage] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [usageState, setUsageState] = useState(normalizeUsageState())
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [directionErrorTick, setDirectionErrorTick] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setRecentAnalyses(parsed.slice(0, 5))
      }
    } catch {
      // ignore invalid localStorage content
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      setUsageState(normalizeUsageState(parsed))
    } catch {
      setUsageState(normalizeUsageState())
    }
  }, [])

  function saveUsage(next) {
    const normalized = normalizeUsageState(next)
    setUsageState(normalized)
    localStorage.setItem(USAGE_KEY, JSON.stringify(normalized))
    return normalized
  }

  /** 是否还有可用次数（不扣减，仅用于发起请求前校验） */
  function hasUsageAvailable() {
    const current = normalizeUsageState(usageState)
    if (current.monthCardExpiry && current.monthCardExpiry > Date.now()) return true
    if (current.packRemaining > 0) return true
    if (current.freeUsed < FREE_DAILY_LIMIT) return true
    return false
  }

  function consumeOneUsage() {
    const current = normalizeUsageState(usageState)
    if (current.monthCardExpiry && current.monthCardExpiry > Date.now()) {
      saveUsage(current)
      return true
    }
    if (current.packRemaining > 0) {
      current.packRemaining -= 1
      saveUsage(current)
      return true
    }
    if (current.freeUsed < FREE_DAILY_LIMIT) {
      current.freeUsed += 1
      saveUsage(current)
      return true
    }
    saveUsage(current)
    return false
  }

  function saveRecent(list) {
    setRecentAnalyses(list)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  }

  function clampText(value) {
    if (activeTab === 'topic') {
      if (value.length <= 100) return value
      setNotice('补充信息最多100字，已自动截取')
      return value.slice(0, 100)
    }
    if (value.length <= 5000) return value
    setNotice('内容过长，已自动截取前5000字')
    return value.slice(0, 5000)
  }

  async function handleSubmit() {
    if (activeTab === 'topic') {
      if (!topicDirection) {
        setFieldError('请选择账号方向')
        setDirectionErrorTick((v) => v + 1)
        return
      }
      if (!targetAudience) {
        setFieldError('请选择目标人群')
        return
      }
    } else if (!viralNote.trim()) {
      setFieldError('请粘贴爆款笔记内容')
      return
    }

    setFieldError('')
    setError(null)
    setResult(null)
    setNotice('')
    setDebugMessage('')
    if (!hasUsageAvailable()) {
      setRedeemOpen(true)
      return
    }
    setIsLoading(true)

    try {
      const topicInputText = `账号方向：${topicDirection}，目标人群：${targetAudience}，补充：${extraInfo || '无'}`
      const data = activeTab === 'topic'
        ? await analyzeContent(topicInputText)
        : await analyzeViralContent(viralNote)
      consumeOneUsage()
      setResult(data)
      const previewBase = activeTab === 'topic' ? `${topicDirection} ${targetAudience}` : viralNote
      const preview = (previewBase || '').replace(/\s+/g, ' ').slice(0, 20) || '未填写定位'
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mode: activeTab,
          preview,
          createdAt: Date.now(),
          result: data,
        },
        ...recentAnalyses,
      ].slice(0, 5)
      saveRecent(next)
    } catch (err) {
      setError(err.message ?? '出现未知错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  function handleRedeem(rawCode, selectedTab) {
    const code = (rawCode || '').trim().toUpperCase()
    if (!code) return { ok: false, message: '请输入兑换码' }
    const matched = REDEEM_CODE_LIST.find((it) => String(it.code).toUpperCase() === code)
    if (!matched) return { ok: false, message: '兑换码无效，请检查后重试' }

    const current = normalizeUsageState(usageState)
    if ((current.redeemedCodes || []).includes(code)) {
      return { ok: false, message: '该兑换码已使用' }
    }

    const type = matched.type || selectedTab
    if (type === 'month') {
      current.monthCardExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000
    } else {
      current.packRemaining += EXPERIENCE_TIMES
    }
    current.redeemedCodes = [...new Set([...(current.redeemedCodes || []), code])]
    saveUsage(current)
    return { ok: true }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setFieldError('')
    setDebugMessage('')
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setResult(null)
    setError(null)
    setFieldError('')
    setDebugMessage('')
    setNotice('')
  }

  function handleRestoreRecent(item) {
    setActiveTab(item.mode || 'topic')
    setResult(item.result ?? null)
    setError(null)
    setFieldError('')
    setDebugMessage('')
  }

  function handleClearRecent() {
    saveRecent([])
  }

  async function handleGeneratePostByTopic(topicTitle) {
    if (!hasUsageAvailable()) {
      setRedeemOpen(true)
      return { ok: false, error: '今日免费次数已用完' }
    }

    try {
      const data = await generatePostCopy(topicTitle)
      consumeOneUsage()
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: err?.message ?? '文案生成失败，请重试' }
    }
  }

  function handleFillExample() {
    const pick = TOPIC_EXAMPLE_COMBOS[Math.floor(Math.random() * TOPIC_EXAMPLE_COMBOS.length)]
    setTopicDirection(pick.direction)
    setTargetAudience(pick.audience)
    setExtraInfo('')
    setFieldError('')
  }

  async function handleDebugAuth() {
    setCheckingAuth(true)
    setDebugMessage('')
    try {
      const response = await fetch('/.netlify/functions/debug-auth')
      const data = await response.json()
      if (data.ok) {
        setDebugMessage(`权限正常，可用模型：${data.model}`)
      } else {
        const tried = Array.isArray(data.tried) ? data.tried.map((x) => `${x.model}:${x.status ?? '-'}`).join(' | ') : ''
        setDebugMessage(`${data.error ?? '权限检测失败'}${tried ? `（已尝试 ${tried}）` : ''}`)
      }
    } catch {
      setDebugMessage('权限检测失败：无法连接本地 API 服务')
    } finally {
      setCheckingAuth(false)
    }
  }

  const showResultPanel = isLoading || result !== null
  const usageStatusText = getUsageStatusText(usageState)
  let usageBadgeTone = 'gold'
  if (!usageState.monthCardExpiry && usageState.packRemaining <= 0) {
    const left = Math.max(0, FREE_DAILY_LIMIT - usageState.freeUsed)
    if (left === 0) usageBadgeTone = 'red'
    else if (left <= 2) usageBadgeTone = 'orange'
  }

  return (
    <Layout
      usageStatusText={usageStatusText}
      usageBadgeTone={usageBadgeTone}
      onOpenGuide={() => setGuideOpen(true)}
    >
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-4 md:gap-5 h-auto md:h-[calc(100vh-56px-48px)]">

        {/* ── 左列：输入表单 ── */}
        <TopicForm
          activeTab={activeTab}
          onTabChange={handleTabChange}
          topicDirection={topicDirection}
          onTopicDirectionChange={setTopicDirection}
          targetAudience={targetAudience}
          onTargetAudienceChange={setTargetAudience}
          extraInfo={extraInfo}
          onExtraInfoChange={(value) => {
            const next = clampText(value)
            setExtraInfo(next)
          }}
          viralNote={viralNote}
          onViralNoteChange={(value) => {
            const next = clampText(value)
            setViralNote(next)
          }}
          onFillExample={handleFillExample}
          directionErrorTick={directionErrorTick}
          onSubmit={handleSubmit}
          loading={isLoading}
          fieldError={fieldError}
          notice={notice}
          recentAnalyses={recentAnalyses}
          onRestoreRecent={handleRestoreRecent}
          onClearRecent={handleClearRecent}
          onGenerateClick={() => {
            setError(null)
          }}
        />

        {/* ── 右列：结果 / 空状态 ── */}
        {showResultPanel ? (
          <Card className="h-full overflow-hidden relative">
            {!isLoading && result && (
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 z-10 text-[12px] text-text-muted hover:text-text-primary transition-colors px-2.5 py-1 rounded-md border border-border hover:bg-surface-raised"
              >
                重新分析
              </button>
            )}
            <ResultPanel
              mode={activeTab}
              result={result}
              isLoading={isLoading}
              onGeneratePost={handleGeneratePostByTopic}
            />
          </Card>
        ) : (
          <TopicList
            topics={[]}
            loading={false}
            error={error}
            onReset={handleReset}
            onDebugAuth={handleDebugAuth}
            debugMessage={debugMessage}
            checkingAuth={checkingAuth}
          />
        )}

      </div>
      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        onRedeem={handleRedeem}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </Layout>
  )
}
