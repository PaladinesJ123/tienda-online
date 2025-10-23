export function buildTrackingUrl(carrier, trackingNumber) {
  const c = (carrier || "").toLowerCase();
  const tn = encodeURIComponent(trackingNumber);
  if (c.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${tn}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${tn}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${tn}`;
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`;
  if (c.includes("correos")) return `https://www.correos.es/es/es/herramientas/localizador/envios/datos?tracking-number=${tn}`;
  if (c.includes("servientrega")) return `https://www.servientrega.com/wps/portal/col/empresas/detalle-envio?guia=${tn}`;
  // fallback: sin URL conocida
  return null;
}
