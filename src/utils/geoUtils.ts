/**
 * Calcula la hora local aproximada a partir de la longitud geográfica.
 * 
 * @param lon - Longitud en grados (-180 a 180)
 * @returns Hora local formateada en formato 12h AM/PM (ej: "2:45 PM")
 */
export const getLocalTimeFromLongitude = (lon: number): string => {
  // Calcular offset UTC aproximado (cada 15 grados = 1 hora)
  const offsetHours = Math.round(lon / 15);
  
  // Obtener hora UTC actual
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  
  // Aplicar offset
  let localHours = utcHours + offsetHours;
  const localMinutes = utcMinutes;
  
  // Normalizar horas (0-23)
  if (localHours < 0) {
    localHours += 24;
  } else if (localHours >= 24) {
    localHours -= 24;
  }
  
  // Formatear en 12h AM/PM
  const period = localHours >= 12 ? 'PM' : 'AM';
  const displayHours = localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;
  const displayMinutes = localMinutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${period}`;
};

