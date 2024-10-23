/* eslint-disable */


import { NextRequest, NextResponse } from "next/server"
import { D_TEXT, parseDagAndLeafsFromText } from "../../lib/graph"
import { put, list } from '@vercel/blob';

const DagStore: any = {
    dag: null
}

const DAG_BLOB_PATH = "/dags/dag.txt"

export async function POST(request: NextRequest){
    if (false && (process.env.MODIF_KEY || "1234") !== request.headers.get("MODIF_KEY")){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }
    else {
        let dag = await request.json()
        try {
            parseDagAndLeafsFromText(dag.dag)
            const blob = await put(DAG_BLOB_PATH, dag.dag, { access: 'public', addRandomSuffix: false});
            DagStore.dag = dag.dag
            return NextResponse.json({message: "Success"})
        }
        catch (e) {
            return NextResponse.json({message: "Error parsing DAG"}, {status: 400})
        }
    } 
}

export async function GET() {
    let dag = DagStore.dag
    if (!dag) {
        try {
            let blobs = await list({
                prefix: 'dags'
            })
            console.log("blobs: ", blobs)
            console.log("BLOB 0: ", blobs.blobs[0])
            let new_dag = await (await fetch(blobs.blobs[0].url, {method: "GET"})).text()
            DagStore.dag = new_dag
        }
        catch (e) {
            return NextResponse.json({message: "Error fetching DAG"}, {status: 400})
        }
    }
    let res = {
        dag: dag
    }
    return NextResponse.json(res)
}