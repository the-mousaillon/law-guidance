
/* eslint-disable */

"use client";

import { parseDagAndLeafsFromText, dumpDag, dagToEcharts, testParseTextToDAG } from "../lib/graph"
import ReactECharts from 'echarts-for-react';
import React, { use, useEffect, useState } from "react";

import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { RcFile } from "antd/es/upload";

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


export function GraphUploader(props: {register: any}) {
  let [text, setText] = useState([] as any)
  let subsett = (s: any) => setText([...text, s])
  useEffect(() => {
    if (text.length > 0) {
      let t0 = text[0]
      let dag = parseDagAndLeafsFromText(t0)
      if (props.register) {
        props.register(dag)
      }
      console.log("DAG: ", dag)
    }
    }, [text])
  return (
        <Uploader cb={subsett} />
  );
}
