/**
 * analyzer.js — 核心分析逻辑
 *
 * 负责：
 *   1. 构建 system / user prompt
 *   2. 调用后端代理 /api/deepseek（服务端再转发给 DeepSeek）
 *   3. 解析 AI 返回的 JSON，并做结构校验
 *   4. 统一错误处理，向上层抛出友好 Error
 *
 * 注意：API Key 不应暴露在前端包里。
 * 所有 AI 请求必须经过 server.js 代理层，本文件不持有任何密钥。
 */

// ─── Prompt 构建 ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一位中国顶级内容策略师，精通小红书和抖音平台算法、用户心理和爆款内容规律。

你的工作方法：
1. 深度分析博主已有内容，提炼其独特的写作风格、选题偏好和用户互动模式
2. 结合平台当前趋势和算法逻辑，找到「账号特色 × 平台热点」的交叉点
3. 给出既贴合博主人设、又有流量潜力的选题建议

输出要求：
- 始终返回合法的 JSON，不附加任何 markdown 代码块或多余文字
- difficulty 字段取值：「入门」「进阶」「挑战」
- title 要有冲击力，可以包含数字、悬念或利益点
- hook 是第一句话，要能在 3 秒内抓住读者`

const DECONSTRUCT_SYSTEM_PROMPT = `你是中国顶级内容策略师，擅长拆解小红书与抖音爆款内容。

你的任务是从一篇爆款笔记中提炼可复用方法论，并用清晰、可执行的中文结论输出。
输出必须是合法 JSON，不要输出 markdown 代码块或额外说明文字。`

/**
 * @param {string} userNotes   用户粘贴的近期笔记内容
 * @param {string} accountBio  账号一句话定位描述（可选）
 * @returns {string}           完整的 user prompt
 */
function buildUserPrompt(userNotes, accountBio) {
  const normalizedBio = accountBio?.trim()
  return `## 我的账号定位
${normalizedBio || '未提供（请根据笔记内容自行判断账号定位）'}

## 我最近发布的笔记内容
${userNotes.trim()}

---

请基于以上信息，返回如下 JSON 结构（不要包裹在 markdown 代码块里）：

{
  "topics": [
    {
      "title": "选题标题（有冲击力，可带数字/悬念/利益点）",
      "hook": "开头第一句钩子句（3秒内抓住读者）",
      "reason": "为什么这个选题有爆款潜力（30字以内）",
      "difficulty": "入门 | 进阶 | 挑战"
    }
    // 共 10 条
  ],
  "analysis": [
    "对现有内容的洞察1（指出优势或规律）",
    "对现有内容的洞察2（指出可改进点）",
    "对现有内容的洞察3（受众或算法层面）"
  ],
  "formula": "从你的已有内容提炼出的爆款公式，例如：「身份标签 + 反常识结论 + 实操清单」"
}`
}

function buildDeconstructPrompt(viralNote) {
  return `请解构下面这篇爆款笔记：

${viralNote.trim()}

请严格返回 JSON（不要加代码块）：
{
  "titleFormula": "标题公式（如 数字+身份+反常识结论）",
  "hookType": "钩子类型 + 说明",
  "painPoints": [
    "评论区可能出现的痛点1",
    "评论区可能出现的痛点2",
    "评论区可能出现的痛点3"
  ],
  "reusableStructure": "可复用的内容结构模板",
  "whyItWorked": [
    "爆款原因1",
    "爆款原因2",
    "爆款原因3"
  ]
}`
}

function buildPostPrompt(topicTitle) {
  return `请基于这个选题标题生成一篇可直接发布的小红书文案：
标题：${topicTitle}

