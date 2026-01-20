import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import  prisma  from "@/lib/db";
import {z} from 'zod'
import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma";
import { encrypt } from "@/lib/encryption";




export const credentialsRouter = createTRPCRouter({


    
    create: premiumProcedure
    .input(z.object({
        name: z.string().min(1 , "Name is Required"),
        value: z.string().min(1, "Value is Required"),
        type:z.enum(CredentialType)
    }))
    .mutation( ({ ctx , input }) => {
        const {name , value , type} = input;

        return prisma.credenial.create({
            data: {
                name,
                userId: ctx.auth.user.id,
                value : encrypt(value),
                type,  
            },
        });
    }),
    remove : protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ ctx , input}) => {
        return prisma.credenial.delete({
            where: {
                id: input.id,
                userId: ctx.auth.user.id,
            },
        });
    }),

   


    update: protectedProcedure
    .input(z.object({
        id : z.string(),
        name: z.string().min(1 , "Name is Required"),
        value: z.string().min(1, "Value is Required"),
        type:z.enum(CredentialType)
        

    }))
    .mutation(async ({ ctx, input}) => {
        const {name, id , type , value} = input
        const credenial = await prisma.credenial.findUniqueOrThrow({
            where: {
                id,
                userId: ctx.auth.user.id,
            },
        });
       return prisma.credenial.update({
            where: {
                id,
                userId: ctx.auth.user.id,
            },
            data: {
                name,
                value : encrypt(value),
                type,
            },
        });
    }),



    getOne:protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query ( ({ctx , input})=>{
         return prisma.credenial.findUniqueOrThrow({
            where: {
                id: input.id,
                userId: ctx.auth.user.id,
            },
        });
    }),

    getMany:protectedProcedure
    .input(z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number().max(PAGINATION.MAX_PAGE_SIZE).min(PAGINATION.MIN_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(''),

    }))
     .query (async({ctx , input })=>{
        const {page, pageSize, search} = input
        const [items , totalCount ] = await Promise.all([
            prisma.credenial.findMany({
                 skip: (page - 1) * pageSize,
                take: pageSize,
                where:{userId: ctx.auth.user.id,
                     name:{
                        contains: search,
                        mode: 'insensitive'
                    },
                } ,
                orderBy:{
                    updatedAt: 'desc'
                },
               
            }),

            prisma.credenial.count({
               
                where:{
                    userId: ctx.auth.user.id,
                    name:{
                        contains: search,
                        mode: 'insensitive'
                    },
                   
                },
                
            })
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage,
            hasPreviousPage,
        }
       
    }), 
    getByType:protectedProcedure
    .input(
        z.object({
            type: z.enum(CredentialType)
        })
    )
    .query( ({ctx, input})=>{
        const {type} = input;
        return  prisma.credenial.findMany({
            where:{
                userId: ctx.auth.user.id,
                
            },
            orderBy:{
                updatedAt:"desc"
            },
        })
    })
});