import { readTxtContent } from '@/utils/read-file';
import { Upload, UploadFile, UploadProps, message } from 'antd'
import React, { CSSProperties, useState } from 'react'
import { InboxOutlined } from '@ant-design/icons';
import { FileTypes } from '@/interface';

type BaseAttribute = {
    id: string;
    fileName: string;
    blobUrl?: string
}

type UploadFilePagePropsType<T> = {
    style?: CSSProperties
    maxFile?: number
    tableData: T[],
    setTableData: (data: T[]) => void;
    fileType?: string
}

function UploadFilePage<T extends BaseAttribute>(props: UploadFilePagePropsType<T>) {
    const MAXFILE = props.maxFile ?? 5;
    const [fileList, setFileList] = useState<UploadFile[]>()
    const FILETYPE = props.fileType ?? FileTypes.TEXT;

    const beforeUpload:UploadProps["beforeUpload"] = (file, fileList) => {
        return false
    }

    // 上传文件变化
    const fileChange: UploadProps["onChange"] = async (info) => {
        let dataList: T[] = [];
        for (let file of info.fileList) {
            const text = (FILETYPE === FileTypes.TEXT) && await readTxtContent(file.originFileObj as unknown as File);
            (file as any)["content"] = text || '';
            let covBlobUrl = undefined;
            // 判断文件类型，File 转 BlobUrl 
            if(FILETYPE?.split(',').includes("audio/wav") || FILETYPE?.split(',').includes("audio/mp3")){
                covBlobUrl = URL.createObjectURL(file.originFileObj as File)
            }
            dataList.push({ ...file, id: file.uid, fileName: file.name, blobUrl: covBlobUrl, status: "active" } as unknown as T)
        }
        props.tableData.forEach(item => {
            dataList.forEach(keys => {
                if(item.id !== keys.id && item.blobUrl ){
                    URL.revokeObjectURL(item.blobUrl)
                }
            })
        })

        props.setTableData(dataList);
        setFileList(info.fileList)
    }

    // 文件拖拽
    const fileDrop: UploadProps["onDrop"] = (e: any) => {
        for (var item of e.dataTransfer.files) {
            if (item.type !== FILETYPE) {
                message.error("仅支持上传 "+ FILETYPE +" 文件")
            }
        }
    }

    return (
        <div style={props?.style}>
            <Upload.Dragger
                accept={FILETYPE}
                beforeUpload={beforeUpload}
                multiple={true}
                showUploadList={false}
                onChange={fileChange}
                onDrop={fileDrop}
                fileList={fileList}
                maxCount={MAXFILE}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">单击或拖拽文件进行上传</p>
                <p className="ant-upload-hint">
                    {`仅支持上传 ${FILETYPE} 文件，最多可上传 ${MAXFILE} 个文件`}
                </p>
            </Upload.Dragger>
        </div>
    )
}

export default UploadFilePage