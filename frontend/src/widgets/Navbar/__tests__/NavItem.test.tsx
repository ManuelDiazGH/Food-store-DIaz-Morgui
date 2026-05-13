/** Tests para NavItem component. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { NavItem } from '../NavItem'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('NavItem', () => {
  it('should render children text', () => {
    renderWithRouter(<NavItem to="/test">Mi Item</NavItem>)
    expect(screen.getByText('Mi Item')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    renderWithRouter(<NavItem to="/test" icon="🔧">Con Icono</NavItem>)
    expect(screen.getByText('🔧')).toBeInTheDocument()
  })

  it('should not render icon when not provided', () => {
    renderWithRouter(<NavItem to="/test">Sin Icono</NavItem>)
    expect(screen.queryByText('🔧')).not.toBeInTheDocument()
  })

  it('should link to the correct route', () => {
    renderWithRouter(<NavItem to="/catalogo">Catálogo</NavItem>)
    const link = screen.getByText('Catálogo').closest('a')
    expect(link).toHaveAttribute('href', '/catalogo')
  })

  it('should render complex children (ReactNode)', () => {
    renderWithRouter(
      <NavItem to="/cart">
        <span>Carrito</span>
        <span className="badge">3</span>
      </NavItem>,
    )
    expect(screen.getByText('Carrito')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
