/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockedBills from "../__mocks__/store.js"
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then am I on the good page ?", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      waitFor(() => document.querySelector('.content-title'))
      const title = document.querySelector('.content-title').innerHTML
      expect(title).toBe(" Envoyer une note de frais ")
    })
    test("Then I submit a NewBill", async () => {
      localStorage.setItem("user", JSON.stringify({type: "Employee", email: "a@a"}));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      const store = mockedBills;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage
      });
      const inputExpenseName = screen.getByTestId("expense-name");
      const inputDatePicker = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputPct = screen.getByTestId("pct");
      const inputCommentary = screen.getByTestId("commentary");
      const inputProofFile = screen.getByTestId("file");
      fireEvent.change(inputExpenseName, {target: {value: "Transports"}});
      fireEvent.change(inputDatePicker, {target: {value: "2020-01-05"}});
      fireEvent.change(inputAmount, {target: {value: 1000}});
      fireEvent.change(inputPct, {target: {value: 20}});
      fireEvent.change(inputCommentary, {target: {value: "c'était long !!"}});
      fireEvent.change(inputProofFile, {
        target: {
          files: [new File(['test.png'], "test.png", {type: "png"})],
        },
      });
      //Fonction déclenchée au submit du Newbill
      jest.fn(newBill.handleSubmit);
      const submitButton = document.querySelector("#btn-send-bill");
      userEvent.click(submitButton);
    })
  })
})

// Test d'intégration NewBill


