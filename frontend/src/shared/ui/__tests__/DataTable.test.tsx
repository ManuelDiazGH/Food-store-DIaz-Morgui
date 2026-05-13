/** Tests para DataTable component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type Column } from '../DataTable'

interface TestItem {
  id: number
  name: string
  price: number
}

const columns: Column<TestItem>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'price', label: 'Precio', render: (row) => `$${row.price}` },
]

const data: TestItem[] = [
  { id: 1, name: 'Producto A', price: 100 },
  { id: 2, name: 'Producto B', price: 200 },
]

describe('DataTable', () => {
  it('should render column headers', () => {
    render(<DataTable columns={columns} data={data} page={1} limit={10} total={20} onPageChange={vi.fn()} />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Precio')).toBeInTheDocument()
  })

  it('should render data rows', () => {
    render(<DataTable columns={columns} data={data} page={1} limit={10} total={20} onPageChange={vi.fn()} />)
    expect(screen.getByText('Producto A')).toBeInTheDocument()
    expect(screen.getByText('Producto B')).toBeInTheDocument()
  })

  it('should render custom cell via render prop', () => {
    render(<DataTable columns={columns} data={[{ id: 1, name: 'Test', price: 500 }]} page={1} limit={10} total={20} onPageChange={vi.fn()} />)
    expect(screen.getByText('$500')).toBeInTheDocument()
  })

  it('should show pagination when totalPages > 1', () => {
    render(<DataTable columns={columns} data={data} page={1} limit={2} total={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Siguiente')).toBeInTheDocument()
    expect(screen.getByText(/Página 1 de 5/)).toBeInTheDocument()
  })

  it('should hide pagination when totalPages <= 1', () => {
    render(<DataTable columns={columns} data={data} page={1} limit={10} total={2} onPageChange={vi.fn()} />)
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument()
    expect(screen.queryByText('Siguiente')).not.toBeInTheDocument()
  })

  it('should disable "Anterior" on first page', () => {
    render(<DataTable columns={columns} data={data} page={1} limit={2} total={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Anterior')).toBeDisabled()
    expect(screen.getByText('Siguiente')).not.toBeDisabled()
  })

  it('should disable "Siguiente" on last page', () => {
    render(<DataTable columns={columns} data={data} page={5} limit={2} total={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Anterior')).not.toBeDisabled()
    expect(screen.getByText('Siguiente')).toBeDisabled()
  })

  it('should call onPageChange with next page when "Siguiente" is clicked', () => {
    const handlePageChange = vi.fn()
    render(<DataTable columns={columns} data={data} page={1} limit={2} total={10} onPageChange={handlePageChange} />)
    fireEvent.click(screen.getByText('Siguiente'))
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange with previous page when "Anterior" is clicked', () => {
    const handlePageChange = vi.fn()
    render(<DataTable columns={columns} data={data} page={3} limit={2} total={10} onPageChange={handlePageChange} />)
    fireEvent.click(screen.getByText('Anterior'))
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('should show empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} page={1} limit={10} total={0} onPageChange={vi.fn()} emptyMessage="Sin resultados" />)
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('should show default empty message', () => {
    render(<DataTable columns={columns} data={[]} page={1} limit={10} total={0} onPageChange={vi.fn()} />)
    expect(screen.getByText('No hay datos para mostrar')).toBeInTheDocument()
  })

  it('should show "Mostrando X a Y de Z resultados"', () => {
    render(<DataTable columns={columns} data={data} page={2} limit={10} total={25} onPageChange={vi.fn()} />)
    expect(screen.getByText(/Mostrando 11 a 20 de 25 resultados/)).toBeInTheDocument()
  })
})
