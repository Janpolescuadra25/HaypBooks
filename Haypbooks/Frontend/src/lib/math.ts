export function bankersRound(value: number, decimals = 2) {
  if (!isFinite(value) || isNaN(value)) return 0
  const sign = value < 0 ? -1 : 1
  const v = Math.abs(value)
  const factor = Math.pow(10, decimals)
  const n = v * factor
  const floor = Math.floor(n)
  const diff = n - floor
  let rounded
  if (diff > 0.5) rounded = floor + 1
  else if (diff < 0.5) rounded = floor
  else {
    // tie -> round to even
    rounded = (floor % 2 === 0) ? floor : floor + 1
  }
  return (rounded / factor) * sign
}

export function toTwo(value: number) {
  // helper to keep 2 decimal floats stable
  return Number((Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2))
}
