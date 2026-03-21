/**
 * scripts/migrate-whatsapp-tokens.ts
 *
 * One-time data migration: encrypts all plaintext verifyToken values
 * in WhatsAppTrigger and stores them in verifyTokenEncrypted.
 *
 * Run: npm run migrate:whatsapp-tokens
 *
 * Safe to re-run — skips rows that already have verifyTokenEncrypted set.
 */
import { PrismaClient } from "../src/generated/prisma"
import { encrypt } from "../src/lib/encryption"

const prisma = new PrismaClient()

async function main() {
  const triggers = await prisma.whatsAppTrigger.findMany({
    where: {
      verifyTokenEncrypted: null,
      verifyToken: { not: null },
    },
  })

  console.log(`Found ${triggers.length} trigger(s) to migrate`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const trigger of triggers) {
    try {
      // Skip rows where the legacy token is empty (should not happen, but defensive)
      if (!trigger.verifyToken) {
        skipped++
        continue
      }

      const encrypted = encrypt(trigger.verifyToken)
      await prisma.whatsAppTrigger.update({
        where: { id: trigger.id },
        data: {
          verifyTokenEncrypted: encrypted,
          verifyToken: null, // clear legacy plaintext
        },
      })
      migrated++
      console.log(`  ✓ Migrated trigger ${trigger.id} (workflow: ${trigger.workflowId})`)
    } catch (err) {
      failed++
      console.error(`  ✗ Failed trigger ${trigger.id}:`, err)
    }
  }

  console.log(
    `\nMigration complete: ${migrated} migrated, ${skipped} skipped (empty token), ${failed} failed`
  )

  if (failed > 0) {
    console.error("Some triggers failed to migrate. Check errors above.")
    process.exit(1)
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
