const { getDeepSeekApiKey } = require('./getDeepSeekKey')

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  const apiKey = getDeepSeekApiKey()
  const body = event.body ? JSON.parse(event.body) : {}
  const { messages, model = 'deepseek-chat', temperature = 0.7 } = body

  if (!apiKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: '服务端未配置 DEEPSEEK_API_KEY' }),
    }
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '请求参数不完整（缺少 messages）' }),
    }
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '调用 DeepSeek 服务失败，请稍后重试' }),
    }
  }
}
