type Context = {
    params: Record<string, string>,
    req: Request
} & { [key: string]: any }

type HTTPHandler = (context: Context) => Promise<Response>

type NODE = {
    children: Record<string, NODE>,
    part: string,
    wildChild: Boolean,
    fullPath?: string,
    parent?: NODE,
    index: number,
    handle?: Record<string, HTTPHandler>
}

function insertNode(node: NODE, method: string, path: string, handle: (context: Context) => Promise<Response>) {
    let target = Object.assign({}, node);
    const parts = path.split('/');
    parts[0] = '/';
    for (let start = 1; start < parts.length; start++) {
        let child = target.children[parts[start]];
        if (child) {
            target = child;
        } else {
            target = target.children[parts[start]] = {
                children: {},
                part: parts[start],
                wildChild: parts[start][0] === "*" || parts[start][0] === ":",//叶节点,
                //fullPath: parts.slice(0, start).join('/'),//用作节点的唯一ID
                parent: target,
                index: start + node.index//每次插入需加上“基节点”的层级
            }
        }
    }
    target.fullPath = path;
    target.wildChild = true;
    if (!target.handle) target.handle = {};
    target.handle![method] = handle;
}

function searchNode(node: NODE, method: string, path: string): [HTTPHandler, Record<string, string>] {
    const parts = path.split('/');
    if (path[0] === '/') // 从根开始搜索
        parts[0] = '/';//第一节点设置为 '/'
    let params: Record<string, string> = {};
    let index = 0;
    let stack: NODE[] = [node];
    let current: NODE;
    do {
        current = stack.pop()!;//取出栈顶
        // console.log(index, current.part, current.index, parts[index])
        if (current.index - node.index == index) {//此处可以支持从子节点搜索路径
            if (current.part === parts[index]) {//精准匹配
                index++;
                for (const child of Object.keys(current.children)) {
                    stack.push(current.children[child]);
                }
            }
            if (current.part[0] === ':') {//模糊匹配
                for (const child of Object.keys(current.children)) {
                    stack.push(current.children[child]);
                }
                params[current.part.slice(1)] = parts[index];
                index++;
            }
            if (current.part[0] === '*' && current.wildChild) {
                params[current.part.slice(1)] = parts.slice(index).join('/');
                return [current.handle![method], params];
            }
        } else {
            index--;
        }
    } while (index < parts.length && stack.length > 0);
    return [current.handle![method], params];
}
//合并两个树
function mergeToNode(first: NODE, second: NODE) {
    //树直接将第二个树加入到第一个的子节点并把所有加入的子节点的索引增加 固定数值 = second.part.split('/').length
    //主要更新的是路由关系
    let target = Object.assign({}, first);
    let stack: NODE[] = [second];

    while (stack.length > 0) {
        let attachment = stack.pop()!;
        if (attachment.part === '/') {
            for (const child of Object.keys(attachment.children)) {
                stack.push(attachment.children[child]);
            }
            continue;
        }
        attachment.parent = target;
        attachment.index = target.index + 1;
        target = target.children[attachment!.part] = attachment;
    }
}
export { NODE, insertNode, searchNode, mergeToNode }
export { Context, HTTPHandler }