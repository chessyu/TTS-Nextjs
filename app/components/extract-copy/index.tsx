import { Button, Popconfirm, Segmented, SegmentedProps, Space, Table, Upload, UploadProps, message } from 'antd'
import React, { useRef, useState } from 'react'
import { InboxOutlined, CloudDownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import styles from './index.module.css'
import { extractTabs } from '@/constant';
import { FileTypes } from '@/interface/index';
import { readImageToText } from '@/utils/read-file';


type TableDataType = {
  id: string;
  fileName: string;
  audio: string;

}

// 文案提取
function Extract(props:any) {
  const MAXFILE = 5;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const filesRef = useRef(0)
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [segmented, setSegmented] = useState("image")
  const [fileType, setFileType] = useState(FileTypes.IMAGE)

  const columns: ColumnsType<TableDataType> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '文案',
      dataIndex: 'convert',
      key: 'convert',
      align: "center",
      render: () => {
        return <></>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <CloudDownloadOutlined style={{ cursor: "pointer" }} />
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 切换类型
  const segmentChange: SegmentedProps["onChange"] = (value) => {
    setSegmented(value as unknown as FileTypes)
    if (value === "image") setFileType(FileTypes.IMAGE);
    if (value === "audio") setFileType(FileTypes.AUDIO);
  }

  // 清空列表
  const tableClear = () => {
    setTableData([]);
    filesRef.current = 0;
  }

  // fileChange 
  const fileChange: UploadProps["onChange"] = async (info) => {
    filesRef.current++;
    if (filesRef.current !== info.fileList.length) {
      message.error(`最多上传 ${MAXFILE} 个文件`);
      return
    };

    let dataList = [];
    for (let file of info.fileList) {
      dataList.push({ ...file, id: file.uid, fileName: file.name, convert: undefined })
    }
    setTableData(dataList as unknown as TableDataType[])
  }

  // fileDrop
  const fileDrop: UploadProps["onDrop"] = (e: any) => {

  }

  // 批量识别方案
  const convertAll = async () => {
    tableData.forEach(item => readImageToText(item as unknown as File))
  }

  const downLoadAll = async () => {
    fetch("/api/test", {method: "POST"}).then((data) => {
      console.log(data)
    })
  }

  return (
    <div className={styles.extract} >
      {
        !tableData.length && (
          <div className={styles.uploadBox}>
            <div>
              <Segmented size="small" value={segmented} options={extractTabs} onChange={segmentChange} />
            </div>

            <Upload.Dragger
              accept={fileType}
              beforeUpload={() => false}
              multiple={true}
              maxCount={5}
              showUploadList={false}
              onChange={fileChange}
              onDrop={fileDrop}
              className={styles.uploader}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">单击或拖拽文件进行上传</p>
              <p className="ant-upload-hint">
                {`仅支持上传 ${fileType} 文件，最多可上传 ${MAXFILE} 个文件`}
              </p>
            </Upload.Dragger>
          </div>
        )
      }

      {
        !!tableData.length && (<>
          <Space style={{ marginBottom: 5 }}>
            <Button type="primary" children="转换" size="small" onClick={ convertAll } />
            <Popconfirm
              title="清空提示"
              description="你确定要清空列表吗?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={tableClear}
            >
              <Button children="清空" size="small" />
            </Popconfirm>
            <Button children="批量下载" size="small" onClick={ downLoadAll } />
          </Space>
          <Table columns={columns} dataSource={tableData} rowKey={"id"} pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            size="small"
          />
        </>)
      }
    </div>
  )
}

export default Extract