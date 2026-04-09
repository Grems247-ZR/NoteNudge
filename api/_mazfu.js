import crypto from 'node:crypto'
import fs from 'node:fs/promises'

const ORDERS_FILE = '/tmp/orders.json'

export function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  return `${proto}://${host}`
}

export function signParams(params, key) {
  const filtered = Object.keys(params)
    .filter((k) => params[k] !== '' && params[k] !== undefined && params[k] !== null && k !== 'sign' && k !== 'sign_type')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')

  return crypto.createHash('md5').update(`${filtered}${key}`, 'utf8').digest('hex').toLowerCase()
}

export async function readOrders() {
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeOrders(list) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf8')
}

export function inferTypeFromMoney(money) {
  const val = Number(money)
  if (val === 9.9) return 'trial'
  if (val === 29) return 'month'
  return 'trial'
}

export function generateRedeemCode() {
  return `NTG-${Math.floor(1000 + Math.random() * 9000)}`
}
