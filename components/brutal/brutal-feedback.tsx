'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Info, X, Check } from 'lucide-react'
import { Portal } from '@/components/ui/portal'

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

const toastStyles = {
  success: 'bg-green border-green',
  error: 'bg-red border-red',
  info: 'bg-blue border-blue',
  warning: 'bg-yellow border-yellow',
}

const toastIconColors = {
  success: 'text-green',
  error: 'text-red',
  info: 'text-blue',
  warning: 'text-orange',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration || 4000)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[10000] flex flex-col gap-2 sm:left-auto sm:max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 400, damping: 30 }
              }
              className={cn(
                'brutal-border brutal-radius flex w-full items-start gap-3 p-4 shadow-brutal-lg sm:min-w-[300px]',
                toastStyles[toast.type]
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', toastIconColors[toast.type])} />
              <div className="flex-1">
                <p className="font-bold text-sm">{toast.title}</p>
                {toast.message && <p className="text-xs mt-1 opacity-80">{toast.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-brutal transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                aria-label={`Tutup notifikasi ${toast.title}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// MODAL COMPONENT
// ============================================

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  ariaLabel?: string
  descriptionId?: string
  dismissible?: boolean
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  ariaLabel,
  descriptionId,
  dismissible = true,
}: ModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current
      const preferredTarget = dialog?.querySelector<HTMLElement>('[data-autofocus="true"]')
      const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      const focusTarget = preferredTarget ?? firstFocusable ?? dialog
      focusTarget?.focus()
    })

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      const dialog = dialogRef.current
      if (!dialog) return

      if (event.key === 'Escape' && dismissible) {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleDocumentKeyDown)
      document.body.style.overflow = previousOverflow
      previousActiveElementRef.current?.focus()
    }
  }, [dismissible, isOpen])

  const handleBackdropClick = () => {
    if (dismissible) onClose()
  }

  const stopDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-label={title ? undefined : ariaLabel}
              aria-describedby={descriptionId}
              tabIndex={-1}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 380, damping: 30 }
              }
              onClick={stopDialogClick}
              className={cn('w-full outline-none', modalSizes[size])}
            >
              <div className="overflow-hidden rounded-brutal-lg border-4 border-black bg-white shadow-brutal-xl">
                {(title || showClose) && (
                  <div className="flex items-center justify-between border-b-3 border-black px-5 py-4 sm:px-6">
                    {title && (
                      <h2 id={titleId} className="font-display text-lg font-bold">
                        {title}
                      </h2>
                    )}
                    {showClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-brutal border-3 border-black bg-white transition-colors hover:bg-red focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        aria-label="Close dialog"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                <div className="p-5 sm:p-6">{children}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}

type ConfirmVariant = 'danger' | 'warning' | 'info'

const confirmVariantStyles: Record<
  ConfirmVariant,
  { header: string; icon: string; confirm: string; label: string }
> = {
  danger: {
    header: 'bg-red',
    icon: 'bg-white text-red',
    confirm: 'bg-red text-white',
    label: 'High impact action',
  },
  warning: {
    header: 'bg-yellow',
    icon: 'bg-white text-black',
    confirm: 'bg-black text-white',
    label: 'Confirm change',
  },
  info: {
    header: 'bg-blue',
    icon: 'bg-white text-black',
    confirm: 'bg-black text-white',
    label: 'Confirm action',
  },
}

function ConfirmActionButton({
  children,
  onClick,
  className,
  disabled,
  autoFocus,
}: {
  children: ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-autofocus={autoFocus ? 'true' : undefined}
      className={cn(
        'flex min-h-11 items-center justify-center rounded-brutal border-3 border-black px-5 py-2.5 text-sm font-bold shadow-brutal-sm transition-all',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm',
        className
      )}
    >
      {children}
    </button>
  )
}

// ============================================
// CONFIRM MODAL
// ============================================

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
  onCancel?: () => void
  details?: string[]
  eyebrow?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onCancel,
  details = [],
  eyebrow,
}: ConfirmModalProps) {
  const descriptionId = useId()
  const styles = confirmVariantStyles[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showClose={false}
      ariaLabel={title}
      descriptionId={descriptionId}
      dismissible={!isLoading}
    >
      <div className="-m-5 sm:-m-6">
        <div className={cn('border-b-3 border-black p-5 sm:p-6', styles.header)}>
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-brutal border-3 border-black shadow-brutal-sm',
              styles.icon
            )}>
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.16em]">
                {eyebrow ?? styles.label}
              </p>
              <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p id={descriptionId} className="text-sm font-medium leading-6 text-black/75">
            {message}
          </p>

          {details.length > 0 && (
            <ul className="mt-4 space-y-2 rounded-brutal border-2 border-black bg-background p-4 text-sm">
              {details.map((detail) => (
                <li key={detail} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-black bg-orange" />
                  <span className="leading-5">{detail}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ConfirmActionButton
              onClick={onCancel ?? onClose}
              className="bg-white text-black sm:min-w-32"
              disabled={isLoading}
              autoFocus
            >
              {cancelText}
            </ConfirmActionButton>
            <ConfirmActionButton
              onClick={onConfirm}
              className={cn(styles.confirm, 'sm:min-w-40')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </ConfirmActionButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// SUCCESS MODAL
// ============================================

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  icon?: ReactNode
}

export function SuccessModal({ isOpen, onClose, title, message, icon }: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
      ariaLabel={title}
      dismissible
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-4 bg-green/20 brutal-border brutal-radius flex items-center justify-center"
        >
          {icon || <Check className="w-10 h-10 text-green" />}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display font-bold text-2xl mb-2"
        >
          {title}
        </motion.h3>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-6"
          >
            {message}
          </motion.p>
        )}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onClose}
          className="px-8 py-3 bg-green brutal-border brutal-radius font-bold shadow-brutal-sm hover:shadow-brutal transition-all"
        >
          Continue
        </motion.button>
      </div>
    </Modal>
  )
}
