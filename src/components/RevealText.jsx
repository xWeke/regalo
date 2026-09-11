import { useRef } from 'react'
import { useSplitReveal } from '../hooks/useSplitReveal'

export default function RevealText({
  as: Tag = 'p',
  active = false,
  stagger,
  delay,
  children,
  className = '',
  ...rest
}) {
  const ref = useRef(null)
  useSplitReveal(ref, { active, stagger, delay })

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
