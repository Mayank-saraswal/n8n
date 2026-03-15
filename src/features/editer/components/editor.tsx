"use client"
import { LoadingView } from "@/components/entity-components";
import { useSuspennseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useState , useCallback, useMemo } from "react";
import {ReactFlow , applyNodeChanges , applyEdgeChanges , addEdge ,  type NodeChange , type EdgeChange , type Connection ,type Node , type Edge, Background, Controls, MiniMap} from '@xyflow/react'
import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { Panel } from "@xyflow/react";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@/generated/prisma";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"

const EXECUTABLE_TRIGGER_TYPES = [
    NodeType.INITIAL,
    NodeType.MANUAL_TRIGGER,
    NodeType.WEBHOOK_TRIGGER,
    NodeType.SCHEDULE_TRIGGER,
] as const




export const EditorLoading = ()=>{
    return(
        <LoadingView message="Loading Editor" />
    )
}

export const EditorError = ()=>{
    return(
        <LoadingView message=" Error Loading editor" />
    )
}


export const Editor = ({workflowId}:{workflowId:string}) => {
    const {data:workflow} = useSuspennseWorkflow(workflowId)
     const setEditor = useSetAtom(editorAtom) 
    const trpc = useTRPC()

     const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
     const [edges, setEdges] = useState<Edge[]>(workflow.edges);

    // DB cleanup mutations — fire-and-forget when nodes are deleted from canvas
    const deleteCode = useMutation(trpc.code.delete.mutationOptions())
    const deleteGmail = useMutation(trpc.gmail.delete.mutationOptions())
    const deleteGoogleDrive = useMutation(trpc.googleDrive.delete.mutationOptions())
    const deleteGoogleSheets = useMutation(trpc.googleSheets.delete.mutationOptions())
    const deleteIfElse = useMutation(trpc.ifElse.delete.mutationOptions())
    const deleteLoop = useMutation(trpc.loop.delete.mutationOptions())
    const deleteNotion = useMutation(trpc.notion.delete.mutationOptions())
    const deleteRazorpay = useMutation(trpc.razorpay.delete.mutationOptions())
    const deleteSetVariable = useMutation(trpc.setVariable.delete.mutationOptions())
    const deleteSlack = useMutation(trpc.slack.delete.mutationOptions())
    const deleteSwitch = useMutation(trpc.switch.delete.mutationOptions())
    const deleteWhatsapp = useMutation(trpc.whatsapp.delete.mutationOptions())
    const deleteWait = useMutation(trpc.wait.delete.mutationOptions())

    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
      for (const node of deletedNodes) {
        const nodeId = node.id
        switch (node.type) {
          case NodeType.CODE: deleteCode.mutate({ nodeId }); break
          case NodeType.GMAIL: deleteGmail.mutate({ nodeId }); break
          case NodeType.GOOGLE_DRIVE: deleteGoogleDrive.mutate({ nodeId }); break
          case NodeType.GOOGLE_SHEETS: deleteGoogleSheets.mutate({ nodeId }); break
          case NodeType.IF_ELSE: deleteIfElse.mutate({ nodeId }); break
          case NodeType.LOOP: deleteLoop.mutate({ nodeId }); break
          case NodeType.NOTION: deleteNotion.mutate({ nodeId }); break
          case NodeType.RAZORPAY: deleteRazorpay.mutate({ nodeId }); break
          case NodeType.SET_VARIABLE: deleteSetVariable.mutate({ nodeId }); break
          case NodeType.SLACK: deleteSlack.mutate({ nodeId }); break
          case NodeType.SWITCH: deleteSwitch.mutate({ nodeId }); break
          case NodeType.WHATSAPP: deleteWhatsapp.mutate({ nodeId }); break
          case NodeType.WAIT: deleteWait.mutate({ nodeId }); break
        }
      }
    }, [deleteCode, deleteGmail, deleteGoogleDrive, deleteGoogleSheets, deleteIfElse, deleteLoop, deleteNotion, deleteRazorpay, deleteSetVariable, deleteSlack, deleteSwitch, deleteWhatsapp, deleteWait])

       const onNodesChange = useCallback(
    (changes:NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes:EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params : Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const executableTriggerType = useMemo(()=>{
    const triggerNode = nodes.find((node)=>
      EXECUTABLE_TRIGGER_TYPES.includes(node.type as typeof EXECUTABLE_TRIGGER_TYPES[number])
    )
    return triggerNode?.type as typeof EXECUTABLE_TRIGGER_TYPES[number] | undefined
  },[nodes])
 
    return ( 
       <div className="size-full">
        <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        fitView
        proOptions={{hideAttribution:true}}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        snapGrid={[10 , 10]}
        snapToGrid
        panOnScroll
        panOnDrag = {false}
        selectionOnDrag
        >
         <Background/>  
         <Controls/>

         <MiniMap/> 
         {executableTriggerType && (
            <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} triggerType={executableTriggerType}/>
            </Panel>
         )}
         <Panel position="top-right">
          <AddNodeButton/>
         
         </Panel>
        </ReactFlow>       
       </div>
    )
        
    
}