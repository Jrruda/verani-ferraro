import fulfillmentWorker from "./main";

type Env = {
  FRONTEND_ORIGIN: string;
  MERCADO_PAGO_ACCESS_TOKEN: string;
  MERCADO_PAGO_WEBHOOK_SECRET: string;
  MERCADO_PAGO_ENV: "test" | "production";
  ADMIN_API_KEY?: string;
  DB: D1Database;
};

type CheckoutResponse = { orderId?: string };

type ProductExportRow = {
  product_id: string;
  supplier_url: string | null;
};

type OrderExportRow = {
  order_id: string;
  external_reference: string;
  created_at: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_document: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string | null;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
};

const states: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapa", AM: "Amazonas", BA: "Bahia", CE: "Ceara",
  DF: "Distrito Federal", ES: "Espirito Santo", GO: "Goias", MA: "Maranhao", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Para", PB: "Paraiba", PR: "Parana",
  PE: "Pernambuco", PI: "Piaui", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondonia", RR: "Roraima", SC: "Santa Catarina",
  SP: "Sao Paulo", SE: "Sergipe", TO: "Tocantins",
};

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(headers: string[], rows: unknown[][], filename: string) {
  const body = [headers.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\r\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function plainAddress(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function authorized(request: Request, env: Env) {
  if (!env.ADMIN_API_KEY) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${env.ADMIN_API_KEY}`;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function exportProducts(env: Env) {
  const result = await env.DB.prepare(
    `SELECT p.id AS product_id,
            (SELECT ps.supplier_url
             FROM product_sources ps
             WHERE ps.product_id=p.id AND ps.active=1
             ORDER BY ps.priority ASC, ps.id ASC LIMIT 1) AS supplier_url
     FROM products p
     WHERE p.active=1
       AND EXISTS (SELECT 1 FROM product_sources ps WHERE ps.product_id=p.id AND ps.active=1)
     ORDER BY p.id`,
  ).all<ProductExportRow>();

  const rows = (result.results ?? []).map((row) => [
    row.product_id,
    row.product_id,
    row.supplier_url ?? "",
    "",
  ]);

  return csv(
    [
      "product_id",
      "SKU（your product SKU）",
      "Supplier_url（Optional）",
      "SKU（Supplier SKU）（Optional）",
    ],
    rows,
    `vf-dsers-products-${env.MERCADO_PAGO_ENV}.csv`,
  );
}

async function exportOrders(env: Env) {
  const result = await env.DB.prepare(
    `SELECT DISTINCT
       o.id AS order_id,o.external_reference,o.created_at,
       oi.product_id,fi.quantity,
       o.customer_name,o.customer_phone,o.customer_email,o.customer_document,
       o.shipping_street,o.shipping_number,o.shipping_complement,o.shipping_neighborhood,
       o.shipping_city,o.shipping_state,o.shipping_zip_code
     FROM orders o
     JOIN fulfillments f ON f.order_id=o.id
     JOIN fulfillment_items fi ON fi.fulfillment_id=f.id
     JOIN order_items oi ON oi.id=fi.order_item_id
     WHERE o.status='approved'
       AND o.fulfillment_status='ready'
       AND f.status='ready'
       AND o.environment=?1
       AND oi.product_id IS NOT NULL
     ORDER BY o.created_at ASC,o.id ASC,oi.id ASC`,
  ).bind(env.MERCADO_PAGO_ENV).all<OrderExportRow>();

  const rows = (result.results ?? []).map((row) => {
    const address1 = plainAddress(`${row.shipping_street} ${row.shipping_number}`);
    const address2 = plainAddress([row.shipping_complement, row.shipping_neighborhood].filter(Boolean).join(" ")) || plainAddress(row.shipping_neighborhood);
    const date = row.created_at.slice(0, 10);
    return [
      row.external_reference,
      date,
      "Brazil",
      row.product_id,
      row.product_id,
      row.quantity,
      "Verani Ferraro",
      row.customer_name,
      row.customer_phone.replace(/[^0-9+]/g, ""),
      row.customer_email,
      address1,
      address2,
      states[row.shipping_state] ?? row.shipping_state,
      plainAddress(row.shipping_city),
      row.shipping_zip_code.replace(/\D/g, ""),
      "",
      "",
      "",
      row.customer_document.replace(/\D/g, ""),
      "",
      "",
    ];
  });

  return csv(
    [
      "Order number", "Date", "Country", "Product id", "SKU", "Product count", "Order memo",
      "Contact person", "Mobile no", "Email", "Address", "Address2", "Province", "City", "Zip",
      "RUT", "Personal Clearance ID", "Passport/ Alien registration Card Number", "cpf",
      "Turkish ID Number", "Passport Number",
    ],
    rows,
    `vf-dsers-orders-${env.MERCADO_PAGO_ENV}.csv`,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/admin/dsers/products.csv" && request.method === "GET") {
      if (!authorized(request, env)) return unauthorized();
      return exportProducts(env);
    }

    if (url.pathname === "/admin/dsers/orders.csv" && request.method === "GET") {
      if (!authorized(request, env)) return unauthorized();
      return exportOrders(env);
    }

    const response = await fulfillmentWorker.fetch(request, env);

    if (url.pathname === "/checkout" && request.method === "POST" && response.ok) {
      try {
        const data = (await response.clone().json()) as CheckoutResponse;
        if (data.orderId) {
          await env.DB.prepare(
            `UPDATE orders SET environment=?2,updated_at=datetime('now') WHERE id=?1`,
          ).bind(data.orderId, env.MERCADO_PAGO_ENV).run();
        }
      } catch (error) {
        console.error("Could not tag order environment", error);
      }
    }

    if (url.pathname === "/health" && request.method === "GET" && response.ok) {
      try {
        const data = (await response.clone().json()) as Record<string, unknown>;
        return new Response(JSON.stringify({
          ...data,
          version: "0.7.2",
          dsersExport: env.ADMIN_API_KEY ? "configured" : "missing",
        }), { status: response.status, headers: response.headers });
      } catch {
        return response;
      }
    }

    return response;
  },
};
