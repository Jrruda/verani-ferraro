type Env = {
  FRONTEND_ORIGIN: string;
  MERCADO_PAGO_ACCESS_TOKEN: string;
  MERCADO_PAGO_WEBHOOK_SECRET: string;
  MERCADO_PAGO_ENV: "test" | "production";
  DB: D1Database;
};

type ProductRow = {
  id: string;
  name: string;
  category: "watch" | "sunglasses" | "optical-frame" | "gift";
  price_cents: number;
  active: number;
  eligible_for_executive_set: number;
  track_inventory: number;
  stock_quantity: number | null;
};

type OfferRow = {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
  active: number;
  included_gift_product_id: string | null;
};

type OrderRow = {
  id: string;
  status: string;
  currency: string;
  total_cents: number;
  external_reference: string;
};

type CheckoutItem =
  | { kind: "product"; productId: string; quantity: number }
  | { kind: "executive-set"; watchId: string; glassesId: string; quantity: number };

type QuoteLine = {
  kind: "product" | "executive-set";
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  productId?: string;
  watchId?: string;
  glassesId?: string;
};

type MercadoPagoPreference = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
  error?: string;
};

type MercadoPagoWebhookBody = {
  id?: string | number;
  action?: string;
  type?: string;
  live_mode?: boolean;
  data?: { id?: string | number };
};

type MercadoPagoPayment = {
  id: string | number;
  status: string;
  status_detail?: string;
  currency_id: string;
  transaction_amount: string | number;
  external_reference?: string | null;
  metadata?: Record<string, unknown>;
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function corsHeaders(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(env: Env, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env),
    },
  });
}

function assertQuantity(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 10) {
    throw new HttpError(400, "Quantidade inválida. Use um valor entre 1 e 10.");
  }
  return Number(value);
}

function parseCheckoutItems(body: unknown): CheckoutItem[] {
  if (!body || typeof body !== "object") throw new HttpError(400, "Payload inválido.");

  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Seu carrinho está vazio.");
  if (items.length > 20) throw new HttpError(400, "Carrinho com itens demais para uma única compra.");

  return items.map((raw): CheckoutItem => {
    if (!raw || typeof raw !== "object") throw new HttpError(400, "Item inválido.");
    const item = raw as Record<string, unknown>;
    const quantity = assertQuantity(item.quantity);

    if (item.kind === "product") {
      if (typeof item.productId !== "string" || !item.productId.trim()) {
        throw new HttpError(400, "Produto inválido.");
      }
      return { kind: "product", productId: item.productId, quantity };
    }

    if (item.kind === "executive-set") {
      if (
        typeof item.watchId !== "string" || !item.watchId.trim() ||
        typeof item.glassesId !== "string" || !item.glassesId.trim()
      ) {
        throw new HttpError(400, "Seleção do Executive Set inválida.");
      }
      return { kind: "executive-set", watchId: item.watchId, glassesId: item.glassesId, quantity };
    }

    throw new HttpError(400, "Tipo de item inválido.");
  });
}

async function getProduct(env: Env, id: string) {
  return env.DB.prepare(
    `SELECT id, name, category, price_cents, active, eligible_for_executive_set,
            track_inventory, stock_quantity
       FROM products
      WHERE id = ?1
      LIMIT 1`,
  ).bind(id).first<ProductRow>();
}

async function getExecutiveSetOffer(env: Env) {
  return env.DB.prepare(
    `SELECT id, name, price_cents, currency, active, included_gift_product_id
       FROM offers
      WHERE id = 'executive-set'
      LIMIT 1`,
  ).first<OfferRow>();
}

function assertAvailable(product: ProductRow | null, quantity: number) {
  if (!product || product.active !== 1) throw new HttpError(400, "Um dos produtos não está disponível.");
  if (product.track_inventory === 1 && product.stock_quantity !== null && product.stock_quantity < quantity) {
    throw new HttpError(409, `${product.name} não possui estoque suficiente.`);
  }
}

async function buildQuote(env: Env, items: CheckoutItem[]) {
  const lines: QuoteLine[] = [];

  for (const item of items) {
    if (item.kind === "product") {
      const product = await getProduct(env, item.productId);
      assertAvailable(product, item.quantity);
      if (!product) throw new HttpError(400, "Produto inválido.");

      const lineTotalCents = product.price_cents * item.quantity;
      lines.push({
        kind: "product",
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPriceCents: product.price_cents,
        lineTotalCents,
      });
      continue;
    }

    const [offer, watch, glasses] = await Promise.all([
      getExecutiveSetOffer(env),
      getProduct(env, item.watchId),
      getProduct(env, item.glassesId),
    ]);

    if (!offer || offer.active !== 1) throw new HttpError(400, "The Executive Set não está disponível.");
    assertAvailable(watch, item.quantity);
    assertAvailable(glasses, item.quantity);

    if (!watch || watch.category !== "watch" || watch.eligible_for_executive_set !== 1) {
      throw new HttpError(400, "Relógio inválido para o Executive Set.");
    }
    if (!glasses || !["sunglasses", "optical-frame"].includes(glasses.category) || glasses.eligible_for_executive_set !== 1) {
      throw new HttpError(400, "Óculos inválido para o Executive Set.");
    }

    const lineTotalCents = offer.price_cents * item.quantity;
    lines.push({
      kind: "executive-set",
      watchId: watch.id,
      glassesId: glasses.id,
      name: offer.name,
      quantity: item.quantity,
      unitPriceCents: offer.price_cents,
      lineTotalCents,
    });
  }

  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return { currency: "BRL", totalCents, items: lines };
}

