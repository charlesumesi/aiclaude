import { useEffect } from 'react'
import CloseIcon from './CloseIcon.jsx'

// Overlay dialog. Closes on Escape, the × button, or a click on the backdrop.
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-surface p-6 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <h2 id="modal-title" className="text-lg text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
