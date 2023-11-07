import { Context, NODE, insertNode, searchNode } from "./trie2"

type HttpType = 'POST' | 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

type RouteWithHandler = {
    type: HttpType,
    regex: RegExp,
    handler: (req: Request) => Response
}
const Router = {

}

const methods = ['POST' , 'GET' , 'HEAD' , 'PUT' , 'DELETE' , 'CONNECT' , 'OPTIONS' , 'TRACE' , 'PATCH']

type RouterType = {
    tree: NODE,
    matchRoute: (req:Request)=> Response
} & { [key in HttpType]: (path: string, handle:(context:Context)=> Response)=>void }

export function createRouter( { prefix } : {prefix: string } = { prefix: '/' }){
    let root: NODE = {
        children: {},
        part: prefix,
        wildChild: false,
        index: 0
    }
    const route:  { tree: NODE } = {
        tree: root
    } 
    for(const method of methods){
        Reflect.set(route, method, function (path: string, handle:(context:Context)=> Response){
            insertNode(route.tree as NODE, method, path, handle);
        })
    }
    Reflect.set(route, 'matchRoute', function (req: Request){
        return Reflect.apply(function (this: RouterType, req: Request){
            const [node, params] = searchNode(this.tree, req.method.toUpperCase(), new URL(req.url).pathname);
            if(!node){
                return new Response("Not Found", { status: 404 });
            }
            return node({req: req, params});
        }, route, [req])
    })
    return route as RouterType;
}