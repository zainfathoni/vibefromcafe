import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Join from "./join";

describe("join route", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the WhatsApp group invitation link after successful submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          submission: { id: "submission-1", invitationStatus: "invited" },
          whatsappInvite: {
            groupInviteUrl: "https://chat.whatsapp.com/vfc-group",
            messageTemplate: "Hi {{name}}, join {{group_link}}",
          },
        }),
      }),
    );

    render(<Join />);

    await userEvent.type(screen.getByLabelText(/name/i), "Immediate Invite");
    await userEvent.type(screen.getByLabelText(/city/i), "Jogja");
    await userEvent.type(screen.getByLabelText(/what do you do/i), "Developer");
    await userEvent.type(screen.getByLabelText(/whatsapp number/i), "0812-3456-789");
    await userEvent.selectOptions(screen.getByLabelText(/how did you hear about us/i), "instagram");
    await userEvent.click(screen.getByRole("button", { name: /express interest/i }));

    const inviteLink = await screen.findByRole("link", { name: /join whatsapp group/i });
    expect(inviteLink).toHaveAttribute("href", "https://chat.whatsapp.com/vfc-group");
    expect(screen.getByText(/you're invited/i)).toBeInTheDocument();
    expect(screen.queryByText(/queue/i)).not.toBeInTheDocument();
  });

  it("shows a fallback when the invite URL is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          submission: { id: "submission-1", invitationStatus: "invited" },
          whatsappInvite: {
            groupInviteUrl: "",
            messageTemplate: "Hi {{name}}, join {{group_link}}",
          },
        }),
      }),
    );

    render(<Join />);

    await userEvent.type(screen.getByLabelText(/name/i), "Missing Link");
    await userEvent.type(screen.getByLabelText(/city/i), "Jogja");
    await userEvent.type(screen.getByLabelText(/what do you do/i), "Developer");
    await userEvent.type(screen.getByLabelText(/whatsapp number/i), "0812-3456-789");
    await userEvent.selectOptions(screen.getByLabelText(/how did you hear about us/i), "instagram");
    await userEvent.click(screen.getByRole("button", { name: /express interest/i }));

    expect(await screen.findByText(/we received your details/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /join whatsapp group/i })).not.toBeInTheDocument();
  });
});
