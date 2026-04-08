/**
 * client.js — 前端 API 请求封装
 *
 * 所有与后端 /api 通信的函数都放这里。
 * 业务组件只调用这里暴露的函数，不直接 fetch。
 */

export { analyzeContent as generateTopics } from '../lib/analyzer'
