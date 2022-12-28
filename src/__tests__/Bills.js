/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import {getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import mockedBills from "../__mocks__/store.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    //Test bouton sélectionné
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    //Test date dans l'ordre antichrono
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    //Test clic sur bouton NewBills affiche bien le formumaire de création d'une bill
    test("Then the NewBills button should display NewBill Form Page",async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillButton = screen.getByTestId('btn-new-bill')
      //ajouter un click sur le button
      userEvent.click(newBillButton)
      expect(window.location.href).toBe('http://localhost/#employee/bill/new')
    })
  })
  //TODO test de handleClickIconEye (ne fonctionne pas)
  //Test d'affichage de la modal
  // test('When I click on the eye-icon, the modal should be displayed', async ()=> {
  //   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //   window.localStorage.setItem('user', JSON.stringify({
  //     type: 'Employee'
  //   }))
  //   const root = document.createElement("div")
  //   root.setAttribute("id", "root")
  //   document.body.append(root)
  //   router()
  //   window.onNavigate(ROUTES_PATH.Bills)
  //   await waitFor(() => document.querySelector('#modaleFile'))
  //   const modal = document.querySelector('#modaleFile')
  //   // await waitFor(() => screen.getByTestId('icon-eye'))
  //   // const iconEye = screen.getByTestId('icon-eye')
  //   await waitFor(() => screen.getAllByTestId('icon-eye'))
  //   const iconEye = screen.getAllByTestId('icon-eye')
  //
  //   userEvent.click(iconEye)
  //   expect(modal.classList.contains('show')).toBe(true)
  // })
  // Test get bills
  test('should render all bills in store',async () => {
    const store = mockedBills
    const containersBills = new Bills ({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    })
    const spyGetList = jest.spyOn(containersBills, 'getBills')
    const data = await containersBills.getBills()
    const lengthData = data.length
    expect(spyGetList).toHaveBeenCalledTimes(1)
    expect(lengthData).toBe(4)
  })
})
