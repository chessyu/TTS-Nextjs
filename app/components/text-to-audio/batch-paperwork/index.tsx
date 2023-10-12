import { Button, Popconfirm, Space, Table, Upload, UploadProps, message } from 'antd'
import React, { useRef, useState } from 'react'
import { InboxOutlined, CloudDownloadOutlined, QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { readTxtContent } from '@/utils/read-file';
import AudioControl from '../../common/audio-control';


type TableDataType = {
  id: string;
  fileName: string;
  audio: string;

}

function BatchPaperwork(props:any) {
  const MAXFILE = 5;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const filesRef = useRef(0)

  const columns: ColumnsType<TableDataType> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '音频',
      dataIndex: 'audio',
      key: 'audio',
      align: "center",
      render: () => {
        return <AudioControl style={{ height: 30 }} />
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Space>
          <CloudDownloadOutlined style={{ cursor: "pointer" }} />
          <DeleteOutlined style={{ cursor: "pointer" }} onClick={ () => deleteRecore(record) } />
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

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
      const text = await readTxtContent(file.originFileObj as unknown as File);
      (file as any)["content"] = text;
      dataList.push({ ...file, id: file.uid, fileName: file.name, audio: undefined })
    }
    setTableData(dataList as unknown as TableDataType[])
  }

  // fileDrop
  const fileDrop: UploadProps["onDrop"] = (e: any) => {
    for (var item of e.dataTransfer.files) {
      if (item.type !== "text/plain") {
        message.error("仅支持上传 .txt 文件")
      }
    }
  }

  const deleteRecore = (record:TableDataType) => {
    setTableData((data) => data.filter(item => item.id !== record.id))
  }

  return (
    <div style={{ height: '100%', paddingBottom: 15 }}>
      {
        !tableData.length && (
          <Upload.Dragger
            accept={'.txt'}
            beforeUpload={() => false}
            multiple={true}
            showUploadList={false}
            onChange={fileChange}
            onDrop={fileDrop}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">单击或拖拽文件进行上传</p>
            <p className="ant-upload-hint">
              {`仅支持上传 .txt 文件，最多可上传 ${MAXFILE} 个文件`}
            </p>
          </Upload.Dragger>
        )
      }

      {
        !!tableData.length && (<>
          <Space style={{ marginBottom: 5 }}>
            <Button type="primary" children="转换" size="small" />
            <Popconfirm
              title="清空提示"
              description="你确定要清空列表吗?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={tableClear}
            >
              <Button children="清空" size="small" />
            </Popconfirm>
            <Button children="批量下载" size="small" />
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
    </div >
  )
}

export default BatchPaperwork