type Env = {
  FRONTEND_ORIGIN: string;
};

function corsHeaders(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json(env, {
        ok: true,
        service: "verani-ferraro-api",
        version: "0.1.0",
      });
    }

    if (request.method === "POST" && url.pathname === "/checkout") {
      return json(
        env,
        {
          error: "Checkout ainda não ativado. Banco D1 e Mercado Pago serão conectados na próxima etapa.",
        },
        503,
      );
    }

    return json(env, { error: "Rota não encontrada." }, 404);
  },
};
