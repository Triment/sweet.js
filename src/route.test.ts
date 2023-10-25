import { expect, test, describe } from "bun:test";
import { compose, createRouter } from "./route";
import { Context, searchNode } from "./trie2";

describe("测试路由合并", ()=>{
    test("Compose Test", ()=>{
        const route0 = createRouter();
        const route1 = createRouter({ prefix: '/hello'});
        const hand = (ctx: Context)=>new Response();
        route0.GET("/huhu", hand);
        route1.GET("/:bker", hand);

        compose(route0, route1);
        
        let [node, params] = searchNode(route0.tree, 'GET', '/hello/89');
        // console.log(route0.tree.children['hello'].children)
        expect(params['bker']).toBe("89");
        let [node2, params2] = searchNode(route0.tree, 'GET', '/hello/huhu');
        expect(node2).toEqual(hand);
    })
})