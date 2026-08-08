import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Marketplace from "../pages/Marketplace";
import Services from "../pages/Services";

// Mock Firebase service module
jest.mock("../services/firebase", () => ({
  getDocuments: jest.fn(() => Promise.resolve([]))
}));

describe("TM3 - Marketplace & Services Task Verification", () => {
  test("renders Marketplace title and action button", async () => {
    render(
      <BrowserRouter>
        <Marketplace />
      </BrowserRouter>
    );
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("+ Sell an Item")).toBeInTheDocument();
  });

  test("renders Services title and post service button", async () => {
    render(
      <BrowserRouter>
        <Services />
      </BrowserRouter>
    );
    expect(screen.getByText("Student Services")).toBeInTheDocument();
    expect(screen.getByText("+ Post Service")).toBeInTheDocument();
  });
});