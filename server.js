/**
 * server.js — 轻量 Express 代理服务器
 *
 * 职责：
 *   - 接收前端发来的 /api/... 请求
 *   - 携带 ANTHROPIC_API_KEY 转发给 Anthropic API
 *   - 将 API Key 保留在服务端，不暴露给浏览器
 *
 * 端口：3001（Vite dev server 运行在 5173，通过 proxy 转发）
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL_CANDIDATES = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
  'claude-3-opus-latest',
]

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 鉴权与模型可用性诊断接口
app.get('/api/debug-auth', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(401).json({ ok: false, error: '未配置 ANTHROPIC_API_KEY' })
  }

  const tried = []
  for (const model of MODEL_CANDIDATES) {
    try {
      await anthropic.messages.create({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'ping' }],
      })
      return res.json({ ok: true, model, tried })
    } catch (error) {
      tried.push({
        model,
        status: error?.status ?? null,
        type: error?.type ?? null,
        message: error?.message ?? 'unknown',
      })
    }
  }

  return res.status(403).json({
    ok: false,
    error: '当前 Key 无可用模型权限',
    tried,
  })
})

// 选题生成接口
app.post('/api/generate', async (req, res) => {
  const { system, userPrompt } = req.body ?? {}

  if (!system || !userPrompt) {
    return res.status(400).json({ error: '请求参数不完整（缺少 system 或 userPrompt）' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(401).json({ error: '服务端未配置 ANTHROPIC_API_KEY，请在 .env 文件中添加' })
  }

  try {
    let message = null
    let lastError = null

    // 按模型优先级依次尝试，避免单模型权限限制导致整体不可用
    for (const model of MODEL_CANDIDATES) {
      try {
        message = await anthropic.messages.create({
          model,
          max_tokens: 4096,
          system,
          messages: [{ role: 'user', content: userPrompt }],
        })
        break
      } catch (error) {
        lastError = error
      }
    }

    if (!message) {
      throw lastError ?? new Error('无法调用可用的模型')
    }

    const content = message.content?.[0]?.text ?? ''
    res.json({ content })
  } catch (err) {
    console.error('[/api/generate]', err)

    const status = err.status ?? 500
    const message =
      err.message?.includes('API key')   ? 'API Key 无效，请检查 .env 配置' :
      err.message?.includes('Request not allowed') ? '当前 API Key 没有可用模型权限，请检查账号模型访问权限或更换 Key' :
      err.message?.includes('overloaded') ? 'Anthropic 服务繁忙，请稍后重试' :
      err.message ?? '调用 AI 服务时出现未知错误'

    res.status(status).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
