"use client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { authClient } from "@/lib/auth-client"

interface UpgardeModalProps{
    open:boolean
    onOpenChange:(open:boolean)=>void
}

export const UpgradeModal = ({open,onOpenChange}:UpgardeModalProps)=>{
    return(
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Upgrade to Pro
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                       You need an active subscription to perform this action, Upgrade to pro to unlock all features
                    </AlertDialogDescription>
                    
                
                </AlertDialogHeader>
                <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={()=>authClient.checkout({slug:"pro"})}> 
                        Upgrade Now
                        </AlertDialogAction>
                 </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
            
    )
}