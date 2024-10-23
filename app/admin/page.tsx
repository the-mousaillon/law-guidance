/* eslint-disable */

"use client";

import React, { useState } from "react";
import { GraphUploader } from "../components/graph_uploader"
import { Button, Input, Space } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import { dumpDagAndLeafs } from "../lib/graph"


export default function Admin() {
    let [dag, setDag] = useState(null as any)
    let [psw, setPsw] = useState("")
    return (
        <main>
            <Space direction="vertical" size={"large"}>
                <GraphUploader register={setDag} />
                <Input placeholder="Enter the amin password here" onChange={(e) => setPsw(e.target.value)}/>
                <Button type="primary" shape="round" icon={<UploadOutlined />} onClick={(_) => {
                    fetch("/api/data", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            "MODIF_KEY": psw
                        },
                        body: JSON.stringify({dag: dumpDagAndLeafs(dag), password: psw})
                    }).then((res) => {
                        if (res.status === 200) {
                            alert("Data uploaded successfully")
                        } else {
                            alert("Error uploading data")
                        }
                    })
                }}>
                    Upload
                </Button>
            </Space>
        </main>
    )
}