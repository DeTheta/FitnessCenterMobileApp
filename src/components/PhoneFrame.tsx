import type { ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useNow } from '@/lib/dates'

function StatusBar() {
  const now = useNow()
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[50px] items-center justify-between bg-paper/85 px-8 pt-1 backdrop-blur-md sm:flex">
      <span className="text-[15px] font-semibold tabular-nums">{time}</span>
      <span className="absolute left-1/2 top-2.5 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-ink" />
      <span className="flex items-center gap-1.5">
        <Signal className="size-4" strokeWidth={2.5} />
        <Wifi className="size-4" strokeWidth={2.5} />
        <BatteryFull className="size-5" strokeWidth={2} />
      </span>
    </div>
  )
}

export function PhoneFrame({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-dvh sm:flex sm:items-center sm:justify-center sm:gap-20 sm:p-8">
      {aside}
      <div className="relative h-dvh w-full overflow-hidden bg-paper sm:h-[844px] sm:w-[390px] sm:shrink-0 sm:rounded-[56px] sm:shadow-[0_0_0_10px_#0a0a0a,0_0_0_12px_#2a2a2a,0_40px_80px_-20px_rgba(10,10,10,0.45)]">
        <StatusBar />
        {children}
      </div>
    </div>
  )
}
