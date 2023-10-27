import { readTxtContent } from '@/utils/read-file';
import { Upload, UploadFile, UploadProps, message } from 'antd'
import React, { CSSProperties, useState } from 'react'
import { InboxOutlined } from '@ant-design/icons';
import { TableDataType } from '../text-to-audio/batch-paperwork';
import { FileTypes } from '@/interface';

type UploadFilePagePropsType = {
    style?: CSSProperties
    maxFile?: number
    tableData: TableDataType[],
    setTableData: (data: TableDataType[]) => void;
    fileType?: FileTypes
}

function UploadFilePage(props: UploadFilePagePropsType) {
    const MAXFILE = props.maxFile ?? 5;
    const [fileList, setFileList] = useState<UploadFile[]>()
    const FILETYPE = props.fileType ?? FileTypes.TEXT;

    const beforeUpload:UploadProps["beforeUpload"] = (file, fileList) => {
        return false
    }

    // 上传文件变化
    const fileChange: UploadProps["onChange"] = async (info) => {
        let dataList: TableDataType[] = [];
        for (let file of info.fileList) {
            const text = (FILETYPE === FileTypes.TEXT) && await readTxtContent(file.originFileObj as unknown as File);
            (file as any)["content"] = text || '';
            dataList.push({ ...file, id: file.uid, fileName: file.name, blobUrl: undefined, status: "active" } as unknown as TableDataType)
        }
        props.setTableData(dataList)
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