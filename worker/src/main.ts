import baseWorker from "./index";

type Env = {
  FRONTEND_ORIGIN: string;
  MERCADO_PAGO_ACCESS_TOKEN: string;
  MERCADO_PAGO_WEBHOOK_SECRET: string;
  MERCADO_PAGO_ENV: "test" | "production";
  DB: D1Database;
};

type CheckoutResponse = {
  orderId?: string;
};

type MercadoPagoWebhookBody = {
  type?: string;
  data?: { id?: string | number };
};

type PhysicalItemRow = {
  order_item_id: number;
  product_id: string;
  quantity: number;
  product_source_id: string | null;
  supplier_id: string | null;
};

async function ensureExecutiveSetComponents(env: Env, orderId: string) {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO order_items
       (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
       SELECT oi.order_id,'product',oi.watch_id,oi.offer_id,NULL,NULL,p.name,0,oi.quantity,0
       FROM order_items oi
       JOIN products p ON p.id=oi.watch_id
       WHERE oi.order_id=?1
         AND oi.kind='executive-set'
         AND oi.watch_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM order_items c
           WHERE c.order_id=oi.order_id
             AND c.kind='product'
             AND c.product_id=oi.watch_id
             AND c.unit_price_cents=0
         )`,
    ).bind(orderId),
    env.DB.prepare(
      `INSERT INTO order_items
       (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
       SELECT oi.order_id,'product',oi.glasses_id,oi.offer_id,NULL,NULL,p.name,0,oi.quantity,0
       FROM order_items oi
       JOIN products p ON p.id=oi.glasses_id
       WHERE oi.order_id=?1
         AND oi.kind='executive-set'
         AND oi.glasses_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM order_items c
           WHERE c.order_id=oi.order_id
             AND c.kind='product'
             AND c.product_id=oi.glasses_id
             AND c.unit_price_cents=0
         )`,
    ).bind(orderId),
    env.DB.prepare(
      `INSERT INTO order_items
       (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
       SELECT oi.order_id,'gift',o.included_gift_product_id,oi.offer_id,NULL,NULL,p.name,0,oi.quantity,0
       FROM order_items oi
       JOIN offers o ON o.id=oi.offer_id
       JOIN products p ON p.id=o.included_gift_product_id
       WHERE oi.order_id=?1
         AND oi.kind='executive-set'
         AND o.included_gift_product_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM order_items c
           WHERE c.order_id=oi.order_id
             AND c.kind='gift'
             AND c.product_id=o.included_gift_product_id
         )`,
    ).bind(orderId),
  ]);
}

async function prepareFulfillments(env: Env, orderId: string) {
  await ensureExecutiveSetComponents(env, orderId);

  const order = await env.DB.prepare(
    `SELECT status,fulfillment_status FROM orders WHERE id=?1 LIMIT 1`,
  ).bind(orderId).first<{ status: string; fulfillment_status: string }>();

  if (!order) throw new Error(`Pedido ${orderId} não encontrado.`);
  if (order.status !== "approved") throw new Error(`Pedido ${orderId} não está approved.`);
  if (["processing", "partially_shipped", "shipped", "delivered", "cancelled"].includes(order.fulfillment_status)) return;

  const result = await env.DB.prepare(
    `SELECT
       oi.id AS order_item_id,
       oi.product_id,
       oi.quantity,
       (
         SELECT ps.id
         FROM product_sources ps
         WHERE ps.product_id=oi.product_id AND ps.active=1
         ORDER BY ps.priority ASC, ps.id ASC
         LIMIT 1
       ) AS product_source_id,
       (
         SELECT ps.supplier_id
         FROM product_sources ps
         WHERE ps.product_id=oi.product_id AND ps.active=1
         ORDER BY ps.priority ASC, ps.id ASC
         LIMIT 1
       ) AS supplier_id
     FROM order_items oi
     WHERE oi.order_id=?1 AND oi.product_id IS NOT NULL
     ORDER BY oi.id ASC`,
  ).bind(orderId).all<PhysicalItemRow>();

  const items = result.results ?? [];
  if (items.length === 0 || items.some((item) => !item.product_source_id || !item.supplier_id)) {
    await env.DB.prepare(
      `UPDATE orders SET fulfillment_status='failed',updated_at=datetime('now') WHERE id=?1`,
    ).bind(orderId).run();
    throw new Error(`Pedido ${orderId} possui item físico sem fornecedor ativo.`);
  }

  const bySupplier = new Map<string, PhysicalItemRow[]>();
  for (const item of items) {
    const supplierId = item.supplier_id as string;
    const group = bySupplier.get(supplierId) ?? [];
    group.push(item);
    bySupplier.set(supplierId, group);
  }

  for (const [supplierId, supplierItems] of bySupplier) {
    const fulfillmentId = `ff-${orderId}-${supplierId}`;
    const statements: D1PreparedStatement[] = [
      env.DB.prepare(
        `INSERT OR IGNORE INTO fulfillments (id,order_id,supplier_id,status)
         VALUES (?1,?2,?3,'ready')`,
      ).bind(fulfillmentId, orderId, supplierId),
    ];

    for (const item of supplierItems) {
      statements.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO fulfillment_items
           (fulfillment_id,order_item_id,product_source_id,quantity)
           VALUES (?1,?2,?3,?4)`,
        ).bind(fulfillmentId, item.order_item_id, item.product_source_id, item.quantity),
      );
    }

    await env.DB.batch(statements);
  }

  await env.DB.prepare(
    `UPDATE orders SET fulfillment_status='ready',updated_at=datetime('now') WHERE id=?1`,
  ).bind(orderId).run();
}

