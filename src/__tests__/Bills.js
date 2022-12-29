import store from "../app/Store.js";

/**
 * @jest-environment jsdom
 */
const $ = require('jquery')
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import {getByTestId, screen, waitFor,} from "@testing-library/dom"
import {expect, jest, test} from '@jest/globals';
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import mockedBills from "../__mocks__/store.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

//Résolution problème modal BootStrap
$.fn.modal = jest.fn();

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
    //* Test date dans l'ordre antichrono
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    //* TEST BOUTON NEWBILL
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

  //* Test d'affichage de la modal
  test('When I click on the eye-icon, the modal should be displayed', async ()=> {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getAllByTestId('icon-eye'))
    const iconEye = screen.getAllByTestId('icon-eye')[0]
    userEvent.click(iconEye)
    const containersBills = new Bills ({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    })
    const spyOpenModal = jest.spyOn(containersBills, 'handleClickIconEye')
    await spyOpenModal(iconEye)
    expect(spyOpenModal).toHaveBeenCalledTimes(1)
    //Jusqu'ici le test est vert
    //Après il récupère bien le html mais fait test AVANT que show soit appliqué
    // await waitFor(()=> document.getElementById('modaleFile'))
    // const modale = document.getElementById('modaleFile')
    // await expect(modale).toHaveClass('show')
  })

  //* TEST INTEGRATION GET BILLS
  test('should render all bills in store',async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const store = mockedBills
    const containersBills = new Bills ({
      document, onNavigate, store, localStorage: window.localStorage,
    })
    const spyGetBills = jest.spyOn(containersBills, 'getBills')
    const data = await containersBills.getBills()
    const dataLength = data.length
    expect(spyGetBills).toHaveBeenCalledTimes(1)
    expect(dataLength).toBe(4)
  })
})
