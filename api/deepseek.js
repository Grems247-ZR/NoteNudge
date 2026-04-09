export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
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

    return res.status(200).json(data)
  } catch {
    return res.status(500).json({ error: '调用 DeepSeek 服务失败，请稍后重试' })
  }
}
