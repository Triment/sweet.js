import { expect, test, describe } from "bun:test";
import { compose, createRouter } from "./route";
import { Context, searchNode } from "./trie2";

describe("测试路由合并", ()=>{
    test("Compose Test", ()=>{
        const route0 = createRouter();
        const route1 = createRouter({ prefix: '/hello'});
        const hand = (ctx: Context)=>{ return new Response()};
        const hand2 = (ctx: Context)=>{ return new Response("helo")};
        route0.GET("/huhu", hand);
        route1.GET("/:bker", hand2);

        compose(route0, route1);
        //console.log(route0.tree)
        let [node, params] = searchNode(route0.tree, 'GET', '/hello/89');
        // console.log(route0.tree.children['hello'].children)
        expect(params['bker']).toBe("89");
        let [node2, params2] = searchNode(route0.tree, 'GET', '/hello/huhu');
        expect(node2).toEqual(hand2);
    })
})

describe("中间件", ()=>{
    test("Middleware Test", async ()=>{
        const route0 = createRouter();
        const hand = (ctx: Context)=>{ return new Response("helo")};
        async function mid(context: Context){
            context.mid = "testmid"
            return new Response("hello")
        }
        route0.GET("/huhu",[mid], hand);
        const req = new Request('http://localhost:3000/huhu', {
            method: 'GET'
        })
        let res = await route0.matchRoute(req);
        expect(res instanceof Response).toBe(true);
        //test context modify

        function hand2(context: Context){
            return new Response(context.test)
        }
        route0.POST("/huhu",[async (context)=>{
            context.test = "test";
        }], hand2);
        const req2 = new Request('http://localhost:3000/huhu', {
            method: 'POST'
        });
        const res2 = await route0.matchRoute(req2)
        expect(await res2.text()).toBe("test")
    })
})