async function saveDraftOrder(env: Env, quote: Awaited<ReturnType<typeof buildQuote>>) {
  const orderId = crypto.randomUUID();
  const externalReference = `vf-${orderId}`;
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO orders (id, external_reference, status, currency, subtotal_cents, shipping_cents, total_cents)
       VALUES (?1, ?2, 'draft', ?3, ?4, 0, ?4)`,
    ).bind(orderId, externalReference, quote.currency, quote.totalCents),
  ];

  for (const line of quote.items) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO order_items
          (order_id, kind, product_id, offer_id, watch_id, glasses_id, name_snapshot, unit_price_cents, quantity, line_total_cents)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
      ).bind(
        orderId,
        line.kind,
        line.productId ?? null,
        line.kind === "executive-set" ? "executive-set" : null,
        line.watchId ?? null,
        line.glassesId ?? null,
        line.name,
        line.unitPriceCents,
        line.quantity,
        line.lineTotalCents,
      ),
    );
  }

  await env.DB.batch(statements);
  return { orderId, externalReference };
}

async function createMercadoPagoPreference(
  env: Env,
  quote: Awaited<ReturnType<typeof buildQuote>>,
  order: { orderId: string; externalReference: string },
) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new HttpError(503, "Mercado Pago ainda não foi configurado no servidor.");
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: quote.items.map((line) => ({
        id: line.kind === "product" ? line.productId : "executive-set",
        title: line.name,
        quantity: line.quantity,
        currency_id: quote.currency,
        unit_price: line.unitPriceCents / 100,
      })),
      external_reference: order.externalReference,
      back_urls: {
        success: `${env.FRONTEND_ORIGIN}/pagamento/sucesso`,
        pending: `${env.FRONTEND_ORIGIN}/pagamento/pendente`,
        failure: `${env.FRONTEND_ORIGIN}/pagamento/erro`,
      },
      auto_return: "approved",
      metadata: {
        order_id: order.orderId,
      },
    }),
  });

  const result = (await response.json()) as MercadoPagoPreference;
  if (!response.ok || !result.id) {
    await env.DB.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?1")
      .bind(order.orderId)
      .run();
    throw new HttpError(502, result.message || result.error || "Mercado Pago recusou a criação do checkout.");
  }

  const checkoutUrl = env.MERCADO_PAGO_ENV === "production" ? result.init_point : result.sandbox_init_point;
  if (!checkoutUrl) {
    throw new HttpError(502, "Mercado Pago não retornou uma URL de checkout válida.");
  }

  await env.DB.prepare(
    `UPDATE orders
        SET status = 'pending', mercado_pago_preference_id = ?2, updated_at = datetime('now')
      WHERE id = ?1`,
  ).bind(order.orderId, result.id).run();

  return { checkoutUrl, preferenceId: result.id, orderId: order.orderId };
}

function parseSignatureHeader(value: string) {
  const fields = new Map<string, string>();
  for (const part of value.split(",")) {
    const [key, ...rest] = part.trim().split("=");
    if (key && rest.length) fields.set(key, rest.join("="));
  }
  return { ts: fields.get("ts") ?? "", hash: fields.get("v1") ?? "" };
}

function normalizeSignatureDataId(value: string) {
  return /^[a-z0-9]+$/i.test(value) ? value.toLowerCase() : value;
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function validateMercadoPagoSignature(request: Request, url: URL, env: Env) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET) return false;

  const xSignature = request.headers.get("x-signature");
  if (!xSignature) return false;

  const { ts, hash } = parseSignatureHeader(xSignature);
  if (!ts || !hash) return false;

  const dataId = url.searchParams.get("data.id");
  const requestId = request.headers.get("x-request-id");
  let manifest = "";
  if (dataId) manifest += `id:${normalizeSignatureDataId(dataId)};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.MERCADO_PAGO_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  return constantTimeEqualHex(bytesToHex(signature), hash.toLowerCase());
}

async function fetchMercadoPagoPayment(env: Env, paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}` },
  });
  if (!response.ok) throw new HttpError(502, "Não foi possível consultar o pagamento no Mercado Pago.");
  return (await response.json()) as MercadoPagoPayment;
}

function mapPaymentStatus(status: string) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  if (status === "refunded" || status === "charged_back") return "refunded";
  return "pending";
}

async function recordPaymentEvent(
  env: Env,
  providerEventId: string,
  orderId: string | null,
  eventType: string,
  payload: unknown,
) {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO payment_events
      (provider, provider_event_id, order_id, event_type, payload_json)
     VALUES ('mercado-pago', ?1, ?2, ?3, ?4)`,
  ).bind(providerEventId, orderId, eventType, JSON.stringify(payload)).run();
}

