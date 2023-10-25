import { join } from "path"
import { Context, NODE, insertNode, mergeToNode, searchNode } from "./trie2"

type HttpType = 'POST' | 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

type RouteWithHandler = {
    type: HttpType,
    regex: RegExp,
    handler: (req: Request) => Response
}
const Router = {

}

const methods = ['POST', 'GET', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']

type RouterType = {
    tree: NODE,
    matchRoute: (req: Request) => Response
} & { [key in HttpType]: (path: string, handle: (context: Context) => Response) => void }

export function createRouter({ prefix }: { prefix: string } = { prefix: '/' }) {

    let firstNode: NODE = {
        children: {},
        part: '/',
        wildChild: false,
        index: 0
    }
    let target = firstNode;
    if (prefix !== '/') {
        const parts = prefix.split('/');
        parts[0] = '/';
        for (let start = 1; start < parts.length; start++) {
            target = target.children[parts[start]] = {
                children: {},
                part: parts[start],
                wildChild: parts[start][0] === "*" || parts[start][0] === ":",//叶节点,
                //fullPath: parts.slice(0, start).join('/'),//用作节点的唯一ID
                parent: target,
                index: start
            }
        }//匹配数组改为 ['/', part1, part2, part3 ]
    }

    const route: { tree: NODE } = {
        tree: firstNode
    }
    for (const method of methods) {
        Reflect.set(route, method, function (path: string, handle: (context: Context) => Response) {
            insertNode(target as NODE, method, path, handle);
        })
    }
    Reflect.set(route, 'matchRoute', function (req: Request) {
        return Reflect.apply(function (this: RouterType, req: Request) {
            const [node, params] = searchNode(this.tree, req.method.toUpperCase(), new URL(req.url).pathname)
            return node({ req: req, params });
        }, route, [req])
    })
    return route as RouterType;
}

export function compose(...node: RouterType[]) {
    let root: RouterType;
    let i = 0;//两次遍历均会用到
    for (; i < node.length; i++) {
        if (node[i].tree.part === '/') {
            root = node[i];
            break;
        }
    }
    node.forEach((route, index) => {
        if (i === index) return;
        mergeToNode(root.tree, route.tree);
    })
}
