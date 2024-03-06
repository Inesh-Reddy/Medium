import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge' // a serverless offering
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'


export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL : string;
        JWT_SECRET : string;
    }
}>();

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();

    // if you ever want access to env variable in cloudflair?
    // which if you want access to prisma url in .toml file from this index.ts file?
    // Which is not accessable globally ?? ---> why? ----> need to figure out 
    // So the Prisma initialisation needs to happen inside each and every Route.
    // But when we do that ...the typescript throws a weired error
    // 
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,  //here error comes coz, typescript doesn't know the tomml file.
    }).$extends(withAccelerate()) // when using accelerator 
    try{
        const user = await prisma.user.create ({
        data:{
            username: body.username,
            password: body.password,
            name: body.name
        }
        })
        const jwt = await sign({
        id : user.id,
        }, c.env.JWT_SECRET)

        return c.text(jwt)
    }catch (e){
        c.status(404);
        return c.text("invalid");
    }
})

userRouter.post('/signin',  async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate()) 
    try{
        const user = await prisma.user.findFirst ({
        where:{
            username: body.username,
            password: body.password,
        }
        })
        if (!user){
        c.status(403);
        return c.json({
            message: "incorrect creds"
        })
        }
        const jwt = await sign({
        id : user.id,
        }, c.env.JWT_SECRET)

        return c.text(jwt)
    }catch (e){
        c.status(404);
        return c.text("invalid");
    }
})
  
