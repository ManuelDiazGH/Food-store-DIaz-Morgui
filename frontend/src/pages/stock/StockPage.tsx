import { Navigate } from 'react-router-dom'
import { ROUTES } from '@shared/config/routes'

export default function StockPage() {
  return <Navigate to={ROUTES.PRODUCTS} replace />
}