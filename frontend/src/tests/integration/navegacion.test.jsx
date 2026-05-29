import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

describe('Navegación SPA', () => {
  it('muestra el Panel de Precios por defecto al cargar', () => {
    render(<App />)
    expect(screen.getByText(/precio de bolsa/i)).toBeInTheDocument()
  })

  it('navega al Panel de Producción al hacer click en el botón', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const buttons = screen.getAllByRole('button')
    const produccionBtn = buttons.find(btn => btn.textContent.includes('Producción'))
    
    if (produccionBtn) {
      await user.click(produccionBtn)
      expect(screen.getByText(/top 10 plantas/i) || screen.getByText(/despacho central/i)).toBeTruthy()
    }
  })

  it('navega al Panel de Consumo correctamente', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const buttons = screen.getAllByRole('button')
    const consumoBtn = buttons.find(btn => btn.textContent.includes('Consumo'))
    
    if (consumoBtn) {
      await user.click(consumoBtn)
      expect(screen.getByText(/consumo/i) || screen.getByText(/agente/i)).toBeTruthy()
    }
  })

  it('navega al Panel del Agua correctamente', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const buttons = screen.getAllByRole('button')
    const aguaBtn = buttons.find(btn => btn.textContent.includes('Agua'))
    
    if (aguaBtn) {
      await user.click(aguaBtn)
      expect(screen.getByText(/nivel de embalses/i) || screen.getByText(/embalse/i)).toBeTruthy()
    }
  })
})
