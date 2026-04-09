import { generateRedeemCode, inferTypeFromMoney, readOrders, signParams, writeOrders } from './_mazfu.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('fail')
  }

  const key = process.env.MAZFU_KEY
  if (!key) return res.status(500).send('fail')

  const body = req.body ?? {}
  const providedSign = String(body.sign || '').toLowerCase()
  const localSign = signParams(body, key)

  if (!providedSign || providedSign !== localSign) {
    return res.status(400).send('fail')
  }

  if (body.trade_status === 'TRADE_SUCCESS') {
    const outTradeNo = String(body.out_trade_no || '')
    const type = inferTypeFromMoney(body.money)
    const list = await readOrders()
    const idx = list.findIndex((x) => x.out_trade_no === outTradeNo)
    const code = idx >= 0 ? (list[idx].code || generateRedeemCode()) : generateRedeemCode()

    const next = {
      out_trade_no: outTradeNo,
      code,
      type,
      paid: true,
      paid_at: Date.now(),
    }
    if (idx >= 0) list[idx] = { ...list[idx], ...next }
    else list.unshift(next)
    await writeOrders(list)
    return res.status(200).send('success')
  }

  return res.status(200).send('fail')
}
