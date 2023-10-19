type Node = {
    children?: Node[],
    path: string,
    wildChild: Boolean
}

function insertChild(node: Node, fullPath: string) {
    const sourcePath = fullPath.split('/')
}