import { expect, test, describe } from "bun:test";
import { Node, insertNode, searchNode } from './trie2';
describe("测试前缀树(new)", ()=>{
    test("Insert Test", ()=>{
        const node: Node = {
            children: {},
            part: "",
            wildChild: false
        };
        insertNode(node, "/hello/8080");
        const targetNode = searchNode(node, "/hello/8080");
        console.log(targetNode);
        expect(targetNode?.wildChild).toBe(true);
    })
})