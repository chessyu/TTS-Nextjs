import { Button, Popconfirm, Segmented, SegmentedProps, Space, Table, Upload, UploadProps, message } from 'antd'
import React, { useRef, useState } from 'react'
import { InboxOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import styles from './index.module.css'
import { extractTabs } from '@/constant';
import { FileTypes } from '@/interface/index';
import UploadFilePage from '../common/upload-file-page';
import { TableDataType } from '../text-to-audio/batch-paperwork';
import { checkAndAddWaveFmtHeader, getFileHeader } from '@/utils/common-methods';
import { useVideoToText } from '@/hooks/use-video-to-text';


// 文案提取
function Extract(props: any) {
  const filesRef = useRef(0)
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [segmented, setSegmented] = useState("image")
  const [fileType, setFileType] = useState(FileTypes.IMAGE)
  const [selectedRow, setSelectedRow] = useState<TableDataType[]>([]);
  const { videoRecognizer } = useVideoToText()

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
      dataIndex: 'content',
      key: 'content',
      align: "center",
      render: () => {
        return <></>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <a>查看</a>
          <DeleteOutlined style={{ cursor: "pointer", color: 'red' }} onClick={() => deleteRecore(record)} />
        </Space>
      ),
    },
  ];

  // 删除某行
  const deleteRecore = (record: TableDataType) => {
    setTableData((data) => data.filter(item => item.id !== record.id))
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: TableDataType[]) => {
    setSelectedRow(newSelectedRow);
  };

  // 切换类型
  const segmentChange: SegmentedProps["onChange"] = (value) => {
    setSegmented(value as unknown as FileTypes)
    if (value === "image") setFileType(FileTypes.IMAGE);
    if (value === "audio") setFileType(FileTypes.AUDIO);
    if (value === "video") setFileType(FileTypes.VIDEO);
  }

  // 清空列表
  const tableClear = () => {
    setTableData([]);
    filesRef.current = 0;
  }


  // 批量识别方案
  const convertAll = async () => {
    // tableData.forEach(item => readImageToText(item as unknown as File))
    if(fileType === FileTypes.AUDIO) convertAudio()
    if(fileType === FileTypes.VIDEO) convertAudio()
  }

  const downLoadAll = async () => {
    // fetch("/api/test", {method: "POST"}).then((data) => {
    //   console.log(data)
    // })
  }

  /** 提取音频中的文案 */
  const convertAudio = () => {
    selectedRow.forEach(async item => {
      // const steam = await handleFileToStream((item as any).originFileObj);

      // console.log("befor", (item as any).originFileObj)
      const file = await checkAndAddWaveFmtHeader((item as any).originFileObj as File );
      // console.log("after", file)

      // videoRecognizer(file);
      // videoRecognizer((item as any).originFileObj);
      // console.log("RR", file)

      const aa = await getFileHeader((item as any).originFileObj)
      console.log("RRRRRRRRR", aa )
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
            <UploadFilePage style={{ height: "100%" }} fileType={fileType} tableData={tableData} setTableData={(data) => setTableData(data)} />
          </div>
        )
      }

      {
        !!tableData.length && (<>
          <Space style={{ marginBottom: 5 }}>
            <Button type="primary" children="批量识别" size="small" disabled={!selectedRow.length} onClick={convertAll} />
            <Popconfirm
              title="清空提示"
              description="你确定要清空列表吗?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={tableClear}
            >
              <Button children="清空" size="small" disabled={!selectedRow.length} />
            </Popconfirm>
            <Button children="批量下载" size="small" disabled={!selectedRow.length} onClick={downLoadAll} />
          </Space>
          <Table columns={columns} dataSource={tableData} rowKey={"id"} pagination={false}
            rowSelection={{
              selectedRowKeys: selectedRow.map(item => item.id),
              onChange: onSelectChange,
            }}
            size="small"
          />
          {tableData.length < 5 && <UploadFilePage fileType={fileType} tableData={tableData} setTableData={(data) => setTableData(data)} />}
        </>)
      }
    </div>
  )
}

export default Extract