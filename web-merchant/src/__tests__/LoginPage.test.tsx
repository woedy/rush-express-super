import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";

const loginMock = jest.fn();

jest.mock("@/lib/auth", () => ({
  useAuthStore: (selector: (state: { login: typeof loginMock }) => typeof loginMock) =>
    selector({ login: loginMock }),
}));

describe("LoginPage", () => {
  it("submits login credentials", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/username/i), "merchant1");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith("merchant1", "secret");
  });
});
