// Client-safe equipment utilities — no server-only imports

export function equipmentQrUrl(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.2eztek.com'
  return `${base}/equipment/${id}`
}

export function qrImageUrl(equipmentId: string, size = 300) {
  const target = equipmentQrUrl(equipmentId)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(target)}&margin=20&color=050B14`
}
