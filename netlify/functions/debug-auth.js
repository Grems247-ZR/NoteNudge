const { getDeepSeekApiKey } = require('./getDeepSeekKey')

exports.handler = async function() {
  const apiKey = getDeepSeekApiKey()
  if (!apiKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, error: '未配置 DEEPSEEK_API_KEY' }),
    }
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ ok: false, error: message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, model: 'deepseek-chat' }),
    }
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'DeepSeek 服务连接失败' }),
    }
  }
}
