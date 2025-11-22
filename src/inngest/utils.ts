import toposort from 'toposort';
import { Connection , Node } from '@/generated/prisma';


export const topologicalSort = (
    nodes:Node[],
    connections:Connection[]
     ):Node[] =>{
        if (connections.length === 0) {
            return nodes;
        }

        //Create edged 

        const edges:[string , string ] []= connections.map((conn) => [conn.fromNodeId, conn.toNodeId]);
            
    
        const connectedNodesIds = new Set<string>();
        for ( const conn of connections) {
            connectedNodesIds.add(conn.fromNodeId);
            connectedNodesIds.add(conn.toNodeId);
        
        
        }

        for (const node of nodes) {
            if (!connectedNodesIds.has(node.id)) {
                edges.push([node.id , node.id]);
            }
        }

        let sortedNodesIds:string[];
        try {
            sortedNodesIds = toposort(edges)

            sortedNodesIds = [...new Set(sortedNodesIds)];
        } catch (error) {
            if (error instanceof Error && error.message.includes('Cyclic')) {
                throw new Error('Workflow contains a cycle');
            } 
             throw error
                
            }

            //Map sorted ids back to node objects 

            const nodeMap = new Map(nodes.map((n)=>[n.id , n]));
            return sortedNodesIds.map((id)=>nodeMap.get(id)!).filter(Boolean)

};

