import { Connection } from "@solana/web3.js"

export function assert(
    condition: unknown,
    message: string = "",
): asserts condition {
    if (!condition) throw new Error(message)
}

export function addRpcEndpoint(res: any, connection: Connection): Object {
    res["rpcEndpoint"] = connection.rpcEndpoint
    return res
}

export function extractStringParameter(v: string | string[]) {
    if (Array.isArray(v)) {
        return v[0]
    }
    else {
        return v
    }
}
