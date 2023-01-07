/* eslint-disable jest/no-mocks-import */
/**
 * @jest-environment jsdom
 */
const $ = require("jquery");
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { getByTestId, screen, waitFor, within } from "@testing-library/dom";
import { expect, jest, test } from "@jest/globals";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import mockedBills from "../__mocks__/store.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockedStore);

//Résolution problème modal BootStrap
$.fn.modal = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    //Test bouton sélectionné
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    //* Test date dans l'ordre antichrono
    test("dates should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    //* TEST BOUTON NEWBILL
    //Test clic sur bouton NewBills affiche bien le formumaire de création d'une bill
    test("Then the NewBills button should display NewBill Form Page", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("btn-new-bill"));
      const newBillButton = screen.getByTestId("btn-new-bill");
      //ajouter un click sur le button
      userEvent.click(newBillButton);
      expect(window.location.href).toBe("http://localhost/#employee/bill/new");
    });
    //* Test d'affichage de la modale
    test("When I click on the eye-icon, the modal should be displayed", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      userEvent.click(iconEye);
      const store = mockedBills;
      const containersBills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      //Appelle de la fonction
      const spyOpenModal = jest.spyOn(containersBills, "handleClickIconEye");
      await spyOpenModal(iconEye);
      expect(spyOpenModal).toHaveBeenCalledTimes(1);
      // const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      $.fn.modal = jest.fn();
      containersBills.handleClickIconEye(iconEye);
      expect(document.querySelector(".modal")).toBeTruthy();
    });
  });
});

//Test d'intégration GET Bill
describe("When I am on Bills Page", () => {
  test("then GET Bill from API", async () => {
    jest.spyOn(mockedStore, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);
    await waitFor(() => screen.getByText("Mes notes de frais"));
    const newBillBtn = await screen.findByRole("button", {
      name: /nouvelle note de frais/i,
    });
    const billsTableRows = screen.getByTestId("tbody");
    expect(newBillBtn).toBeTruthy();
    expect(billsTableRows).toBeTruthy();
    expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
  });

  test("Then the API failed and throw a 404 error", async () => {
    mockedStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("Then the API failed and throw a 500 error", async () => {
    mockedStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
