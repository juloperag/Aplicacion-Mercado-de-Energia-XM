import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelProduccion from '../../components/panels/PanelProduccion'

describe('PanelProduccion', () => {
  it('renderiza el componente sin errores', () => {
    render(<PanelProduccion />)
    expect(screen.getByText(/top 10 plantas despacho central/i)).toBeInTheDocument()
  })

  it('muestra selectores de rango de fechas', () => {
    render(<PanelProduccion />)
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('el botón consultar existe', () => {
    render(<PanelProduccion />)
    expect(screen.getByRole('button', { name: /consultar/i })).toBeInTheDocument()
  })
})
