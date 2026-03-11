import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

        const body = await request.json().catch(() => ({}));
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const receivedAt = new Date().toISOString();

        await sendWorkflowExecution({
            workflowId: webhookTrigger.workflowId,
            initialData: {
                webhook: {
                    body,
                    headers,
                    method: "POST",
                    receivedAt,
                },
            },
        });

        return NextResponse.json({ success: true, receivedAt });
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

        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const receivedAt = new Date().toISOString();

        await sendWorkflowExecution({
            workflowId: webhookTrigger.workflowId,
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

        return NextResponse.json({ success: true, receivedAt });
    } catch (error) {
        console.error("Webhook trigger error: ", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
