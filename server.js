/**
 * server.js — 本地开发用 API 代理
 *
 * 端口：3001（Vite dev server 运行在 5173，通过 proxy 转发）
 * 说明：线上 Netlify 走 Functions；本地开发走此 Express 代理（Vite 将 /.netlify/functions 转到 /api）。
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

function getDeepSeekKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// DeepSeek 代理（本地）
app.post('/api/deepseek', async (req, res) => {
  const apiKey = getDeepSeekKey()
  const { messages, model = 'deepseek-chat', temperature = 0.7 } = req.body ?? {}

  if (!apiKey) {
    return res.status(401).json({ error: '服务端未配置 DEEPSEEK_API_KEY' })
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '请求参数不完整（缺少 messages）' })
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature }),
    })

    const data = await response.json()
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `DeepSeek 请求失败 ${response.status}`
      return res.status(response.status).json({ error: message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: '调用 DeepSeek 服务失败，请稍后重试' })
  }
})

// 权限诊断（兼容前端现有按钮）
app.get('/api/debug-auth', async (req, res) => {
  const apiKey = getDeepSeekKey()
  if (!apiKey) {
    return res.status(401).json({ ok: false, error: '未配置 DEEPSEEK_API_KEY' })
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `DeepSeek 请求失败 ${response.status}`
      return res.status(response.status).json({ ok: false, error: message })
    }

    return res.json({ ok: true, model: 'deepseek-chat' })
  } catch {
    return res.status(500).json({ ok: false, error: 'DeepSeek 服务连接失败' })
  }
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
