/**
 * prompts.js — Prompt 模板管理
 *
 * 集中管理所有发给 Claude 的 system prompt 和 user prompt 模板。
 * 使用函数而非字符串常量，方便插入动态参数。
 */

// 系统提示词（定义 AI 角色和行为准则）
export const SYSTEM_PROMPT = `你是一名专注于小红书和抖音的内容策略专家。` 
  + `请根据用户提供的信息，生成有传播潜力的选题方案。`

// 生成选题的用户 Prompt 模板
export function buildTopicPrompt({ niche, audience, style, count }) {
  // TODO: 根据参数组装 prompt 字符串
  return ``
}
