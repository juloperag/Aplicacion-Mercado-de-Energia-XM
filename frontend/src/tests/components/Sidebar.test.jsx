import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../../components/Sidebar'

describe('Sidebar', () => {
  it('muestra los 4 botones de navegación', () => {
    const mockSetActivePanel = vi.fn()
    render(<Sidebar activePanel="precios" setActivePanel={mockSetActivePanel} />)
    
    expect(screen.getByText(/precios/i)).toBeInTheDocument()
    expect(screen.getByText(/producción/i)).toBeInTheDocument()
    expect(screen.getByText(/consumo/i)).toBeInTheDocument()
    expect(screen.getByText(/agua/i)).toBeInTheDocument()
  })

  it('marca el panel activo con estilo diferenciado', () => {
    const mockSetActivePanel = vi.fn()
    render(<Sidebar activePanel="precios" setActivePanel={mockSetActivePanel} />)
    
    const botonActivo = screen.getByText(/precios/i).closest('button')
    expect(botonActivo).toHaveClass('bg-white')
  })

  it('llama a setActivePanel con el panel correcto al hacer click', async () => {
    const mockSetActivePanel = vi.fn()
    const user = userEvent.setup()
    render(<Sidebar activePanel="precios" setActivePanel={mockSetActivePanel} />)
    
    await user.click(screen.getByText(/producción/i))
    expect(mockSetActivePanel).toHaveBeenCalledWith('produccion')
  })
})
