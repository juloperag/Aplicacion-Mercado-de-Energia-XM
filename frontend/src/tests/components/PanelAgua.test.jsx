import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelAgua from '../../components/panels/PanelAgua'

describe('PanelAgua', () => {
  it('renderiza el componente sin errores', () => {
    render(<PanelAgua />)
    expect(screen.getByText(/nivel de embalses/i)).toBeInTheDocument()
  })

  it('muestra selectores de rango de fechas', () => {
    render(<PanelAgua />)
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('el botón consultar está deshabilitado sin selección de embalses', () => {
    render(<PanelAgua />)
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled()
  })

  it('tiene campo de búsqueda para embalses', () => {
    render(<PanelAgua />)
    const searchInput = screen.getByPlaceholderText(/busca un embalse/i)
    expect(searchInput).toBeInTheDocument()
  })
})
