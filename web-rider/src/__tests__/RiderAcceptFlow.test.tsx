import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RiderDashboard from "@/pages/RiderDashboard";

const getAvailability = jest.fn();
const listAvailableOrders = jest.fn();
const acceptOrder = jest.fn();
const updateOrderStatus = jest.fn();
const updateLocation = jest.fn();
const listEarnings = jest.fn();

jest.mock("@/lib/api", () => ({
  apiClient: {
    getAvailability: (...args: unknown[]) => getAvailability(...args),
    listAvailableOrders: (...args: unknown[]) => listAvailableOrders(...args),
    acceptOrder: (...args: unknown[]) => acceptOrder(...args),
    updateOrderStatus: (...args: unknown[]) => updateOrderStatus(...args),
    updateLocation: (...args: unknown[]) => updateLocation(...args),
    listEarnings: (...args: unknown[]) => listEarnings(...args),
  },
}));

jest.mock("@/lib/auth", () => ({
  useAuthStore: (selector: (state: { user: { username: string; first_name: string } }) => unknown) =>
    selector({ user: { username: "demo_rider", first_name: "Riley" } }),
}));

describe("RiderDashboard", () => {
  it("accepts an available order", async () => {
    const order = {
      id: 101,
      status: "CONFIRMED",
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

    getAvailability.mockResolvedValue({ is_online: true, schedule: null, updated_at: "2024-01-01T00:00:00Z" });
    listAvailableOrders.mockResolvedValue([order]);
    listEarnings.mockResolvedValue([]);
    acceptOrder.mockResolvedValue({ ...order, status: "ASSIGNED" });
    updateOrderStatus.mockResolvedValue({ ...order, status: "PICKED_UP" });
    updateLocation.mockResolvedValue({ latitude: "0", longitude: "0", updated_at: "2024-01-01T00:00:00Z" });

    render(
      <MemoryRouter>
        <RiderDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("#101")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /accept order/i }));

    expect(acceptOrder).toHaveBeenCalledWith(101);

    await userEvent.click(screen.getByRole("tab", { name: /active/i }));
    expect(await screen.findByText(/123 Market St/i)).toBeInTheDocument();
  });
});
