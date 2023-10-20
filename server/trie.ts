import assert from "assert";

type Node = {
    children: Record<string, Node>,
    part: string,
    wildChild: Boolean,
    fullPath?: string
}

function insertNode(node: Node, path: string){
    let target = Object.assign({}, node);//deep copy
    let parts = path.split("/").slice(1);
    for (const part of parts) {
        let child = node.children[part];
        if(child){
            target = child;
        } else if (part.length > 0) {
            let wildChild = part[0] === '*';
            let nextNode = {
                part,
                children: {},
                wildChild
            };
            target.children[part] = nextNode;
            target = nextNode;
            if(wildChild) break;
        }
    }
    target.wildChild = true;
    target.fullPath = path;
}

function searchNode(node: Node, parts: string[], length: number, index: number, params: Record<string, string>) {
    let stack: Node[] = [node];
    while(stack.length>0){
        let current = stack.pop();
        assert(current);
        console.log(current)
        if(index === length) {
            if(current.part == parts[index])
            return [current, params];
            if(current.part.startsWith(':')|| current.part.startsWith('*')) {
                params[current.part.slice(1)] = parts[index];
            }
            return [current, params]
        }
        let child = current.children[parts[index]];
        if(child) {
            stack.push(child);
            index++;
            continue;
        }
        for(let key in current.children){
            if(key[0] === ':') {
                params[key.slice(1)] = parts[index];
                stack.push(current.children[key]);
                index++;
                break;
            }
            if(key[0] === '*') {
                params[key.slice(1)] = parts.slice(index).join("/");
                return [current.children[key], params];
            }
        }
    }
    return [];
}

export { searchNode, insertNode, Node };