async function fulfillmentSummary(env: Env, orderId: string) {
  const order = await env.DB.prepare(
    `SELECT id,status,fulfillment_status,total_cents FROM orders WHERE id=?1 LIMIT 1`,
  ).bind(orderId).first();
  const fulfillments = await env.DB.prepare(
    `SELECT f.id,f.supplier_id,s.name AS supplier_name,f.status,
            COUNT(fi.id) AS item_count,SUM(fi.quantity) AS total_units
     FROM fulfillments f
     LEFT JOIN suppliers s ON s.id=f.supplier_id
     LEFT JOIN fulfillment_items fi ON fi.fulfillment_id=f.id
     WHERE f.order_id=?1
     GROUP BY f.id,f.supplier_id,s.name,f.status
     ORDER BY f.id`,
  ).bind(orderId).all();
  const items = await env.DB.prepare(
    `SELECT oi.name_snapshot,oi.kind,oi.product_id,fi.quantity,
            ps.supplier_variant_label,ps.cost_cents,ps.supplier_url,
            f.supplier_id
     FROM fulfillment_items fi
     JOIN fulfillments f ON f.id=fi.fulfillment_id
     JOIN order_items oi ON oi.id=fi.order_item_id
     LEFT JOIN product_sources ps ON ps.id=fi.product_source_id
     WHERE f.order_id=?1
     ORDER BY f.id,oi.id`,
  ).bind(orderId).all();
  return { order, fulfillments: fulfillments.results ?? [], items: items.results ?? [] };
}

async function orderIdFromPayment(env: Env, paymentId: string) {
  const payment = await env.DB.prepare(
    `SELECT order_id FROM payments WHERE provider='mercado-pago' AND provider_payment_id=?1 LIMIT 1`,
  ).bind(paymentId).first<{ order_id: string }>();
  return payment?.order_id ?? null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/test/fulfillment/prepare" && request.method === "POST") {
      if (env.MERCADO_PAGO_ENV !== "test") {
        return new Response(JSON.stringify({ error: "Not available outside test environment." }), {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      try {
        const body = (await request.json()) as { orderId?: string };
        if (!body.orderId) throw new Error("orderId é obrigatório.");
        await prepareFulfillments(env, body.orderId);
        return new Response(JSON.stringify({ ok: true, ...(await fulfillmentSummary(env, body.orderId)) }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Falha no teste de fulfillment." }), {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
    }

    const webhookCopy = url.pathname === "/webhooks/mercado-pago" ? request.clone() : null;
    const response = await baseWorker.fetch(request, env);

    if (url.pathname === "/health" && request.method === "GET" && response.ok) {
      try {
        const data = (await response.clone().json()) as Record<string, unknown>;
        return new Response(
          JSON.stringify({ ...data, version: "0.6.1", fulfillment: "configured" }),
          { status: response.status, headers: response.headers },
        );
      } catch {
        return response;
      }
    }

    if (url.pathname === "/checkout" && request.method === "POST" && response.ok) {
      try {
        const data = (await response.clone().json()) as CheckoutResponse;
        if (data.orderId) await ensureExecutiveSetComponents(env, data.orderId);
      } catch (error) {
        console.error("Could not expand Executive Set physical components", error);
      }
      return response;
    }

    if (url.pathname === "/webhooks/mercado-pago" && request.method === "POST" && response.ok && webhookCopy) {
      try {
        const body = (await webhookCopy.json()) as MercadoPagoWebhookBody;
        if (body.type === "payment" && body.data?.id !== undefined) {
          const paymentId = String(body.data.id);
          const orderId = await orderIdFromPayment(env, paymentId);
          if (orderId) await prepareFulfillments(env, orderId);
        }
      } catch (error) {
        console.error("Fulfillment preparation failed", error);
        return new Response("Fulfillment preparation failed", { status: 500 });
      }
    }

    return response;
  },
};
