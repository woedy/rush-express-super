import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerDashboard from "@/pages/CustomerDashboard";
import type { Order, OrderQuote } from "@/lib/types";

const listAddresses = jest.fn();
const listOrders = jest.fn();
const quoteOrder = jest.fn();
const createOrder = jest.fn();
const confirmOrder = jest.fn();
const getTracking = jest.fn();
const getChat = jest.fn();

jest.mock("@/lib/api", () => ({
  apiClient: {
    listAddresses: (...args: unknown[]) => listAddresses(...args),
    listOrders: (...args: unknown[]) => listOrders(...args),
    quoteOrder: (...args: unknown[]) => quoteOrder(...args),
    createOrder: (...args: unknown[]) => createOrder(...args),
    confirmOrder: (...args: unknown[]) => confirmOrder(...args),
    getTracking: (...args: unknown[]) => getTracking(...args),
    getChat: (...args: unknown[]) => getChat(...args),
  },
}));

jest.mock("@/lib/auth", () => ({
  useAuthStore: (selector: (state: { tokens: { access: string }; user: { username: string } }) => unknown) =>
    selector({ tokens: { access: "token" }, user: { username: "customer" } }),
}));

jest.mock("@/lib/ws", () => ({
  connectNotifications: () => ({ close: jest.fn() }),
  connectOrderTracking: () => ({ close: jest.fn() }),
  connectOrderChat: () => ({ close: jest.fn() }),
}));

describe("CustomerDashboard order flow", () => {
  it("creates a quote and submits a new order", async () => {
    listAddresses.mockResolvedValue([]);
    listOrders.mockResolvedValue([]);
    getTracking.mockResolvedValue({ order: {}, events: [] });
    getChat.mockResolvedValue([]);

    const quote: OrderQuote = {
      merchant_branch_id: 1,
      dropoff_address_id: 2,
      items: [{ inventory_item_id: 11, name: "Item", quantity: 1, unit_price: "4.00" }],
      subtotal: "4.00",
      delivery_fee: "5.00",
      total: "9.00",
    };

    const order: Order = {
      id: 99,
      status: "CREATED",
      merchant_branch: 1,
      rider: null,
      pickup_address_line1: "",
      pickup_address_line2: "",
      pickup_city: "",
      pickup_state: "",
      pickup_postal_code: "",
      pickup_country: "US",
      pickup_latitude: null,
      pickup_longitude: null,
      dropoff_address_line1: "",
      dropoff_address_line2: "",
      dropoff_city: "",
      dropoff_state: "",
      dropoff_postal_code: "",
      dropoff_country: "US",
      dropoff_latitude: null,
      dropoff_longitude: null,
      subtotal: "4.00",
      delivery_fee: "5.00",
      total: "9.00",
      created_at: "",
      updated_at: "",
      items: [],
    };

    quoteOrder.mockResolvedValue(quote);
    createOrder.mockResolvedValue(order);
    confirmOrder.mockResolvedValue({ ...order, status: "CONFIRMED" });

    render(<CustomerDashboard />);

    await userEvent.click(screen.getByRole("tab", { name: /new order/i }));
    await userEvent.type(screen.getByLabelText(/merchant branch id/i), "1");
    await userEvent.type(screen.getByLabelText(/dropoff address id/i), "2");
    await userEvent.type(screen.getByLabelText(/inventory item id/i), "11");
    await userEvent.type(screen.getByLabelText(/quantity/i), "1");

    await userEvent.click(screen.getByRole("button", { name: /get quote/i }));

    await waitFor(() => expect(quoteOrder).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

    await waitFor(() => expect(createOrder).toHaveBeenCalled());
    await waitFor(() => expect(confirmOrder).toHaveBeenCalled());
  });
});
