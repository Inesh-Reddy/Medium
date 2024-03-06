import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge' // a serverless offering
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'


export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string;
        JWT_SECREET : string;
    }
}>();

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate())
    const blog = await prisma.blog.create({
        data : {
            title: body.title,
            content: body.content,
            authorId: 1,
        }
    })
    return c.json({
        id:blog.id
    })
})
blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where: {
            id:body.id
        },
        data : {
            title: body.title,
            content: body.content,
        }
    })
    return c.json({
        id:blog.id
    })
})
blogRouter.get('/:id', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate())
    try{
        const blog = await prisma.blog.findFirst({
            where : {
                id: body.id
            }
        })
        return c.json({
            blog
        })
    }catch(e){
        c.status(411);
        return c.json({
            message: "Error while fetching blog"
        });
    }
})

//add pagination.
blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL, 
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany();
    return c.json({
        blogs
    })
})
