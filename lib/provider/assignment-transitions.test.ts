import { describe, expect, it } from "vitest";
import {
  canProviderAcceptAssignment,
  canProviderDeclineAssignment,
} from "@/lib/provider/assignment-transitions";

describe("provider assignment transitions", () => {
  it("HPP-UT-020: invited → accepted allowed", () => {
    expect(canProviderAcceptAssignment("invited")).toBe(true);
  });

  it("HPP-UT-021: invited → declined allowed", () => {
    expect(canProviderDeclineAssignment("invited")).toBe(true);
  });

  it("HPP-UT-022: confirmed → accepted denied", () => {
    expect(canProviderAcceptAssignment("confirmed")).toBe(false);
  });

  it("HPP-UT-023: declined → accepted denied", () => {
    expect(canProviderAcceptAssignment("declined")).toBe(false);
  });
});
