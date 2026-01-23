import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";

const listUsers = jest.fn();
const updateUserStatus = jest.fn();
const updateRiderKyc = jest.fn();
const listOrders = jest.fn();
const reassignOrder = jest.fn();
const getDeliveryFee = jest.fn();
const updateDeliveryFee = jest.fn();

jest.mock("@/lib/api", () => ({
  apiClient: {
    listUsers: (...args: unknown[]) => listUsers(...args),
    updateUserStatus: (...args: unknown[]) => updateUserStatus(...args),
    updateRiderKyc: (...args: unknown[]) => updateRiderKyc(...args),
    listOrders: (...args: unknown[]) => listOrders(...args),
    reassignOrder: (...args: unknown[]) => reassignOrder(...args),
    getDeliveryFee: (...args: unknown[]) => getDeliveryFee(...args),
    updateDeliveryFee: (...args: unknown[]) => updateDeliveryFee(...args),
  },
}));

jest.mock("@/lib/auth", () => ({
  useAuthStore: (selector: (state: { user: { username: string; first_name: string } }) => unknown) =>
    selector({ user: { username: "admin_demo", first_name: "Alex" } }),
}));

const baseOrder = {
  id: 88,
  status: "ASSIGNED",
  merchant_branch: 1,
  rider: 2,
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

describe("AdminDashboard", () => {
  beforeEach(() => {
    listUsers.mockImplementation((role?: string) => {
      if (role === "RIDER") {
        return Promise.resolve([
          {
            id: 2,
            username: "rider_two",
            email: "rider@rush.test",
            first_name: "Riley",
            last_name: "",
            role: "RIDER",
            is_suspended: false,
          },
        ]);
      }
      return Promise.resolve([
        {
          id: 1,
          username: "demo_user",
          email: "user@rush.test",
          first_name: "Dana",
          last_name: "",
          role: "CUSTOMER",
          is_suspended: false,
        },
        {
          id: 3,
          username: "rider_three",
          email: "rider3@rush.test",
          first_name: "Jordan",
          last_name: "",
          role: "RIDER",
          is_suspended: false,
          rider_profile_id: 7,
          rider_kyc_status: "PENDING",
        },
      ]);
    });
    listOrders.mockResolvedValue([]);
    getDeliveryFee.mockResolvedValue({ delivery_fee: "3.50" });
  });

  it("suspends a user", async () => {
    updateUserStatus.mockResolvedValue({
      id: 1,
      username: "demo_user",
      email: "user@rush.test",
      first_name: "Dana",
      last_name: "",
      role: "CUSTOMER",
      is_suspended: true,
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const suspendButton = await screen.findByRole("button", { name: /suspend/i });
    await userEvent.click(suspendButton);

    expect(updateUserStatus).toHaveBeenCalledWith(1, true);
  });

  it("reassigns an order", async () => {
    listOrders.mockResolvedValue([baseOrder]);
    reassignOrder.mockResolvedValue({ ...baseOrder, rider: 2 });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("tab", { name: /orders/i }));
    await screen.findByText("#88");

    await userEvent.click(await screen.findByRole("combobox", { name: /reassign rider/i }));
    await userEvent.click(await screen.findByText(/riley/i));

    await userEvent.click(screen.getByRole("button", { name: /reassign/i }));
    expect(reassignOrder).toHaveBeenCalledWith(88, 2);
  });

  it("updates rider kyc status", async () => {
    updateRiderKyc.mockResolvedValue({ id: 7, kyc_status: "VERIFIED" });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole("combobox", { name: /kyc status/i }));
    await userEvent.click(await screen.findByText(/verified/i));
    await userEvent.click(screen.getByRole("button", { name: /update kyc/i }));

    expect(updateRiderKyc).toHaveBeenCalledWith(7, "VERIFIED");
  });
});