async function processMercadoPagoWebhook(request: Request, url: URL, env: Env) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 503 });
  }

  const signatureIsValid = await validateMercadoPagoSignature(request, url, env);
  if (!signatureIsValid) return new Response("Invalid signature", { status: 401 });

  let body: MercadoPagoWebhookBody;
  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const notificationType = String(body.type ?? url.searchParams.get("type") ?? "");
  const paymentId = String(body.data?.id ?? url.searchParams.get("data.id") ?? "");
  const requestId = request.headers.get("x-request-id") ?? "";
  const providerEventId = `payment:${String(body.id ?? requestId || paymentId)}`;

  if (notificationType !== "payment" || !paymentId) {
    await recordPaymentEvent(env, providerEventId, null, notificationType || "unknown", body);
    return new Response(null, { status: 200 });
  }

  const payment = await fetchMercadoPagoPayment(env, paymentId);
  const externalReference = payment.external_reference ?? "";
  if (!externalReference) {
    await recordPaymentEvent(env, providerEventId, null, body.action ?? "payment", payment);
    return new Response(null, { status: 200 });
  }

  const order = await env.DB.prepare(
    `SELECT id, status, currency, total_cents, external_reference
       FROM orders
      WHERE external_reference = ?1
      LIMIT 1`,
  ).bind(externalReference).first<OrderRow>();

  if (!order) {
    await recordPaymentEvent(env, providerEventId, null, body.action ?? "payment", payment);
    return new Response(null, { status: 200 });
  }

  const amountCents = Math.round(Number(payment.transaction_amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents !== order.total_cents || payment.currency_id !== order.currency) {
    console.error("Mercado Pago payment did not match order", {
      orderId: order.id,
      paymentId,
      expectedAmount: order.total_cents,
      receivedAmount: amountCents,
      expectedCurrency: order.currency,
      receivedCurrency: payment.currency_id,
    });
    await recordPaymentEvent(env, providerEventId, order.id, "payment.validation_failed", payment);
    return new Response(null, { status: 200 });
  }

  const mappedStatus = mapPaymentStatus(payment.status);
  const paymentRecordId = `mp-${paymentId}`;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO payments
        (id, order_id, provider, provider_payment_id, status, amount_cents, raw_json)
       VALUES (?1, ?2, 'mercado-pago', ?3, ?4, ?5, ?6)
       ON CONFLICT(provider_payment_id) DO UPDATE SET
         status = excluded.status,
         amount_cents = excluded.amount_cents,
         raw_json = excluded.raw_json,
         updated_at = datetime('now')`,
    ).bind(paymentRecordId, order.id, paymentId, payment.status, amountCents, JSON.stringify(payment)),
    env.DB.prepare(
      `UPDATE orders
          SET status = CASE
            WHEN ?2 IN ('approved', 'refunded') THEN ?2
            WHEN status IN ('approved', 'refunded') THEN status
            ELSE ?2
          END,
          updated_at = datetime('now')
        WHERE id = ?1`,
    ).bind(order.id, mappedStatus),
  ]);

  await recordPaymentEvent(env, providerEventId, order.id, body.action ?? "payment", body);
  return new Response(null, { status: 200 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(env) });

    try {
      if (request.method === "POST" && url.pathname === "/webhooks/mercado-pago") {
        return await processMercadoPagoWebhook(request, url, env);
      }

      if (request.method === "GET" && url.pathname === "/health") {
        const dbCheck = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return json(env, {
          ok: dbCheck?.ok === 1,
          service: "verani-ferraro-api",
          version: "0.4.0",
          database: dbCheck?.ok === 1 ? "connected" : "unavailable",
          mercadoPago: env.MERCADO_PAGO_ACCESS_TOKEN ? "configured" : "missing",
          webhook: env.MERCADO_PAGO_WEBHOOK_SECRET ? "configured" : "missing",
          environment: env.MERCADO_PAGO_ENV || "test",
        });
      }

      if (request.method === "POST" && url.pathname === "/checkout/quote") {
        let body: unknown;
        try { body = await request.json(); } catch { throw new HttpError(400, "JSON inválido."); }
        const items = parseCheckoutItems(body);
        return json(env, await buildQuote(env, items));
      }

      if (request.method === "POST" && url.pathname === "/checkout") {
        let body: unknown;
        try { body = await request.json(); } catch { throw new HttpError(400, "JSON inválido."); }
        const items = parseCheckoutItems(body);
        const quote = await buildQuote(env, items);
        const order = await saveDraftOrder(env, quote);
        const checkout = await createMercadoPagoPreference(env, quote, order);
        return json(env, checkout);
      }

      return json(env, { error: "Rota não encontrada." }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json(env, { error: error.message }, error.status);
      console.error(error);
      return json(env, { error: "Erro interno ao processar a solicitação." }, 500);
    }
  },
};
