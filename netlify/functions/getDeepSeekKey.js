'use strict'

/**
 * Netlify Functions 中读取 DeepSeek 密钥。
 * 优先使用 process.env.DEEPSEEK_API_KEY（推荐在 Netlify 后台单独配置）。
 * 兼容仅配置了 VITE_DEEPSEEK_API_KEY 的情况（常见于只按 Vite 文档配了前缀变量）。
 */
function getDeepSeekApiKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || ''
}

module.exports = { getDeepSeekApiKey }
