export const easeInQuint = (t: number) => t * t * t * t * t

export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
