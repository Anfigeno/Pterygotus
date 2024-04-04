export default function env(clave:string): string {
  const variableDeEntorno = process.env[clave];

  if (!variableDeEntorno) {
    throw new Error(`La variable de entorno ${clave} no existe`);
  }

  return variableDeEntorno;
}
