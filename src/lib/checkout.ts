import type { CartItem } from "@/components/cart-provider";

export type CheckoutItem =
  | {
      kind: "product";
      productId: string;
      quantity: number;
    }
  | {
      kind: "executive-set";
      watchId: string;
      glassesId: string;
      quantity: number;
    };

type CheckoutResponse = {
  checkoutUrl?: string;
  error?: string;
};

const DEFAULT_API_URL = "https://verani-ferraro-api.jdearrudaalmeida.workers.dev";

export function buildCheckoutItems(items: CartItem[]): CheckoutItem[] {
  return items.map((item) => {
    if (item.kind === "product") {
      return {
        kind: "product",
        productId: item.id,
        quantity: item.quantity,
      };
    }

    if (!item.selection?.watchId || !item.selection.glassesId) {
      throw new Error("Seu Executive Set precisa ser selecionado novamente antes do pagamento.");
    }

    return {
      kind: "executive-set",
      watchId: item.selection.watchId,
      glassesId: item.selection.glassesId,
      quantity: item.quantity,
    };
  });
}

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).trim().replace(/\/$/, "");
}

export async function startCheckout(items: CartItem[]) {
  if (typeof window === "undefined") {
    throw new Error("O checkout deve ser iniciado no navegador.");
  }
  if (!items.length) throw new Error("Seu carrinho está vazio.");

  const apiUrl = apiBaseUrl();

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: buildCheckoutItems(items) }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao pagamento agora. Tente novamente em instantes.");
  }

  let result: CheckoutResponse = {};
  try {
    result = (await response.json()) as CheckoutResponse;
  } catch {
    // A API pode falhar antes de produzir JSON. A mensagem abaixo permanece segura e genérica.
  }

  if (!response.ok) {
    throw new Error(result.error || "Não foi possível preparar o pagamento. Tente novamente.");
  }

  if (!result.checkoutUrl) {
    throw new Error("O pagamento não retornou um endereço válido. Tente novamente.");
  }

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(result.checkoutUrl);
  } catch {
    throw new Error("O pagamento retornou um endereço inválido.");
  }

  if (!['https:', 'http:'].includes(checkoutUrl.protocol)) {
    throw new Error("O pagamento retornou um endereço inválido.");
  }

  window.location.assign(checkoutUrl.toString());
}
