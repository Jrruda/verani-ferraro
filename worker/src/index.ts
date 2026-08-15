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

type CustomerInput = {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

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
  currency_id: string;
  transaction_amount: string | number;
  external_reference?: string | null;
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
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
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(env) },
  });
}

function quantity(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 10) {
    throw new HttpError(400, "Quantidade inválida. Use um valor entre 1 e 10.");
  }
  return Number(value);
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function digits(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.replace(/\D/g, "").slice(0, maxLength) : "";
}

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return (remainder === 10 ? 0 : remainder) === Number(cpf[length]);
  };
  return check(9) && check(10);
}

function parseCustomer(body: unknown): CustomerInput {
  if (!body || typeof body !== "object") throw new HttpError(400, "Dados do comprador não foram enviados.");
  const raw = (body as { customer?: unknown }).customer;
  if (!raw || typeof raw !== "object") throw new HttpError(400, "Preencha seus dados para entrega.");
  const customer = raw as Record<string, unknown>;

  const parsed: CustomerInput = {
    fullName: cleanText(customer.fullName, 120),
    email: cleanText(customer.email, 160).toLowerCase(),
    phone: digits(customer.phone, 11),
    document: digits(customer.document, 11),
    zipCode: digits(customer.zipCode, 8),
    street: cleanText(customer.street, 160),
    number: digits(customer.number, 8),
    complement: cleanText(customer.complement, 120),
    neighborhood: cleanText(customer.neighborhood, 100),
    city: cleanText(customer.city, 100),
    state: cleanText(customer.state, 2).toUpperCase(),
  };

  if (parsed.fullName.length < 3) throw new HttpError(400, "Informe seu nome completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) throw new HttpError(400, "Informe um e-mail válido.");
  if (parsed.phone.length < 10 || parsed.phone.length > 11) throw new HttpError(400, "Informe um telefone com DDD.");
  if (!isValidCpf(parsed.document)) throw new HttpError(400, "Informe um CPF válido.");
  if (parsed.zipCode.length !== 8) throw new HttpError(400, "Informe um CEP válido.");
  if (parsed.street.length < 2) throw new HttpError(400, "Informe a rua ou avenida.");
  if (!/^\d{1,8}$/.test(parsed.number) || Number(parsed.number) < 1) throw new HttpError(400, "Informe um número de endereço válido.");
  if (parsed.neighborhood.length < 2) throw new HttpError(400, "Informe o bairro.");
  if (parsed.city.length < 2) throw new HttpError(400, "Informe a cidade.");
  if (!/^[A-Z]{2}$/.test(parsed.state)) throw new HttpError(400, "Informe a UF com 2 letras.");

  return parsed;
}

function parseItems(body: unknown): CheckoutItem[] {
  if (!body || typeof body !== "object") throw new HttpError(400, "Payload inválido.");
  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Seu carrinho está vazio.");
  if (items.length > 20) throw new HttpError(400, "Carrinho com itens demais para uma única compra.");

  return items.map((raw) => {
    if (!raw || typeof raw !== "object") throw new HttpError(400, "Item inválido.");
    const item = raw as Record<string, unknown>;
    const q = quantity(item.quantity);

    if (item.kind === "product" && typeof item.productId === "string" && item.productId.trim()) {
      return { kind: "product", productId: item.productId, quantity: q };
    }
    if (
      item.kind === "executive-set" &&
      typeof item.watchId === "string" && item.watchId.trim() &&
      typeof item.glassesId === "string" && item.glassesId.trim()
    ) {
      return { kind: "executive-set", watchId: item.watchId, glassesId: item.glassesId, quantity: q };
    }
    throw new HttpError(400, "Item inválido.");
  });
}

async function getProduct(env: Env, id: string) {
  return env.DB.prepare(
    `SELECT id,name,category,price_cents,active,eligible_for_executive_set,track_inventory,stock_quantity
       FROM products WHERE id=?1 LIMIT 1`,
  ).bind(id).first<ProductRow>();
}

async function getOffer(env: Env) {
  return env.DB.prepare(
    `SELECT id,name,price_cents,currency,active FROM offers WHERE id='executive-set' LIMIT 1`,
  ).first<OfferRow>();
}

function assertAvailable(product: ProductRow | null, q: number) {
  if (!product || product.active !== 1) throw new HttpError(400, "Um dos produtos não está disponível.");
  if (product.track_inventory === 1 && product.stock_quantity !== null && product.stock_quantity < q) {
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
      lines.push({
        kind: "product",
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPriceCents: product.price_cents,
        lineTotalCents: product.price_cents * item.quantity,
      });
      continue;
    }

    const [offer, watch, glasses] = await Promise.all([
      getOffer(env), getProduct(env, item.watchId), getProduct(env, item.glassesId),
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
    lines.push({
      kind: "executive-set",
      watchId: watch.id,
      glassesId: glasses.id,
      name: offer.name,
      quantity: item.quantity,
      unitPriceCents: offer.price_cents,
      lineTotalCents: offer.price_cents * item.quantity,
    });
  }

  return {
    currency: "BRL",
    totalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
    items: lines,
  };
}

async function saveDraftOrder(
  env: Env,
  quote: Awaited<ReturnType<typeof buildQuote>>,
  customer: CustomerInput,
) {
  const orderId = crypto.randomUUID();
  const externalReference = `vf-${orderId}`;
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO orders
       (id,external_reference,status,currency,subtotal_cents,shipping_cents,total_cents,
        customer_email,customer_name,customer_phone,customer_document,
        shipping_zip_code,shipping_street,shipping_number,shipping_complement,
        shipping_neighborhood,shipping_city,shipping_state,shipping_country)
       VALUES (?1,?2,'draft',?3,?4,0,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,'BR')`,
    ).bind(
      orderId,
      externalReference,
      quote.currency,
      quote.totalCents,
      customer.email,
      customer.fullName,
      customer.phone,
      customer.document,
      customer.zipCode,
      customer.street,
      customer.number,
      customer.complement || null,
      customer.neighborhood,
      customer.city,
      customer.state,
    ),
  ];

  for (const line of quote.items) {
    statements.push(env.DB.prepare(
      `INSERT INTO order_items
       (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`,
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
    ));
  }

  await env.DB.batch(statements);
  return { orderId, externalReference };
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { name: parts[0] ?? fullName, surname: parts.slice(1).join(" ") };
}

async function createPreference(
  env: Env,
  quote: Awaited<ReturnType<typeof buildQuote>>,
  order: { orderId: string; externalReference: string },
  customer: CustomerInput,
) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) throw new HttpError(503, "Mercado Pago ainda não foi configurado no servidor.");
  const person = splitName(customer.fullName);
  const streetNumber = Number(customer.number);
  const areaCode = Number(customer.phone.slice(0, 2));
  const phoneNumber = Number(customer.phone.slice(2));

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
      payer: {
        name: person.name,
        surname: person.surname,
        email: customer.email,
        phone: { area_code: areaCode, number: phoneNumber },
        identification: { type: "CPF", number: customer.document },
        address: {
          zip_code: customer.zipCode,
          street_name: customer.street,
          street_number: streetNumber,
        },
      },
      shipments: {
        local_pickup: false,
        cost: 0,
        free_shipping: true,
        receiver_address: {
          zip_code: customer.zipCode,
          street_name: customer.street,
          street_number: streetNumber,
          city_name: customer.city,
          state_name: customer.state,
          country_name: "Brasil",
        },
      },
      external_reference: order.externalReference,
      back_urls: {
        success: `${env.FRONTEND_ORIGIN}/pagamento/sucesso`,
        pending: `${env.FRONTEND_ORIGIN}/pagamento/pendente`,
        failure: `${env.FRONTEND_ORIGIN}/pagamento/erro`,
      },
      auto_return: "approved",
      metadata: { order_id: order.orderId },
    }),
  });

  const result = (await response.json()) as MercadoPagoPreference;
  if (!response.ok || !result.id) {
    await env.DB.prepare("UPDATE orders SET status='cancelled',updated_at=datetime('now') WHERE id=?1")
      .bind(order.orderId).run();
    throw new HttpError(502, result.message || result.error || "Mercado Pago recusou a criação do checkout.");
  }

  const checkoutUrl = env.MERCADO_PAGO_ENV === "production" ? result.init_point : result.sandbox_init_point;
  if (!checkoutUrl) throw new HttpError(502, "Mercado Pago não retornou uma URL de checkout válida.");

  await env.DB.prepare(
    `UPDATE orders SET status='pending',mercado_pago_preference_id=?2,updated_at=datetime('now') WHERE id=?1`,
  ).bind(order.orderId, result.id).run();

  return { checkoutUrl, preferenceId: result.id, orderId: order.orderId };
}

function parseSignature(header: string) {
  const parts = new Map<string, string>();
  for (const piece of header.split(",")) {
    const [key, ...rest] = piece.trim().split("=");
    if (key && rest.length) parts.set(key, rest.join("="));
  }
  return { ts: parts.get("ts") ?? "", hash: parts.get("v1") ?? "" };
}

function normalizeDataId(value: string) {
  return /^[a-z0-9]+$/i.test(value) ? value.toLowerCase() : value;
}

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyWebhookSignature(request: Request, url: URL, env: Env) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET) return false;
  const xSignature = request.headers.get("x-signature");
  if (!xSignature) return false;
  const { ts, hash } = parseSignature(xSignature);
  if (!ts || !hash) return false;

  const dataId = url.searchParams.get("data.id");
  const requestId = request.headers.get("x-request-id");
  let manifest = "";
  if (dataId) manifest += `id:${normalizeDataId(dataId)};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.MERCADO_PAGO_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  return constantTimeEqual(hex(signed), hash.toLowerCase());
}

async function fetchPayment(env: Env, paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new HttpError(502, "Não foi possível consultar o pagamento no Mercado Pago.");
  return (await response.json()) as MercadoPagoPayment;
}

function orderStatus(paymentStatus: string) {
  if (paymentStatus === "approved") return "approved";
  if (paymentStatus === "rejected") return "rejected";
  if (paymentStatus === "cancelled" || paymentStatus === "canceled") return "cancelled";
  if (paymentStatus === "refunded" || paymentStatus === "charged_back") return "refunded";
  return "pending";
}

async function recordEvent(env: Env, eventId: string, orderId: string | null, type: string, payload: unknown) {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO payment_events (provider,provider_event_id,order_id,event_type,payload_json)
     VALUES ('mercado-pago',?1,?2,?3,?4)`,
  ).bind(eventId, orderId, type, JSON.stringify(payload)).run();
}

async function handleWebhook(request: Request, url: URL, env: Env) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET) return new Response("Webhook secret not configured", { status: 503 });
  if (!(await verifyWebhookSignature(request, url, env))) return new Response("Invalid signature", { status: 401 });

  let body: MercadoPagoWebhookBody;
  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const type = String(body.type ?? url.searchParams.get("type") ?? "");
  const paymentId = String(body.data?.id ?? url.searchParams.get("data.id") ?? "");
  const requestId = request.headers.get("x-request-id") ?? "";
  const rawEventId = body.id ?? (requestId || paymentId || crypto.randomUUID());
  const eventId = `payment:${String(rawEventId)}`;

  if (type !== "payment" || !paymentId) {
    await recordEvent(env, eventId, null, type || "unknown", body);
    return new Response(null, { status: 200 });
  }

  const payment = await fetchPayment(env, paymentId);
  if (!payment) {
    await recordEvent(env, eventId, null, body.action ?? "payment.simulated", body);
    return new Response(null, { status: 200 });
  }

  const externalReference = payment.external_reference ?? "";
  if (!externalReference) {
    await recordEvent(env, eventId, null, body.action ?? "payment", payment);
    return new Response(null, { status: 200 });
  }

  const order = await env.DB.prepare(
    `SELECT id,status,currency,total_cents,external_reference FROM orders WHERE external_reference=?1 LIMIT 1`,
  ).bind(externalReference).first<OrderRow>();

  if (!order) {
    await recordEvent(env, eventId, null, body.action ?? "payment", payment);
    return new Response(null, { status: 200 });
  }

  const amountCents = Math.round(Number(payment.transaction_amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents !== order.total_cents || payment.currency_id !== order.currency) {
    console.error("Mercado Pago payment did not match order", { orderId: order.id, paymentId });
    await recordEvent(env, eventId, order.id, "payment.validation_failed", payment);
    return new Response(null, { status: 200 });
  }

  const mappedStatus = orderStatus(payment.status);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO payments (id,order_id,provider,provider_payment_id,status,amount_cents,raw_json)
       VALUES (?1,?2,'mercado-pago',?3,?4,?5,?6)
       ON CONFLICT(provider_payment_id) DO UPDATE SET
         status=excluded.status,amount_cents=excluded.amount_cents,raw_json=excluded.raw_json,updated_at=datetime('now')`,
    ).bind(`mp-${paymentId}`, order.id, paymentId, payment.status, amountCents, JSON.stringify(payment)),
    env.DB.prepare(
      `UPDATE orders SET status=CASE
         WHEN ?2 IN ('approved','refunded') THEN ?2
         WHEN status IN ('approved','refunded') THEN status
         ELSE ?2 END,
       updated_at=datetime('now') WHERE id=?1`,
    ).bind(order.id, mappedStatus),
  ]);

  await recordEvent(env, eventId, order.id, body.action ?? "payment", body);
  return new Response(null, { status: 200 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(env) });

    try {
      if (request.method === "POST" && url.pathname === "/webhooks/mercado-pago") {
        return await handleWebhook(request, url, env);
      }

      if (request.method === "GET" && url.pathname === "/health") {
        const db = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return json(env, {
          ok: db?.ok === 1,
          service: "verani-ferraro-api",
          version: "0.5.0",
          database: db?.ok === 1 ? "connected" : "unavailable",
          mercadoPago: env.MERCADO_PAGO_ACCESS_TOKEN ? "configured" : "missing",
          webhook: env.MERCADO_PAGO_WEBHOOK_SECRET ? "configured" : "missing",
          environment: env.MERCADO_PAGO_ENV || "test",
        });
      }

      if (request.method === "POST" && url.pathname === "/checkout/quote") {
        let body: unknown;
        try { body = await request.json(); } catch { throw new HttpError(400, "JSON inválido."); }
        return json(env, await buildQuote(env, parseItems(body)));
      }

      if (request.method === "POST" && url.pathname === "/checkout") {
        let body: unknown;
        try { body = await request.json(); } catch { throw new HttpError(400, "JSON inválido."); }
        const items = parseItems(body);
        const customer = parseCustomer(body);
        const quote = await buildQuote(env, items);
        const order = await saveDraftOrder(env, quote, customer);
        return json(env, await createPreference(env, quote, order, customer));
      }

      return json(env, { error: "Rota não encontrada." }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json(env, { error: error.message }, error.status);
      console.error(error);
      return json(env, { error: "Erro interno ao processar a solicitação." }, 500);
    }
  },
};
