import { Button, Popconfirm, Progress, Space, Table, Upload, UploadProps, message } from 'antd'
import React, { useState } from 'react'
import { InboxOutlined, CloudDownloadOutlined, QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { readTxtContent } from '@/utils/read-file';
import AudioControl from '../../common/audio-control';
import { downloadAudioFile, generateRandomProgress, zipFileByBlobUrl } from '@/utils/common-methods';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useTextToSpeechConfig } from '@/store/text-to-speech-config';

type TableDataType = {
  id: string;
  fileName: string;
  blobUrl: string;
  content: string;
  status: "active" | "normal" | "exception" | "success"
}

function BatchPaperwork(props: any) {
  const MAXFILE = 5;
  const [selectedRow, setSelectedRow] = useState<TableDataType[]>([]);
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [progress, setProgress] = useState(0)
  const { plainText } = useTextToSpeech()
  const { getSpeechParams, update, audioConfig } = useTextToSpeechConfig();

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
      dataIndex: 'blobUrl',
      key: 'blobUrl',
      align: "center",
      render: (_, record) => {
        return (<>
          {record.blobUrl && <AudioControl showDownBtn={false} style={{ height: 30 }} src={record.blobUrl} autoPlay={false} />}
          {!record.blobUrl && <Progress size="small" percent={selectedRow.filter(keys => keys.id === record.id).length && progress} status={record.status ?? 'active'} />}

        </>)
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Space>
          <CloudDownloadOutlined style={{ cursor: record.blobUrl ? "pointer" : "not-allowed", color: record.blobUrl ? 'green' : '#717171' }}
            onClick={() => record.blobUrl && downloadAudioFile(record.blobUrl, record.fileName.replace(/\.txt/, audioConfig.download))} />
          <DeleteOutlined style={{ cursor: "pointer", color: 'red' }} onClick={() => deleteRecore(record)} />
        </Space>
      ),
    },
  ];

  // 列表勾选回调
  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: TableDataType[]) => {
    setSelectedRow(newSelectedRow);
    setProgress(0);
  };

  // 清空列表
  const tableClear = () => {
    setTableData([]);
    setSelectedRow([]);
    setProgress(0);
  }

  // 上传文件变化
  const fileChange: UploadProps["onChange"] = async (info) => {
    if (MAXFILE < (info.fileList.length + tableData.length)) {
      message.error(`最多上传 ${MAXFILE} 个文件`);
      return
    };
    let dataList = [];
    for (let file of info.fileList) {
      const text = await readTxtContent(file.originFileObj as unknown as File);
      (file as any)["content"] = text;
      dataList.push({ ...file, id: file.uid, fileName: file.name, blobUrl: undefined, status: "active" })
    }
    setTableData(dataList as unknown as TableDataType[])

  }

  // 文件拖拽
  const fileDrop: UploadProps["onDrop"] = (e: any) => {
    for (var item of e.dataTransfer.files) {
      if (item.type !== "text/plain") {
        message.error("仅支持上传 .txt 文件")
      }
    }
  }

  // 删除某行
  const deleteRecore = (record: TableDataType) => {
    setTableData((data) => data.filter(item => item.id !== record.id))
  }

  /** 生成配音 */
  const generate = async () => {
    const timer = generateRandomProgress(setProgress)
    for (const item of selectedRow) {
      const result = await plainText({ ...getSpeechParams(), text: item.content });
      if (result.status === 200) {
        message.success(item.fileName + "生成配音成功!");
        await asyncWriteTableData(item.id, { blobUrl: result.data, status: "success" })
      } else {
        await asyncWriteTableData(item.id, { status: 'exception' })
        message.error(item.fileName + ' ' + result.message.privErrorDetails);
      }
      clearInterval(timer)
    }
  }

  /** 异步修改列表数据 */
  const asyncWriteTableData = async (id: string, writeobj: any) => {
    await new Promise(resolve =>
      setTableData(table => {
        setSelectedRow([]);
        return table.map((keys) =>
          keys.id === id ? { ...keys, ...writeobj } : keys
          , resolve(undefined))
      })
    )
  }

  // 批量下载
  const downloadAll = async () => {
    const canDownload = selectedRow.filter(keys => keys.blobUrl)
    if(!canDownload.length) {
      message.error("请勾选已配音成功的选项");
      return false;
    }
    await zipFileByBlobUrl(canDownload, audioConfig.download);
    message.success(`下载成功条数：${canDownload.length}。${canDownload.length !== selectedRow.length ? '已过滤掉未配音的数据': ''}`)
    setSelectedRow([])
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
            <Button type="primary" children="批量配音" size="small" disabled={!selectedRow.length} onClick={generate} />
            <Button children="批量下载" size="small" disabled={!selectedRow.length} onClick={downloadAll} />
            <Popconfirm
              title="清空提示"
              description="你确定要清空列表吗?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={tableClear}
            >
              <Button children="清空" size="small" disabled={!selectedRow.length} />
            </Popconfirm>
          </Space>
          <Table columns={columns} dataSource={tableData} rowKey={"id"} pagination={false}
            rowSelection={{
              selectedRowKeys: selectedRow.map(item => item.id),
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