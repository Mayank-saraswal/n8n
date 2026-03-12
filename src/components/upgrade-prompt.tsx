"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { ZapIcon } from "lucide-react"

interface UpgradePromptProps {
  message?: string
}

export const UpgradePrompt = ({
  message = "You've reached the free tier limit of 50 executions this month.",
}: UpgradePromptProps) => {
  const handleUpgrade = async () => {
    await authClient.checkout({ slug: "pro" })
  }

  return (
    <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ZapIcon className="size-4 text-orange-500" />
        <p className="text-sm font-medium text-orange-500">Upgrade to Pro</p>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        onClick={handleUpgrade}
      >
        Upgrade to Pro — ₹999/month
      </Button>
    </div>
  )
}
