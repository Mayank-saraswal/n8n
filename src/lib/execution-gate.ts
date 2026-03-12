import prisma from "@/lib/db"
import { polarcliet } from "@/lib/polar"
import { TRPCError } from "@trpc/server"

const FREE_TIER_LIMIT = 50

/**
 * Checks if a user can execute a workflow.
 * - Pro subscribers: always allowed
 * - Free users: allowed if under 50 executions this month
 * Throws TRPCError if not allowed.
 */
export async function checkExecutionLimit(userId: string): Promise<void> {
  // Check if user has active Pro subscription
  try {
    const customer = await polarcliet.customers.getStateExternal({
      externalId: userId,
    })
    if (customer.activeSubscriptions && customer.activeSubscriptions.length > 0) {
      // Pro user — no limit
      return
    }
  } catch {
    // Customer not found in Polar = free user, continue to limit check
  }

  // Free user — check monthly execution count
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { executionCount: true, executionResetAt: true },
  })

  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" })

  // Reset counter if it's a new month
  const now = new Date()
  const resetAt = new Date(user.executionResetAt)
  const isNewMonth =
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()

  if (isNewMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: { executionCount: 0, executionResetAt: now },
    })
    return // Fresh month — allow execution
  }

  if (user.executionCount >= FREE_TIER_LIMIT) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Free tier limit reached. You have used ${FREE_TIER_LIMIT} executions this month. Upgrade to Pro for unlimited executions.`,
    })
  }
}

/**
 * Increments the execution count for a free user.
 * Call this AFTER a workflow execution starts successfully.
 */
export async function incrementExecutionCount(userId: string): Promise<void> {
  try {
    const customer = await polarcliet.customers.getStateExternal({
      externalId: userId,
    })
    if (customer.activeSubscriptions && customer.activeSubscriptions.length > 0) {
      return // Pro user — don't count
    }
  } catch {
    // Free user — increment
  }

  await prisma.user.update({
    where: { id: userId },
    data: { executionCount: { increment: 1 } },
  })
}
