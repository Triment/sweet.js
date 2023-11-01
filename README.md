A zero dependencies http router for `bun.serve`
[Homepage](https://github.com/Triment/sweet.js/tree/npm)
## useage
### install 
```bash
npm install @triment/sweet.js@latest
```
Alternative by bun
```bash
bun install @triment/sweet.js@latest
```
#### import
```js
import { compose, createRouter } from  '@triment/sweet.js';//compose is a Combiner for multiple routes
```
#### create router
```js
const route = createRouter();
```
#### Prefix
```js
const route2 = createRouter({
    prefix: '/other'
});
```
#### Route handler
```js
route.GET("/", async(c)=>{
    return new Response("/");
})

route.GET("/xx/:90", async(c)=>{
    return new Response("xx"+ c.params['90']);
})
```
#### Middleware useage
```js
async function mid(ctx){
    console.log(ctx.req);
    ctx.hello = 90;
}
route.GET("/hello",[mid], async(c)=>{
    console.log(c.hello);//90
    return new Response("hello");
})
```
#### Middleware can intercept the response when you need it

```js
async function mid(ctx){
    if(!ctx.req.headers['x-token']){
        return new Response("You need to log in")
    }
}
//The following  code for handler will flood
route.GET("/hello",[mid], async(c)=>{
    console.log(c.hello);
    return new Response("hello");
})
```
#### Emit to bun.js together

```js
import { compose, createRouter } from  '@triment/sweet.js'

const route = createRouter();

const route2 = createRouter({
    prefix: '/xx'
})

route.GET("/", async (c)=>{
    return new Response("/")
})
route.GET("/hello", async (c)=>{
    return new Response("hello")
})
route.GET("/xx/:90", async (c)=>{
    return new Response("xx"+ c.params['90'])
})
route2.GET("/hello", async (c)=>{
    return new Response("xx/hello")
})

compose(route, route2)

Bun.serve({
    port: 3000,
    fetch: async(req)=> await route.matchRoute(req)
})

```