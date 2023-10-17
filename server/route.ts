type HttpType = 'POST' | 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

type RouteWithHandler = {
    type: HttpType,
    regex: RegExp,
    handler: (req: Request) => Response
}
//路由应当支持封闭运算（包含）
export class RouteClassic {

}
//前缀树
type TireTree = {

}