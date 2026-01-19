"use client"

import { CredentialType } from "@/generated/prisma";
import { useParams, useRouter } from "next/navigation";
import z, { string } from "zod";
import { useCreateCredential, useUpdateCredential , useSuspennseCredential} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form , FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select , SelectContent , SelectItem , SelectTrigger , SelectValue } from "@/components/ui/select";
import { Card , CardContent , CardDescription , CardFooter , CardHeader , CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";   
import  Image  from "next/image";
import Link from "next/link";


const formSchema = z.object({
    name:z.string().min(1, "Name is Required"),
    type:z.enum(CredentialType),
    value:z.string().min(1 , "Api key  is required")
})




type FormValues = z.infer<typeof formSchema>

const credentialTypeOptions=[
    {
        value:CredentialType.OPENAI,
        label:"Open AI",
        logo:"/logos/openai.svg"
    },
    {
        value:CredentialType.ANTHROPIC,
        label:"Anthropic",
        logo:"/logos/anthropic.svg"
    },
    {
        value:CredentialType.GEMINI,
        label:"Gemini",
        logo:"/logos/gemini.svg"
    },
    
]

interface CredentialsFormPage{
   initialData?:{
    id?:string;
    name:string;
    type:CredentialType
    value:string

   }
};


export const CredentialForm = ({initialData}:CredentialsFormPage)=>{
   const router = useRouter();
   const createCredential = useCreateCredential();
   const updateCredential = useUpdateCredential();
   const {handleError , modal} = useUpgradeModal();
    
   const isEdit = !!initialData?.id;
   const form = useForm<FormValues>({
    resolver:zodResolver(formSchema),
    defaultValues: initialData||{
        name: "",
        type:CredentialType.OPENAI,
        value:""
    }
   })

   const onSubmit = async (values:FormValues)=>{
    if(isEdit && initialData?.id){
        await updateCredential.mutate({
         id:initialData.id,
         
         ...values
        })
    }else{
        await  createCredential.mutate(values,{
         onSuccess:(data)=>{
            router.push(`/credentials/${data.id}`)
         },
         onError:(error)=>{
            handleError(error);
         }

        })
    }
   }

   return(
      <>
      {modal}
    <Card>
        <CardHeader>
            <CardTitle>
                {isEdit ? "Edit Credential" : "Create Credential"}
            </CardTitle>
            <CardDescription>
                {isEdit ? "Update your api key or credentials" : "Add a new api key or credentials to your account"}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <FormField
                    control={form.control}
                    name="name"
                    render={({field})=>(
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="MY Api key" {...field}/>
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                    )}


                    />

                    <FormField
                    control={form.control}
                    name="type"
                    render={({field})=>(
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        
                            <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {credentialTypeOptions.map((option)=>(
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                            <Image src={option.logo} alt={option.label} width={16} height={16}/>
                                            <span>{option.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                              </SelectContent>

                                

                            </Select>
                            <FormMessage/>
                            
                        
                        
                        </FormItem>
                    )}


                    />


                    <FormField
                    control={form.control}
                    name="value"
                    render={({field})=>(
                        <FormItem>
                        <FormLabel>Api Key</FormLabel>
                        <FormControl>
                            <Input  type="password" placeholder="sk-..." {...field}/>
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                    )}


                    />

                    <div className="flex gap-4">
                     <Button type="submit" 
                     disabled={
                        createCredential.isPending || updateCredential.isPending
                     }
                     >{isEdit ? "Update" : "Create"}</Button>
                     <Button  asChild variant="outline" onClick={()=>router.push("/credentials")}>

                        <Link href="/credentials" prefetch >Cancel</Link>
                     </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
    </>
   )
}







export const  CredentialView = ({credentialId}: {credentialId: string})=>{
   const {data:credential} = useSuspennseCredential(credentialId);

   return(
    <CredentialForm initialData={credential}/>
   )
}