/**
 * 前端仅通过 import.meta.env 读取 Vite 公开变量。
 * Netlify 中若需注入到浏览器构建，变量名必须为 VITE_DEEPSEEK_API_KEY。
 * 请勿将 DeepSeek 的 sk- 密钥写入 VITE_（会打进前端包）；真实密钥用服务端 DEEPSEEK_API_KEY。
 */
export const VITE_DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

/** 占位引用，避免 tree-shake 去掉上述与 Netlify 文档对齐的变量名 */
export function touchViteDeepseekEnv() {
  return typeof VITE_DEEPSEEK_API_KEY
}
