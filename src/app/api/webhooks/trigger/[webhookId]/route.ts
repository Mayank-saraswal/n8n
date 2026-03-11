import { sendWorkflowExecution } from "@/inngest/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

        const body = await request.json().catch(() => ({}));
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const receivedAt = new Date().toISOString();

        await sendWorkflowExecution({
            workflowId: webhookId,
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
            workflowId: webhookId,
            initialData: {
                webhook: {
                    body: queryParams,
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
