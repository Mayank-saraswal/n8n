import type {Realtime} from "@inngest/realtime"
import {useInngestSubscription} from "@inngest/realtime/hooks"
import {useEffect, useState  } from "react"
import type { NodeStatus } from "@/components/react-flow/node-status-indicator"

interface UseNodeStatusOptions{
    nodeId:string
    channel:string
    topic:string
    refreshToken: ()=> Promise<Realtime.Subscribe.Token>;
}

export interface NodeStatusState {
    status: NodeStatus
    payload: Record<string, unknown>
}

export function useNodeStatus({
nodeId,
channel,
topic,
refreshToken    
}:UseNodeStatusOptions){
    const [status , setStatus] = useState<NodeStatus>("initial")
    const {data} = useInngestSubscription({
        refreshToken,
        enabled:true
    })

    useEffect(()=>{
        if (!data?.length) {
            return
        }

        const latestMessage = data.filter( (msg)=>
        msg.kind ==="data" &&
        msg.channel === channel &&
        msg.topic === topic &&
        msg.data.nodeId === nodeId
        
        ).sort((a,b)=>{
            if (a.kind === "data" && b.kind ==="data") {
                return(
                    new Date(b.createdAt).getTime()- new Date(a.createdAt).getTime()
                )
            }
            return 0
        }) [0]

        if (latestMessage?.kind === "data") {
            setStatus(latestMessage.data.status as NodeStatus);
        }
    },[ data , nodeId , channel , topic])

    return status
}

/**
 * Extended version of useNodeStatus that returns both the status string
 * and the full message payload (e.g., resumeUrl for webhook wait nodes).
 */
export function useNodeStatusWithPayload({
    nodeId,
    channel,
    topic,
    refreshToken,
}: UseNodeStatusOptions): NodeStatusState {
    const [state, setState] = useState<NodeStatusState>({
        status: "initial",
        payload: {},
    })
    const { data } = useInngestSubscription({
        refreshToken,
        enabled: true,
    })

    useEffect(() => {
        if (!data?.length) {
            return
        }

        const latestMessage = data
            .filter(
                (msg) =>
                    msg.kind === "data" &&
                    msg.channel === channel &&
                    msg.topic === topic &&
                    msg.data.nodeId === nodeId
            )
            .sort((a, b) => {
                if (a.kind === "data" && b.kind === "data") {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                }
                return 0
            })[0]

        if (latestMessage?.kind === "data") {
            setState({
                status: latestMessage.data.status as NodeStatus,
                payload: latestMessage.data as Record<string, unknown>,
            })
        }
    }, [data, nodeId, channel, topic])

    return state
}
