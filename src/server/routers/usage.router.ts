import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import prisma from "@/lib/db"
import { polarcliet } from "@/lib/polar"

const FREE_TIER_LIMIT = 50

export const usageRouter = createTRPCRouter({
  getMyUsage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id

    // Check Pro subscription
    let isPro = false
    try {
      const customer = await polarcliet.customers.getStateExternal({
        externalId: userId,
      })
      isPro =
        customer.activeSubscriptions != null &&
        customer.activeSubscriptions.length > 0
    } catch {
      isPro = false
    }

    // Get execution count from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { executionCount: true, executionResetAt: true },
    })

    if (!user) {
      return {
        isPro,
        executionCount: 0,
        executionLimit: FREE_TIER_LIMIT,
        resetAt: new Date(),
        percentUsed: 0,
      }
    }

    // Check if counter needs reset (new month)
    const now = new Date()
    const resetAt = new Date(user.executionResetAt)
    const isNewMonth =
      now.getMonth() !== resetAt.getMonth() ||
      now.getFullYear() !== resetAt.getFullYear()

    const executionCount = isNewMonth ? 0 : user.executionCount
    const percentUsed = isPro
      ? 0
      : Math.min(100, Math.round((executionCount / FREE_TIER_LIMIT) * 100))

    return {
      isPro,
      executionCount,
      executionLimit: FREE_TIER_LIMIT,
      resetAt: isNewMonth ? now : resetAt,
      percentUsed,
    }
  }),
})
