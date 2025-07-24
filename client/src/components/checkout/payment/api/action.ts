// `components/checkout/payment/api/action.ts`

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Función para generar un número de orden de compra único
export function generarNumeroOrden() {
  // Puedes ajustar el rango según tus necesidades
  const min = 1000;
  const max = 9999;

  // Genera un número aleatorio único
  const numeroOrden = getRandomInt(min, max);

  const timestamp = Date.now().toString();
  // Devuelve el número de orden único
  return numeroOrden + timestamp;
}
