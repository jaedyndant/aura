// Shape generators for particle morphing targets
// Each returns a Float32Array of [x, y, z] positions for `count` particles

export function generateSphere(count, radius = 4) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Fibonacci sphere for even distribution
    const phi = Math.acos(1 - 2 * (i + 0.5) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const r = radius * (0.85 + Math.random() * 0.15)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  return positions
}

export function generateExplosion(count, radius = 12) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const r = radius * (0.3 + Math.random() * 0.7)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  return positions
}

export function generateText(count, text = 'AURA') {
  const positions = new Float32Array(count * 3)
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 100px Syne, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 64)
  
  const imageData = ctx.getImageData(0, 0, 512, 128)
  const pixels = imageData.data
  
  // Collect all filled pixels
  const filledPixels = []
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 512; x++) {
      const alpha = pixels[(y * 512 + x) * 4 + 3]
      if (alpha > 128) {
        filledPixels.push({ x, y })
      }
    }
  }
  
  // Map particles to text pixels
  const scale = 0.03
  for (let i = 0; i < count; i++) {
    if (filledPixels.length > 0) {
      const pixel = filledPixels[i % filledPixels.length]
      // Add small jitter for volume
      positions[i * 3] = (pixel.x - 256) * scale + (Math.random() - 0.5) * 0.08
      positions[i * 3 + 1] = -(pixel.y - 64) * scale + (Math.random() - 0.5) * 0.08
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    } else {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
  }
  return positions
}

export function generateGrid(count) {
  const positions = new Float32Array(count * 3)
  const cols = Math.ceil(Math.sqrt(count * 2))
  const rows = Math.ceil(count / cols)
  const spacing = 0.15
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    positions[i * 3] = (col - cols / 2) * spacing
    positions[i * 3 + 1] = (row - rows / 2) * spacing
    positions[i * 3 + 2] = Math.sin(col * 0.3) * Math.cos(row * 0.3) * 0.5
  }
  return positions
}

export function generateHelix(count, radius = 3, height = 8) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    const angle = t * Math.PI * 8
    const r = radius * (0.5 + Math.sin(t * Math.PI) * 0.5)
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = (t - 0.5) * height
    positions[i * 3 + 2] = Math.sin(angle) * r
  }
  return positions
}

export function generateScatter(count, range = 15) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * range
    positions[i * 3 + 1] = (Math.random() - 0.5) * range
    positions[i * 3 + 2] = (Math.random() - 0.5) * range
  }
  return positions
}
