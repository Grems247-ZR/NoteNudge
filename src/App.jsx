import { useEffect, useState } from 'react'
import Layout from './components/layout/Layout'
import TopicForm from './components/features/TopicForm'
import TopicList from './components/features/TopicList'
import ResultPanel from './components/features/ResultPanel'
import Card from './components/ui/Card'
import { analyzeContent, analyzeViralContent } from './lib/analyzer'

export default function App() {
  const HISTORY_KEY = 'xiaohongshu-recent-analyses'

  const [activeTab, setActiveTab] = useState('topic')
  const [inputNotes,  setInputNotes]  = useState('')
  const [accountBio,  setAccountBio]  = useState('')
  const [viralNote,   setViralNote]   = useState('')
  const [result,      setResult]      = useState(null)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState(null)
  const [fieldError,  setFieldError]  = useState('')   // 表单校验提示
  const [notice,      setNotice]      = useState('')
  const [debugMessage, setDebugMessage] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [recentAnalyses, setRecentAnalyses] = useState([])

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

  function saveRecent(list) {
    setRecentAnalyses(list)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  }

  function clampText(value) {
    if (value.length <= 5000) return value
    setNotice('内容过长，已自动截取前5000字')
    return value.slice(0, 5000)
  }

  async function handleSubmit() {
    if (activeTab === 'topic') {
      if (!inputNotes.trim() && !accountBio.trim()) {
        setFieldError('请填写笔记内容和账号定位')
        return
      }
      if (!inputNotes.trim()) {
        setFieldError('请粘贴你的笔记内容')
        return
      }
      if (!accountBio.trim()) {
        setFieldError('请填写账号定位描述')
        return
      }
    } else if (!viralNote.trim()) {
      setFieldError('请粘贴爆款笔记内容')
      return
    }

    setFieldError('')
    setError(null)
    setResult(null)
    setIsLoading(true)

    try {
      const data = activeTab === 'topic'
        ? await analyzeContent(inputNotes, accountBio)
        : await analyzeViralContent(viralNote)
      setResult(data)
      const previewBase = activeTab === 'topic' ? accountBio : viralNote
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

  async function handleDebugAuth() {
    setCheckingAuth(true)
    setDebugMessage('')
    try {
      const response = await fetch('/api/debug-auth')
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

  return (
    <Layout>
      <div className="grid grid-cols-[400px_1fr] gap-5 h-[calc(100vh-56px-48px)]">

        {/* ── 左列：输入表单 ── */}
        <TopicForm
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notes={inputNotes}
          onNotesChange={(value) => {
            const next = clampText(value)
            setInputNotes(next)
          }}
          accountBio={accountBio}
          onAccountBioChange={(value) => {
            const next = clampText(value)
            setAccountBio(next)
          }}
          viralNote={viralNote}
          onViralNoteChange={(value) => {
            const next = clampText(value)
            setViralNote(next)
          }}
          onSubmit={handleSubmit}
          loading={isLoading}
          fieldError={fieldError}
          notice={notice}
          recentAnalyses={recentAnalyses}
          onRestoreRecent={handleRestoreRecent}
          onClearRecent={handleClearRecent}
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
            <ResultPanel mode={activeTab} result={result} isLoading={isLoading} />
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
    </Layout>
  )
}
