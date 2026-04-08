/**
 * useTopicGenerator.js — 选题生成核心 Hook
 *
 * 管理以下状态：
 *   - loading：是否正在请求 AI
 *   - error：错误信息
 *   - topics：AI 返回的选题列表
 *
 * 对外暴露：
 *   - topics, loading, error
 *   - generate(formData)：触发生成
 *   - reset()：清空结果
 */

import { useState } from 'react'
import { generateTopics } from '../api/client'

export function useTopicGenerator() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate({ notes, positioning }) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await generateTopics(notes, positioning)
      setResult(data)
    } catch (err) {
      setError(err.message ?? '出现未知错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { result, loading, error, generate, reset }
}
