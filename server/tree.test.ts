import { expect, test, describe } from "bun:test";
import { findWildcard, countParams, longestCommonPrefix } from './tree'
describe("tree.ts-测试查找路径参数", ()=>{
    test("findWildcard", ()=>{
        expect(findWildcard("/hu/:param")).toEqual({
            wildCard: ":param",
            index: 4,
            valid: true
        })
        expect(findWildcard("/hu/:param/about")).toEqual({
            wildCard: ":param",
            index: 4,
            valid: true
        })
        expect(findWildcard("/hu/*param/*about")).toEqual({
            wildCard: "*param",
            index: 4,
            valid: true
        })
    })
})

describe("tree.ts-测试查找路径参数个数", ()=>{
    test("countParams", ()=>{
        expect(countParams("/hu/:param")).toBe(1)
        expect(countParams("/hu/:param/*about")).toBe(2)
        expect(countParams("/hu/*param/*about/:jiji")).toBe(3)
    })
})

describe("tree.ts-最长公共前缀", ()=>{
    test("longestCommonPrefix", ()=>{
        expect(longestCommonPrefix("/hu/:param", "/hu/:param/*about")).toBe(10)
        expect(longestCommonPrefix("/hu/:param", "/hu/:par")).toBe(8)
        expect(longestCommonPrefix("/hu/:param", "/hu/*param/*about/:jiji")).toBe(4)
    })
})