import { getBaseUrl, signParams } from './_mazfu.js'

const PID = '11759'
const MAPI_URL = 'https://www.mazfu.com/xpay/epay/mapi.php'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const key = process.env.MAZFU_KEY
  if (!key) {
    return res.status(500).json({ error: '服务端未配置 MAZFU_KEY' })
  }

  const { type } = req.body ?? {}
  const isMonth = type === 'month'
  const isTrial = type === 'trial'
  if (!isMonth && !isTrial) {
    return res.status(400).json({ error: '无效套餐类型' })
  }

  const outTradeNo = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`
  const baseUrl = getBaseUrl(req)

  const params = {
    pid: PID,
    type: 'alipay',
    out_trade_no: outTradeNo,
    notify_url: `${baseUrl}/api/notify`,
    return_url: `${baseUrl}`,
    name: isMonth ? '选题灵感月卡' : '选题灵感体验包',
    money: isMonth ? '29.00' : '9.90',
  }

  const sign = signParams(params, key)
  const payload = { ...params, sign, sign_type: 'MD5' }
  const payUrl = `${MAPI_URL}?${new URLSearchParams(payload).toString()}`

  return res.status(200).json({
    order_id: outTradeNo,
    pay_url: payUrl,
  })
}
