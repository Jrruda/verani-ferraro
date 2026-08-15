type Env = {
  FRONTEND_ORIGIN: string;
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
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Payload inválido.");
  }

  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Seu carrinho está vazio.");
  }
  if (items.length > 20) {
    throw new HttpError(400, "Carrinho com itens demais para uma única compra.");
  }

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
        typeof item.watchId !== "string" ||
        !item.watchId.trim() ||
        typeof item.glassesId !== "string" ||
        !item.glassesId.trim()
      ) {
        throw new HttpError(400, "Seleção do Executive Set inválida.");
      }
      return {
        kind: "executive-set",
        watchId: item.watchId,
        glassesId: item.glassesId,
        quantity,
      };
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
  )
    .bind(id)
    .first<ProductRow>();
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
  if (!product || product.active !== 1) {
    throw new HttpError(400, "Um dos produtos não está disponível.");
  }
  if (
    product.track_inventory === 1 &&
    product.stock_quantity !== null &&
    product.stock_quantity < quantity
  ) {
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

    if (!offer || offer.active !== 1) {
      throw new HttpError(400, "The Executive Set não está disponível.");
    }

    assertAvailable(watch, item.quantity);
    assertAvailable(glasses, item.quantity);

    if (!watch || watch.category !== "watch" || watch.eligible_for_executive_set !== 1) {
      throw new HttpError(400, "Relógio inválido para o Executive Set.");
    }
    if (
      !glasses ||
      !["sunglasses", "optical-frame"].includes(glasses.category) ||
      glasses.eligible_for_executive_set !== 1
    ) {
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        const dbCheck = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return json(env, {
          ok: dbCheck?.ok === 1,
          service: "verani-ferraro-api",
          version: "0.2.0",
          database: dbCheck?.ok === 1 ? "connected" : "unavailable",
        });
      }

      if (request.method === "POST" && url.pathname === "/checkout/quote") {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new HttpError(400, "JSON inválido.");
        }

        const items = parseCheckoutItems(body);
        const quote = await buildQuote(env, items);
        return json(env, quote);
      }

      if (request.method === "POST" && url.pathname === "/checkout") {
        return json(
          env,
          {
            error: "Checkout ainda não ativado. A validação de preços já está no D1; Mercado Pago será conectado na próxima etapa.",
          },
          503,
        );
      }

      return json(env, { error: "Rota não encontrada." }, 404);
    } catch (error) {
      if (error instanceof HttpError) {
        return json(env, { error: error.message }, error.status);
      }
      console.error(error);
      return json(env, { error: "Erro interno ao processar a solicitação." }, 500);
    }
  },
};
