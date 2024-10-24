/* eslint-disable */

"use client";

import { parseDAG, dumpDag, dagToEcharts, testParseTextToDAG, dumpDagAndLeafs } from "../lib/graph"
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from "react";

import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { RcFile } from "antd/es/upload";
import { GraphUploader } from "../components/graph_uploader"

const { Dragger } = Upload;

async function readFile(file: RcFile, cb: any) {
  console.log("GROS CB: ", cb)
  const fb = await file.arrayBuffer();
  const decoder = new TextDecoder();
  const str = decoder.decode(fb)
  console.log("File: ", str)
  cb.cb(str)
  return str
}

function props(cb: any): UploadProps {
    return {
    name: 'file',
    multiple: true,
    action: (f) => readFile(f, cb),
    showUploadList: {
      showRemoveIcon: true
    },

    onChange(info) {
      const { status } = info.file;
      console.log("info: ", info)
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    }
  }
}

const Uploader = (cb: any) => (
    <Dragger {...props(cb)}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload</p>
    <p className="ant-upload-hint">
      Support for a single or bulk upload. Strictly prohibited from uploading company data or other
      banned files.
    </p>
  </Dragger>
)
export default function Explorer() {
  let [text, setText] = useState([] as any)
  let [dag, setDag] = useState(null)
  let echart_dag = []
    if (dag) {
      let d_str = dumpDagAndLeafs(dag)
      console.log("DAG DUMP")
      console.log(d_str)
      echart_dag = dagToEcharts(dag)
    }
  let option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',
          roam: true,
          data: [echart_dag],
          top: '1%',
          left: '20%',
          bottom: '1%',
          right: '20%',
          symbolSize: 7,
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },
          // emphasis: {
          //   focus: 'descendant'
          // },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
  }
  console.log("ALL TEXT: ", text)
  return (
    <main style={
      {
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white'
      }
    }>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%"}}>
        <div   style={{
          height: '200px',
          paddingLeft: "100px",
          paddingRight: "100px",
        }}>
          <GraphUploader register={setDag} />
        </div>
        <ReactECharts option={option} style={
          {
            width: '100%',
            height: '100%'
          }
        }/>
      </div>
    </main>
  );
}
