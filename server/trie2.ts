import assert from "assert";

type Context = {
    params: Record<string, string>,
    req: Request
} & {[key:string]: any}

type HTTPHandler = (context: Context)=>Response

type Node = {
    children: Record<string, Node>,
    part: string,
    wildChild: Boolean,
    fullPath?: string,
    parent?: Node,
    index: number,
    handle?: Record<string, (context: Context)=>Response>
}

function insertNode(node: Node, method: string, path: string, handle: (context: Context)=>Response ){
    let target = Object.assign({}, node);
    const parts = path.split('/').slice(1);
    for(let start = 1; start < parts.length; start++) {
        let child = target.children[parts[start]];
        if(child){
            target = child;
        } else {
            target = target.children[parts[start]] = {
                children: {},
                part: parts[start],
                wildChild: parts[start][0] === "*"|| parts[start][0] === ":",//叶节点,
                //fullPath: parts.slice(0, start).join('/'),//用作节点的唯一ID
                parent: target,
                index: start
            }
        }
    }
    target.fullPath = path;
    target.wildChild = true;
    if(!target.handle) target.handle = {};
    target.handle![method] = handle;
}

function searchNode(node: Node, method: string, path: string): [HTTPHandler, Record<string, string>]{
    const parts = path.split('/').slice(1);
    assert(parts.length > 0);
    let params: Record<string, string> = {};
    let index = 0;
    let stack: Node[] = [node];
    let current: Node;
    do {
        current = stack.pop()!;//取出栈顶
        if(current.index == index) {
            if(current.part === parts[index]){//精准匹配
                index++;
                for(const child of Object.keys(current.children)){
                    stack.push(current.children[child]);
                }
            }
            if(current.part[0] === ':'){//模糊匹配
                for(const child of Object.keys(current.children)){
                    stack.push(current.children[child]);
                }
                params[current.part.slice(1)] = parts[index];
                index++;
            }
            if(current.part[0] === '*' && current.wildChild ){
                params[current.part.slice(1)] = parts.slice(index).join('/')
                return [current.handle![method], params]
            }
        } else {
            index--;
        }
    } while(index < parts.length && stack.length > 0);
    return [current.handle![method], params];
}

export { Node, insertNode, searchNode }
export { Context, HTTPHandler }