import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { webhookTriggerExecutor } from "@/features/triggers/components/webhook-trigger/executor";
import { scheduleTriggerExecutor } from "@/features/triggers/components/schedule-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAiExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { xAiExecutor } from "../components/xai/executor";
import { discordExecutor } from "../components/discord/executor";
import { slackExecutor } from "../components/slack/executor";
import { perplexityExecutor } from "../components/perplexity/executor";
import { deepseekExecutor } from "../components/deepseek/executor";
import { groqExecutor } from "../components/groq/executor";
import { telegramExecutor } from "../components/telegram/executor";
import { xExecutor } from "../components/x/executor";
import { workdayExecutor } from "../components/workday/executor";
import { ifElseExecutor } from "@/features/triggers/components/if-else/executor";
import { gmailExecutor } from "../components/gmail/executor";
import { setVariableExecutor } from "../components/set-variable/executor";
import { googleSheetsExecutor } from "../components/google-sheets/executor";
import { googleDriveExecutor } from "../components/google-drive/executor";
import { whatsappExecutor } from "../components/whatsapp/executor";
import { codeExecutor } from "../components/code/executor";
import { loopExecutor } from "../components/loop/executor";
import { notionExecutor } from "../components/notion/executor";
import { razorpayExecutor } from "../components/razorpay/executor";
import { switchExecutor } from "../components/switch/executor";
import { waitExecutor } from "../components/wait/executor";
import { mergeExecutor } from "../components/merge/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
    [NodeType.WEBHOOK_TRIGGER]: webhookTriggerExecutor,
    [NodeType.SCHEDULE_TRIGGER]: scheduleTriggerExecutor,
    [NodeType.GEMINI]: geminiExecutor,
    [NodeType.ANTHROPIC]: anthropicExecutor,
    [NodeType.OPENAI]: openAiExecutor,
    [NodeType.XAI]: xAiExecutor,
    [NodeType.DISCORD]: discordExecutor,
    [NodeType.SLACK]: slackExecutor,
    [NodeType.PERPLEXITY]: perplexityExecutor,
    [NodeType.DEEPSEEK]: deepseekExecutor,
    [NodeType.GROQ]: groqExecutor,
    [NodeType.TELEGRAM]: telegramExecutor,
    [NodeType.X]: xExecutor,
    [NodeType.WORKDAY]: workdayExecutor,
    [NodeType.IF_ELSE]: ifElseExecutor,
    [NodeType.GMAIL]: gmailExecutor,
    [NodeType.SET_VARIABLE]: setVariableExecutor,
    [NodeType.GOOGLE_SHEETS]: googleSheetsExecutor,
    [NodeType.GOOGLE_DRIVE]: googleDriveExecutor,
    [NodeType.CODE]: codeExecutor,
    [NodeType.WHATSAPP]: whatsappExecutor,
    [NodeType.LOOP]: loopExecutor,
    [NodeType.NOTION]: notionExecutor,
    [NodeType.RAZORPAY]: razorpayExecutor,
    [NodeType.SWITCH]: switchExecutor,
    [NodeType.WAIT]: waitExecutor,
    [NodeType.MERGE]: mergeExecutor,

}

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type]
    if (!executor) {
        throw new Error(`No executor found for node type:${type}`)
    }

    return executor;

};
