/* eslint-disable */


import { NextRequest, NextResponse } from "next/server"
import { D_TEXT, parseDagAndLeafsFromText } from "../../lib/graph"

const DagStore: any = {
    dag: D_TEXT
}

export async function POST(request: NextRequest){
    if (false && (process.env.MODIF_KEY || "1234") !== request.headers.get("MODIF_KEY")){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }
    else {
        let dag = await request.json()
        try {
            parseDagAndLeafsFromText(dag.dag)
        }
        catch (e) {
            return NextResponse.json({message: "Error parsing DAG"}, {status: 400})
        }
        DagStore["dag"] = dag.dag
    } 
    return NextResponse.json({message: "Success"})
}

export async function GET() {
    let dag = DagStore.dag
    let res = {
        dag: dag
    }
    return NextResponse.json(res)
}