import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'

export function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => Math.round(v).toString())
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      mv.set(value)
      return
    }
    const c = animate(mv, value, { duration: 0.35, ease: 'easeOut' })
    return () => c.stop()
  }, [value, mv])
  return <motion.span>{text}</motion.span>
}
