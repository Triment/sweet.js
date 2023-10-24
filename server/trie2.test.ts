import { expect, test, describe } from "bun:test";
import { NODE, insertNode, searchNode, Context } from './trie2';
describe("测试前缀树(new)", ()=>{
    test("Insert Test", ()=>{
        const node: NODE = {
            children: {},
            part: "hellxo",
            wildChild: false,
            index: 0
        };
        const handle = (ctx: Context) => {
            return new Response(ctx.req.url)
        }
        const handle2 = (ctx: Context) => {
            return new Response(ctx.req.url)
        }
        insertNode(node, 'GET', "/hello/:x/:y", handle);
        let target = searchNode(node, 'GET', "/hello/90/80");
        expect(target[1]['x']).toEqual("90")
        insertNode(node, 'POST', "/hello/:x/:y", handle2);
        target = searchNode(node, 'POST', "/hello/90/80");
        expect(target[1]['x']).toEqual("90")
        expect(target[0]).toEqual(handle2)
        insertNode(node, 'GET', "/hello/:x/hu", handle);
        target = searchNode(node, "GET", "/hello/99/hu");
        expect(target[1]['x']).toEqual("99")
        insertNode(node, 'POST', "/hello/:x/*target", handle2);
        target = searchNode(node, "POST", "/hello/80/hu/max");
        expect(target[1]['target']).toEqual("hu/max");
        console.log(node)
    })
})