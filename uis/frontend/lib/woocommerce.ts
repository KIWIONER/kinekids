/**
 * Servicio de Integración con WooCommerce REST API (Proxy Headless para Hertwill)
 */

export interface WooCommerceCustomerAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooCommerceLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  sku?: string;
}

export interface CreateOrderPayload {
  payment_method?: string;
  payment_method_title?: string;
  set_paid?: boolean;
  billing: WooCommerceCustomerAddress;
  shipping: WooCommerceCustomerAddress;
  line_items: WooCommerceLineItem[];
  customer_note?: string;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface WooCommerceOrderResponse {
  id: number;
  status: string;
  currency: string;
  total: string;
  date_created: string;
  meta_data: Array<{ key: string; value: any }>;
  shipping_lines?: Array<any>;
}

export class WooCommerceClient {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(
    baseUrl = process.env.WOOCOMMERCE_URL || "",
    consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || "",
    consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || ""
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
    return `Basic ${credentials}`;
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.consumerKey && this.consumerSecret);
  }

  /**
   * Crea un pedido pagado en WooCommerce para que el plugin de Hertwill lo procese automáticamente
   */
  async createOrder(payload: CreateOrderPayload): Promise<WooCommerceOrderResponse> {
    if (!this.isConfigured()) {
      throw new Error("WooCommerce no está configurado. Revisa WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY y WOOCOMMERCE_CONSUMER_SECRET.");
    }

    const orderBody = {
      payment_method: payload.payment_method || "kinekids_gateway",
      payment_method_title: payload.payment_method_title || "Pago KineKids (Stripe)",
      set_paid: payload.set_paid !== undefined ? payload.set_paid : true,
      billing: payload.billing,
      shipping: payload.shipping,
      line_items: payload.line_items,
      customer_note: payload.customer_note || "Pedido originado desde Frontend KineKids",
      meta_data: [
        { key: "_origin", value: "kinekids-web-frontend" },
        ...(payload.meta_data || [])
      ]
    };

    const response = await fetch(`${this.baseUrl}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.getAuthHeader()
      },
      body: JSON.stringify(orderBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear pedido en WooCommerce (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Consulta el estado de un pedido en WooCommerce (para leer tracking generado por Hertwill)
   */
  async getOrder(orderId: number | string): Promise<WooCommerceOrderResponse> {
    if (!this.isConfigured()) {
      throw new Error("WooCommerce no está configurado.");
    }

    const response = await fetch(`${this.baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": this.getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al consultar pedido ${orderId} en WooCommerce: ${errorText}`);
    }

    return await response.json();
  }
}

export const wooCommerceClient = new WooCommerceClient();
