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

     const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
     const [edges, setEdges] = useState<Edge[]>(workflow.edges);

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

  const hasManualTrigger = useMemo(()=>{
    return nodes.some((node)=>node.type ===NodeType.MANUAL_TRIGGER)
     },[nodes])
 
    return ( 
       <div className="size-full">
        <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
         {hasManualTrigger && (
            <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId}/>
            </Panel>
         )}
         <Panel position="top-right">
          <AddNodeButton/>
         
         </Panel>
        </ReactFlow>       
       </div>
    )
        
    
}