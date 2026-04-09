import { readOrders } from './_mazfu.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const orderId = String(req.query?.order_id || '').trim()
  if (!orderId) {
    return res.status(400).json({ error: '缺少 order_id' })
  }

  const list = await readOrders()
  const order = list.find((x) => x.out_trade_no === orderId)
  if (!order || !order.paid) {
    return res.status(200).json({ paid: false })
  }

  return res.status(200).json({
    paid: true,
    code: order.code,
    type: order.type,
  })
}
