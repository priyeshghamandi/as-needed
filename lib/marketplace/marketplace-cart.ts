export const MARKETPLACE_REQUEST_CART_KEY = "marketplace_request_cart";
export const MARKETPLACE_CART_MAX = 5;

export type MarketplaceRequestCart = {
  professionalIds: string[];
  role: string;
  needStart: string | null;
  needEnd: string | null;
  urgency: string | null;
  shiftType: string | null;
  locationDisplayName: string | null;
};

/** Post-login destination until Customer Requests module ships. Cart stays in sessionStorage. */
export function buildMarketplaceContinueRequestUrl(): string {
  return `/login?callbackUrl=${encodeURIComponent("/facility/requests")}`;
}

export function readMarketplaceCart(): MarketplaceRequestCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MARKETPLACE_REQUEST_CART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MarketplaceRequestCart;
  } catch {
    return null;
  }
}

export function writeMarketplaceCart(cart: MarketplaceRequestCart): void {
  sessionStorage.setItem(MARKETPLACE_REQUEST_CART_KEY, JSON.stringify(cart));
}

export function toggleCartProfessional(
  cart: MarketplaceRequestCart,
  professionalId: string,
): MarketplaceRequestCart {
  const has = cart.professionalIds.includes(professionalId);
  if (has) {
    return {
      ...cart,
      professionalIds: cart.professionalIds.filter((id) => id !== professionalId),
    };
  }
  if (cart.professionalIds.length >= MARKETPLACE_CART_MAX) {
    return cart;
  }
  return {
    ...cart,
    professionalIds: [...cart.professionalIds, professionalId],
  };
}
