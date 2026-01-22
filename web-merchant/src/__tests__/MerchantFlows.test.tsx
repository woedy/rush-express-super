import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MerchantDashboard from "@/pages/MerchantDashboard";

const listBranches = jest.fn();
const listInventory = jest.fn();
const listOrders = jest.fn();
const getAnalytics = jest.fn();
const createInventory = jest.fn();
const updateOrderStatus = jest.fn();

jest.mock("@/lib/api", () => ({
  apiClient: {
    listBranches: (...args: unknown[]) => listBranches(...args),
    listInventory: (...args: unknown[]) => listInventory(...args),
    listOrders: (...args: unknown[]) => listOrders(...args),
    getAnalytics: (...args: unknown[]) => getAnalytics(...args),
    createInventory: (...args: unknown[]) => createInventory(...args),
    updateOrderStatus: (...args: unknown[]) => updateOrderStatus(...args),
  },
}));

jest.mock("@/lib/auth", () => ({
  useAuthStore: (selector: (state: { user: { username: string; first_name: string } }) => unknown) =>
    selector({ user: { username: "merchant_demo", first_name: "Maya" } }),
}));

const baseOrder = {
  id: 55,
  status: "CREATED",
  merchant_branch: 1,
  rider: null,
  pickup_address_line1: "123 Market St",
  pickup_address_line2: "",
  pickup_city: "Metro",
  pickup_state: "",
  pickup_postal_code: "",
  pickup_country: "US",
  pickup_latitude: null,
  pickup_longitude: null,
  dropoff_address_line1: "789 Sunset Ave",
  dropoff_address_line2: "",
  dropoff_city: "Metro",
  dropoff_state: "",
  dropoff_postal_code: "",
  dropoff_country: "US",
  dropoff_latitude: null,
  dropoff_longitude: null,
  subtotal: "18.00",
  delivery_fee: "4.00",
  total: "22.00",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  items: [],
};

describe("MerchantDashboard", () => {
  beforeEach(() => {
    listBranches.mockResolvedValue([
      {
        id: 1,
        name: "Downtown",
        address_line1: "100 Main",
        address_line2: "",
        city: "Metro",
        state: "",
        postal_code: "",
        country: "US",
        latitude: null,
        longitude: null,
      },
    ]);
    listInventory.mockResolvedValue([]);
    listOrders.mockResolvedValue([]);
    getAnalytics.mockResolvedValue({
      order_count: 0,
      revenue: "0.00",
      avg_delivery_time_minutes: null,
    });
  });

  it("creates an inventory item", async () => {
    createInventory.mockResolvedValue({
      id: 12,
      branch: 1,
      name: "Latte",
      description: "12oz",
      price: "4.50",
      stock: 10,
      is_active: true,
    });

    render(
      <MemoryRouter>
        <MerchantDashboard />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("tab", { name: /inventory/i }));
    await userEvent.click(await screen.findByRole("combobox", { name: /branch/i }));
    await userEvent.click(await screen.findByText("Downtown"));

    await userEvent.type(screen.getByLabelText(/item name/i), "Latte");
    await userEvent.type(screen.getByLabelText(/description/i), "12oz");
    await userEvent.type(screen.getByLabelText(/price/i), "4.50");
    await userEvent.type(screen.getByLabelText(/stock/i), "10");

    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(createInventory).toHaveBeenCalledWith({
      branch: 1,
      name: "Latte",
      description: "12oz",
      price: "4.50",
      stock: 10,
      is_active: true,
    });
  });

  it("confirms an order", async () => {
    listOrders.mockResolvedValue([baseOrder]);
    updateOrderStatus.mockResolvedValue({ ...baseOrder, status: "CONFIRMED" });

    render(
      <MemoryRouter>
        <MerchantDashboard />
      </MemoryRouter>
    );

    await screen.findByText("#55");
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(updateOrderStatus).toHaveBeenCalledWith(55, "CONFIRMED");
  });
});
