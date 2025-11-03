import { PlusIcon, SearchIcon } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { StackId } from "recharts/types/util/ChartUtils"
import { Input } from "./ui/input"


type EntityHeaderProps ={
    title:string
    description?:string
    newButtonLabel?:string
    disabled?: boolean
    isCreating?: boolean
} &(
    | {onNew:() => void; newButtonHerf?:never}
    |{newButtonHerf : string; onNew?:never}
    | {onNew?:never; newButtonHerf?:never}
)



export const EntityHeader= ({ title , description, newButtonLabel , disabled , isCreating, newButtonHerf , onNew}:EntityHeaderProps)=>{
   return(
    <div className="flex flex-row items-center justify-between gap-x-4">
        <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold ">
                {title}

            </h1>
            {description && (
                <p className="text-xs md:text-sm  text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
        {onNew && !newButtonHerf &&(
            <Button
             disabled = {isCreating || disabled}
             size="sm"
             onClick={onNew}>
                <PlusIcon className="size-4"/>
                {newButtonLabel}
            </Button>
        )}

        {newButtonHerf && !onNew &&(
            <Button
             asChild
             size="sm"
             >
                <Link href={newButtonHerf} prefetch>
                <PlusIcon className="size-4"/>
                {newButtonLabel}
                </Link>
            </Button>
        )}

    </div>
   )
}

type EntityContainerProps ={
    children:React.ReactNode
    header?:React.ReactNode
    search?:React.ReactNode
    pagination?:React.ReactNode

}

export const EntityContainer = ({ children , header, search, pagination }:EntityContainerProps) =>{
    return(
        <div className="p-4 md:px-10 md:py-6 h-full">
           <div className="mx-auto  max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
            {header}
           
           <div className="flex flex-col gap-y-4 h-full">
            {search}
            {children}
           </div>
           {pagination}
        </div>
        </div>
    )
}

interface EntitySearchprops{
    value : string
    onChange : (value:string) => void
    placeholder?:string
}


export const EntitySearch = ({value , onChange , placeholder}:EntitySearchprops)=>{
    return(
        <div className="relative ml-auto">
            <SearchIcon className=" size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input  className="max-w-[200px] bg-background shadow-none border-border pl-8"
            placeholder={placeholder   }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            
            />

        </div>
    )
}


interface EntityPaginationProps{
    page:number
    totalPages:number
    disabled?:boolean
    onPageChange:(page:number) => void
}

export const EntityPagination= ({ page, totalPages, disabled , onPageChange}:EntityPaginationProps)=>{
    return(
        <div className=" flex items-center justify-between gap-x-2 w-full">
            <div className=" flex-1 text-sm text-muted-foreground">
            Page {page} of {totalPages || 1} 
            </div>
            <div className="flex items-center justify-end space-x-2 py-2">
                 <Button 
                 disabled={disabled || page === 1}
                 variant="outline"
                 size="sm"
                 onClick={() => onPageChange(Math.max(1, page-1))}
                 >
                 Previous
                 </Button>
                 <Button 
                  disabled={disabled || page === totalPages|| totalPages === 0}
                 variant="outline"
                 size="sm"
                 onClick={() => onPageChange(Math.min(totalPages , page+1))}
                 >
                 Next
                 </Button>
            </div>

        </div>
    )
}