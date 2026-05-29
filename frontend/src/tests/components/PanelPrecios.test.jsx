import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PanelPrecios from '../../components/panels/PanelPrecios'

describe('PanelPrecios', () => {
  it('renderiza el componente sin errores', () => {
    render(<PanelPrecios />)
    expect(screen.getByText(/precio de bolsa nacional/i)).toBeInTheDocument()
  })

  it('muestra el date picker al renderizar', () => {
    render(<PanelPrecios />)
    const dateInput = document.querySelector('input[type="date"]')
    expect(dateInput).toBeInTheDocument()
  })

  it('muestra el botón consultar', () => {
    render(<PanelPrecios />)
    expect(screen.getByRole('button', { name: /consultar/i })).toBeInTheDocument()
  })

  it('muestra mensaje indicando que debe consultar', () => {
    render(<PanelPrecios />)
    expect(screen.getByText(/selecciona una fecha/i)).toBeInTheDocument()
  })
})