要求：
1) 正文约 300 字，口语化、真实、具画面感，适当加入 emoji
2) 结尾给出 5 个推荐话题标签（不要带 #，只返回标签文本）
3) 输出 JSON，不要加代码块：
{
  "content": "正文内容",
  "hashtags": ["标签1","标签2","标签3","标签4","标签5"]
}`
}

// ─── JSON 解析与校验 ───────────────────────────────────────────────────────────

/**
 * 从 AI 的文本回复中提取 JSON。
 * 兼容 AI 偶尔在 JSON 前后附加说明文字的情况。
 */
function extractJSON(text) {
  const trimmed = text.trim()

  // 优先尝试整体解析
  try {
    return JSON.parse(trimmed)
  } catch {
    // 提取第一个完整的 {...} 块
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new SyntaxError('AI 返回内容中未找到有效 JSON')
  }
}

function getReadableErrorMessage(errPayload, fallback) {
  if (!errPayload) return fallback
  if (typeof errPayload === 'string') return errPayload
  if (typeof errPayload.message === 'string') return errPayload.message
  if (errPayload.error) {
    if (typeof errPayload.error === 'string') return errPayload.error
    if (typeof errPayload.error.message === 'string') return errPayload.error.message
  }
  return fallback
}

/**
 * 校验并规范化 AI 返回的数据结构，补全缺失字段。
 */
function normalizeResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('AI 返回结构异常')
  }

  const topics = Array.isArray(raw.topics) ? raw.topics : []
  const analysis = Array.isArray(raw.analysis) ? raw.analysis : []

  return {
    topics: topics.map((t, i) => ({
      title:      t.title      ?? `选题 ${i + 1}`,
      hook:       t.hook       ?? '',
      reason:     t.reason     ?? '',
      difficulty: ['入门', '进阶', '挑战'].includes(t.difficulty) ? t.difficulty : '进阶',
    })),
    analysis: analysis.slice(0, 3),
    formula:  typeof raw.formula === 'string' ? raw.formula : '',
  }
}

function normalizeDeconstructResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('AI 返回结构异常')
  }

  return {
    titleFormula: typeof raw.titleFormula === 'string' ? raw.titleFormula : '',
    hookType: typeof raw.hookType === 'string' ? raw.hookType : '',
    painPoints: Array.isArray(raw.painPoints) ? raw.painPoints.slice(0, 3) : [],
    reusableStructure: typeof raw.reusableStructure === 'string' ? raw.reusableStructure : '',
    whyItWorked: Array.isArray(raw.whyItWorked) ? raw.whyItWorked.slice(0, 3) : [],
  }
}

function normalizePostResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('AI 返回结构异常')
  }
  return {
    content: typeof raw.content === 'string' ? raw.content : '',
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.slice(0, 5) : [],
  }
}

async function requestDeepSeek(messages) {
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  try {
    response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages,
        model: 'deepseek-chat',
        temperature: 0.7,
      }),
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('请求超时，请重试')
    }
    throw new Error('网络请求失败，请检查网络或 API 服务可用性')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let message = `服务器错误 ${response.status}`
    try {
      const err = await response.json()
      message = getReadableErrorMessage(err, message)
    } catch { /* ignore */ }

    if (response.status === 401) message = 'API Key 无效，请检查服务端 DEEPSEEK_API_KEY 配置'
    if (response.status === 429) message = '请求过于频繁，请稍等片刻再试'
    if (response.status >= 500) message = 'DeepSeek 服务繁忙，请稍后重试'
    throw new Error(message)
  }

  let body
  try {
    body = await response.json()
  } catch {
    throw new Error('服务器返回了无效的响应格式')
  }

  const content = body?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('AI 返回内容为空，请重试')
  }

  try {
    return extractJSON(content)
  } catch {
    console.error('[analyzer] AI 原始返回：', content)
    throw new Error('AI 返回格式异常，请重试。如持续出现，请联系开发者')
  }
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * 分析博主内容并生成选题建议。
 *
 * @param {string} userNotes    用户的近期笔记文本
 * @param {string} accountBio   账号一句话定位（可选）
 * @returns {Promise<{ topics, analysis, formula }>}
 * @throws {Error} 带有用户友好提示的错误
 */
export async function analyzeContent(userNotes, accountBio = '') {
  if (!userNotes?.trim()) throw new Error('请粘贴你的笔记内容')
  const parsed = await requestDeepSeek([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(userNotes, accountBio) },
  ])

  try {
    return normalizeResult(parsed)
  } catch {
    throw new Error('AI 返回的数据结构异常，请重试')
  }
}

export async function analyzeViralContent(viralNote) {
  if (!viralNote?.trim()) throw new Error('请粘贴爆款笔记内容')
  const parsed = await requestDeepSeek([
    { role: 'system', content: DECONSTRUCT_SYSTEM_PROMPT },
    { role: 'user', content: buildDeconstructPrompt(viralNote) },
  ])

  try {
    return normalizeDeconstructResult(parsed)
  } catch {
    throw new Error('AI 返回的数据结构异常，请重试')
  }
}

export async function generatePostCopy(topicTitle) {
  if (!topicTitle?.trim()) throw new Error('缺少选题标题')
  const parsed = await requestDeepSeek([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildPostPrompt(topicTitle) },
  ])

  try {
    return normalizePostResult(parsed)
  } catch {
    throw new Error('文案生成结果异常，请重试')
  }
}
