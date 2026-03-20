import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { StepTrackerDesktop } from '@/components/step-tracker/StepTrackerDesktop'
import { StepTrackerMobile } from '@/components/step-tracker/StepTrackerMobile'
import { InfoToast } from '@/components/common/InfoToast'
import { CascadeConfirmModal } from '@/components/common/CascadeConfirmModal'
import { OutOfCreditsModal } from '@/components/credits/OutOfCreditsModal'
import { useJourneyStore } from '@/store/journey-store'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const showOutOfCredits = useJourneyStore((s) => s.showOutOfCredits)
  const setShowOutOfCredits = useJourneyStore((s) => s.setShowOutOfCredits)

  return (
    <div className="h-screen flex flex-col bg-page">
      <Header />
      <StepTrackerDesktop />
      <StepTrackerMobile />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </div>
      <InfoToast />
      <CascadeConfirmModal />
      <OutOfCreditsModal
        open={showOutOfCredits}
        onClose={() => setShowOutOfCredits(false)}
      />
    </div>
  )
}
