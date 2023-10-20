import { expect, test, describe } from "bun:test";
import { Node, insertNode, searchNode } from './trie';

describe("测试前缀树", ()=>{
    test("Insert Test", ()=>{
        const node: Node = {
            children: {},
            part: "",
            wildChild: false
        };
        insertNode(node, "/hello/:kkk");
        const parts = "/hello/90".split("/").slice(1);
        let params = {};
        const targetNode = searchNode(node, parts, parts.length-1, 0,  params);
        expect(targetNode[0].wildChild).toBe(true);
        expect(targetNode[1]).toBe({ kkk: "90"});
    })
})