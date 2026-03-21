import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { refreshGmailAccessToken } from "@/lib/gmail-auth"

export async function GET() {
  const credentials = await prisma.credential.findMany({
    where: { type: { in: ["GMAIL", "GMAIL_OAUTH"] } },
    orderBy: { createdAt: "desc" },
    take: 1
  })

  if (!credentials.length) {
    return NextResponse.json({ error: "No credentials" })
  }

  const cred = credentials[0]
  
  try {
    const raw = require("@/lib/encryption").decrypt(cred.value)
    const json = JSON.parse(raw)
    
    // Attempt refresh
    const res = await refreshGmailAccessToken(cred.id, cred.userId)
    return NextResponse.json({ success: true, token: res.token.substring(0, 10), json })
  } catch (err: any) {
    let raw = "unable to decrypt"
    try { raw = require("@/lib/encryption").decrypt(cred.value) } catch (e) {}
    return NextResponse.json({ error: err.message, stack: err.stack, raw })
  }
}
