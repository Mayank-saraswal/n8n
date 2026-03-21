import { sendWorkflowExecution } from "@/inngest/utils";
import { NextRequest, NextResponse } from "next/server";
import { claimIdempotencyKey, releaseIdempotencyKey } from "@/lib/redis";
import Stripe from "stripe";

// Initialize Stripe gracefully — don't throw immediately if key is missing
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json(
                { success: false, error: "Missing required query parameter workflowId" },
                { status: 400 }
            );
        }

        const rawBody = await request.text();
        const signature = request.headers.get("stripe-signature");

        let eventId: string;
        let eventType: string;
        let stripeData: any;

        // Verify Stripe signature if secret is configured
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (stripe && webhookSecret && signature) {
            try {
                const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
                eventId = event.id;
                eventType = event.type;
                stripeData = {
                    eventId: event.id,
                    eventType: event.type,
                    timestamp: event.created,
                    livemode: event.livemode,
                    raw: event.data.object,
                };
            } catch (err: any) {
                console.error("[Stripe] Invalid signature:", err.message);
                return NextResponse.json(
                    { success: false, error: "Invalid signature" },
                    { status: 400 }
                );
            }
        } else {
            // Fallback for development / missing secrets: parse body directly
            try {
                const body = JSON.parse(rawBody);
                eventId = body.id;
                eventType = body.type;
                stripeData = {
                    eventId: body.id,
                    eventType: body.type,
                    timestamp: body.created,
                    livemode: body.livemode,
                    raw: body.data?.object,
                };
                
                if (!eventId) {
                    throw new Error("Missing event ID");
                }
            } catch (err) {
                return NextResponse.json(
                    { success: false, error: "Invalid JSON or missing event ID" },
                    { status: 400 }
                );
            }
        }

        // Deduplication using Upstash Redis
        const idempotencyKey = `stripe:${workflowId}:${eventId}`;
        const isFirstDelivery = await claimIdempotencyKey(idempotencyKey, 86400); // 24h TTL

        if (!isFirstDelivery) {
            console.log(`[Stripe] Duplicate event discarded: ${eventId} for workflow ${workflowId}`);
            return NextResponse.json({
                received: true,
                status: "duplicate_discarded",
                eventId,
            });
        }

        try {
            // Trigger Inngest job with inngestId for second-layer deduplication
            await sendWorkflowExecution({
                workflowId,
                inngestId: idempotencyKey,
                initialData: {
                    stripe: stripeData,
                },
            });
        } catch (err) {
            // Release key if Inngest send fails so we can retry
            await releaseIdempotencyKey(idempotencyKey);
            throw err;
        }

        return NextResponse.json({ success: true, status: "accepted", eventId }, { status: 200 });
    } catch (error) {
        console.error("Stripe webhook error: ", error);
        return NextResponse.json(
            { success: false, error: "Failed to process Stripe event" },
            { status: 500 }
        );
    }
}