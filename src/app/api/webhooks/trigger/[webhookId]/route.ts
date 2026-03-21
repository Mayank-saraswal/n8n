import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { claimIdempotencyKey } from "@/lib/redis";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function computeWebhookFingerprint(
  method: string,
  headers: Record<string, string>,
  body: string
): string {
  const stableHeaders = [
    headers["content-type"] ?? "",
    headers["user-agent"] ?? "",
    headers["idempotency-key"] ?? "",
    headers["x-idempotency-key"] ?? "",
    headers["x-request-id"] ?? "",
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(`${method}|${stableHeaders}|${body}`)
    .digest("hex")
    .slice(0, 48);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ webhookId: string }> }
) {
    try {
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 1_000_000) {
            return NextResponse.json(
                { error: "Payload too large" },
                { status: 413 }
            );
        }

        const { webhookId } = await params;

        if (!webhookId) {
            return NextResponse.json(
                { success: false, error: "Missing webhookId" },
                { status: 400 }
            );
        }

        const webhookTrigger = await prisma.webhookTrigger.findUnique({
            where: { webhookId, isActive: true },
        });

        if (!webhookTrigger) {
            return NextResponse.json(
                { success: false, error: "Webhook not found" },
                { status: 404 }
            );
        }

        const rawTextBody = await request.text().catch(() => "");
        let body = {};
        try {
            if (rawTextBody) {
                body = JSON.parse(rawTextBody);
            }
        } catch {
            // keep body empty
        }

        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // Compute fingerprint and check deduplication (5 min TTL)
        const fingerprint = computeWebhookFingerprint("POST", headers, rawTextBody);
        const idempotencyKey = `webhook:${webhookId}:${fingerprint}`;
        const isFirstDelivery = await claimIdempotencyKey(idempotencyKey, 300);

        if (!isFirstDelivery) {
            console.log(`[Generic Webhook] Duplicate POST discarded for workflow ${webhookTrigger.workflowId}`);
            return NextResponse.json({ success: true, status: "duplicate_discarded" });
        }

        const receivedAt = new Date().toISOString();

        await sendWorkflowExecution({
            workflowId: webhookTrigger.workflowId,
            inngestId: idempotencyKey, // Second-layer deduplication in Inngest
            initialData: {
                webhook: {
                    body,
                    headers,
                    method: "POST",
                    receivedAt,
                },
            },
        });

        return NextResponse.json({ success: true, status: "accepted", receivedAt });
    } catch (error) {
        console.error("Webhook trigger error: ", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ webhookId: string }> }
) {
    try {
        const { webhookId } = await params;

        if (!webhookId) {
            return NextResponse.json(
                { success: false, error: "Missing webhookId" },
                { status: 400 }
            );
        }

        const webhookTrigger = await prisma.webhookTrigger.findUnique({
            where: { webhookId, isActive: true },
        });

        if (!webhookTrigger) {
            return NextResponse.json(
                { success: false, error: "Webhook not found" },
                { status: 404 }
            );
        }

        const url = new URL(request.url);
        const queryParams: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        
        // Since there is no body in GET, use query params stringified for fingerprint
        const queryAsString = url.searchParams.toString();

        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // Compute fingerprint and check deduplication (5 min TTL)
        const fingerprint = computeWebhookFingerprint("GET", headers, queryAsString);
        const idempotencyKey = `webhook:${webhookId}:${fingerprint}`;
        const isFirstDelivery = await claimIdempotencyKey(idempotencyKey, 300);

        if (!isFirstDelivery) {
            console.log(`[Generic Webhook] Duplicate GET discarded for workflow ${webhookTrigger.workflowId}`);
            return NextResponse.json({ success: true, status: "duplicate_discarded" });
        }

        const receivedAt = new Date().toISOString();

        await sendWorkflowExecution({
            workflowId: webhookTrigger.workflowId,
            inngestId: idempotencyKey, // Second-layer deduplication in Inngest
            initialData: {
                webhook: {
                    body: null,
                    headers,
                    method: "GET",
                    queryParams,
                    receivedAt,
                },
            },
        });

        return NextResponse.json({ success: true, status: "accepted", receivedAt });
    } catch (error) {
        console.error("Webhook trigger error: ", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
