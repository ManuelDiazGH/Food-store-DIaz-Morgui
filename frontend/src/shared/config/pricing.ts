/** Constantes de precios del negocio.
 *
 * El backend tiene el valor canónico en `app/modules/pedidos/service.py::COSTO_ENVIO`.
 * Acá replicamos el valor solo para el preview pre-checkout (cuando todavía no
 * hay un Pedido creado para leer `pedido.costo_envio`). Después de crear el
 * pedido siempre se usa el `costo_envio` que viene en el response.
 */
export const COSTO_ENVIO_PREVIEW = 50

export function formatARS(value: number): string {
  return `$${value.toFixed(2)}`
}
