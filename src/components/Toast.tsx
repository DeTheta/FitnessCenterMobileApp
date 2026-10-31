import { CheckCircle2 } from 'lucide-react'
import { useBooking } from '@/state/BookingContext'

export function Toast() {
  const { toast } = useBooking()
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-4 top-[max(16px,env(safe-area-inset-top))] z-50 flex justify-center sm:top-14">
      {toast && (
        <div key={toast.id} className="flex animate-toast-in items-center gap-3 rounded-full bg-ink py-3 pl-3 pr-5 text-sm font-medium text-white shadow-2xl shadow-ink/30">
          <CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden />
          {toast.message}
        </div>
      )}
    </div>
  )
}
