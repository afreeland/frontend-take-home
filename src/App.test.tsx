import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders company name", () => {
  render(<App />);
  const headerLogo = screen.getByText("Gremlin");
  expect(headerLogo).toBeInTheDocument();
});

test("theme change", () => {
  render(<App />);

  fireEvent(
    screen.getByTestId("theme-button"),
    new MouseEvent("click", { bubbles: true, cancelable: true })
  );

  expect(screen.getAllByTestId("app-bar")[0]).toHaveStyle(
    `background-color: #121212`
  );

  fireEvent(
    screen.getByTestId("theme-button"),
    new MouseEvent("click", { bubbles: true, cancelable: true })
  );

  expect(screen.getAllByTestId("app-bar")[0]).toHaveStyle(
    `background-color: #1976d2`
  );
});
