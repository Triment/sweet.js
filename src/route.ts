import { Context, NODE, insertNode, mergeToNode, searchNode } from "./trie2";

type HttpType = 'POST' | 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

const methods = ['POST', 'GET', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];


//中间件类型
type MiddleType = ((context: Context)=>Promise<void>)|((context: Context)=>Promise<Response>);


declare function methodHandler(path: string, handle: (context: Context) => Promise<Response>):void
declare function methodHandler(path: string, middle: MiddleType[],  handle: (context: Context) => Promise<Response>):void
//方法类型
type MethodsType = typeof methodHandler;
//路由类型
type RouterType = {
    tree: NODE,
    matchRoute: (req: Request) => Promise<Response>
} & { [key in HttpType]: MethodsType }

export function createRouter({ prefix }: { prefix: string } = { prefix: '/' }) {
//每个路由都有 ‘/’
    let firstNode: NODE = {
        children: {},
        part: '/',
        wildChild: false,
        index: 0
    }
    let target = firstNode;
    if (prefix !== '/') {
        const parts = prefix.split('/');
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
    //重载GET/POST等函数实现
    function insertHandler(...args: unknown[]){
        if((args as any[]).length === 3)
        insertNode(target as NODE, (args as any)[0], (args as any)[1], (args as any)[2]);
        if((args as any[]).length === 4){//有中间件重写handler
            let handler = async (context: Context)=>{
                let ctx = context;
                for(const mid of (args as any)[2]){
                    const resOfMiddleFunc = await mid(context);
                    if(resOfMiddleFunc instanceof Response){//中间件拦截，判断条件是中间件返回了一个对象 因为中间件返回
                        return resOfMiddleFunc;
                    }
                }
                return await (args as any)[3](ctx);//调用handler并传入处理过的context
            }
            insertNode(target as NODE, (args as any)[0], (args as any)[1], handler);
        }
        return route;
    }
    for (const method of methods) {
        Reflect.set(route, method, function(...args: any[]){
                insertHandler(method, ...args)
        })
    }
    Reflect.set(route, 'matchRoute', function (req: Request) {
        return Reflect.apply(async function (this: RouterType, req: Request) {
            const [node, params] = searchNode(this.tree, req.method.toUpperCase(), new URL(req.url).pathname)
            return await node({ req: req, params });
        }, route, [req])
    })
    return route as RouterType;
}

export function compose(...node: RouterType[]) {
    if(node.length < 2) throw("At least two parameters are required!")
    let root = node[0];
    node.slice(1).forEach((route) => {
        mergeToNode(root.tree, route.tree);
    })
}
