'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Slide up transition for modals and drawers
const slideUpVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: 50,
  },
}

interface SlideUpTransitionProps {
  children: ReactNode
  show: boolean
}

export function SlideUpTransition({ children, show }: SlideUpTransitionProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={slideUpVariants}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Fade scale transition for popups
const fadeScaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 0.9,
  },
}

interface FadeScaleTransitionProps {
  children: ReactNode
  show: boolean
}

export function FadeScaleTransition({ children, show }: FadeScaleTransitionProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={fadeScaleVariants}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Stagger children animation
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Drawer transition (slide from right)
interface DrawerTransitionProps {
  children: ReactNode
  show: boolean
  onClose: () => void
}

export function DrawerTransition({ children, show, onClose }: DrawerTransitionProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white shadow-brutal-lg"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Bottom sheet transition
interface BottomSheetProps {
  children: ReactNode
  show: boolean
  onClose: () => void
}

export function BottomSheet({ children, show, onClose }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-brutal shadow-brutal-lg"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-gray-300 brutal-radius-full" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
