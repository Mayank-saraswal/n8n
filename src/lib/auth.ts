import {betterAuth} from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./db"
import {checkout, polar, portal} from "@polar-sh/better-auth"
import { polarcliet } from "./polar"

export const auth = betterAuth({
 database: prismaAdapter(prisma,{
    provider:"postgresql"
 }),
 emailAndPassword:{
    enabled:true,
    autoSignIn:true
 },
 socialProviders:{
   github:{
      clientId:process.env.GITHUB_CLIENT_ID as string,
      clientSecret:process.env.GITHUB_CLIENT_SECRET as string
   },
   google:{
      clientId:process.env.GOOGLE_CLIENT_ID as string,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET as string
   }
 },

 plugins:[
   polar({
      client: polarcliet,
      createCustomerOnSignUp:true,
      use:[
         checkout({
            products:[
               {
                  productId:"fd0604e2-5c74-4627-b907-f3cdb8662398",
                  slug: "pro"
               }
            ],
            successUrl:process.env.POLAR_SUCCESS_URL,
            authenticatedUsersOnly:true
         }),
         portal()
      ]
   })
 ],
 baseURL: process.env.BETTER_AUTH_URL,
 secret: process.env.BETTER_AUTH_SECRET
});
