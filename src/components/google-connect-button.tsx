"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface GoogleConnectButtonProps {
  credentialName: string
  credentialType: "GMAIL" | "GMAIL_OAUTH" | "GOOGLE_SHEETS" | "GOOGLE_DRIVE"
  returnUrl?: string
  isConnected?: boolean
  connectedEmail?: string
  onDisconnect?: () => void
}

export function GoogleConnectButton({
  credentialName,
  credentialType,
  returnUrl,
  isConnected = false,
  connectedEmail,
  onDisconnect,
}: GoogleConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = () => {
    if (!credentialName.trim()) {
      alert("Please enter a credential name before connecting.")
      return
    }
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set("name", credentialName)
    params.set("type", credentialType)
    if (returnUrl) {
      params.set("returnUrl", returnUrl)
    }
    window.location.href = `/api/auth/google/start?${params.toString()}`
  }

  if (isConnected && connectedEmail) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2Icon className="size-5 shrink-0 text-green-600 dark:text-green-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Connected as {connectedEmail}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Google account is linked and active
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <ExternalLinkIcon className="mr-1.5 size-3.5" />
            )}
            Reconnect
          </Button>
          {onDisconnect && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-center gap-2 border-2"
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <Image
            src="/logos/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
        )}
        {isLoading ? "Redirecting to Google..." : "Connect with Google"}
      </Button>

      <p className="text-xs text-muted-foreground">
        You will be redirected to Google to approve access. Nodebase will request permission to
        manage Gmail, Google Sheets, and Google Drive on your behalf. You can revoke access at any
        time from your{" "}
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Google account settings
        </a>
        .
      </p>
    </div>
  )
}
