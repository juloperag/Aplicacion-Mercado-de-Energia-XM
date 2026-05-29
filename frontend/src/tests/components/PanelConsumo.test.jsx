import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelConsumo from '../../components/panels/PanelConsumo'

describe('PanelConsumo', () => {
  it('renderiza el componente sin errores', () => {
    render(<PanelConsumo />)
    expect(screen.getByText(/consumo por agente/i)).toBeInTheDocument()
  })

  it('tiene campo de búsqueda para agentes', () => {
    render(<PanelConsumo />)
    const searchInput = screen.getByPlaceholderText(/busca un agente/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('muestra el selector de mes de consulta', () => {
    render(<PanelConsumo />)
    const monthInput = document.querySelector('input[type="month"]')
    expect(monthInput).toBeInTheDocument()
  })

  it('el botón consultar está deshabilitado sin selección', () => {
    render(<PanelConsumo />)
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled()
  })
})
