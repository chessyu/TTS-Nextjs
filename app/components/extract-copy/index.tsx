import { Button, Modal, Popconfirm, Progress, SegmentedProps, Space, Table, Upload, UploadProps, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { InboxOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import styles from './index.module.css'
import { FileTypes } from '@/interface/index';
import UploadFilePage from '../common/upload-file-page';
import { TableDataType } from '../text-to-audio/batch-paperwork';
import { checkAndAddWaveFmtHeader, getFileHeader } from '@/utils/common-methods';
import { useVideoToText } from '@/hooks/use-video-to-text';
import { useTextToSpeechConfig } from '@/store/text-to-speech-config';
import AudioControl from '../common/audio-control';


// 文案提取
function Extract(props: any) {
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [selectedRow, setSelectedRow] = useState<TableDataType[]>([]);
  const { videoRecognizer } = useVideoToText();
  const [progress, setProgress] = useState<any>({})
  const { update } = useTextToSpeechConfig();
  const [modal, contextHolder] = Modal.useModal();

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
      render: (_, record) => {
        return (<>
          {record.blobUrl && record.blobUrl}
          {!record.blobUrl && <Progress size="small" percent={selectedRow.filter(keys => keys.id === record.id).length && progress[record.id]} status={record.status ?? "active"} />}
        </>)
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <a onClick={() => review(record)}>查看</a>
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
    setProgress({});
  };

  // 清空列表
  const tableClear = () => {
    setTableData([]);
    setSelectedRow([]);
    setProgress({});
  }

  // 查看
  const review = (record: TableDataType) => {
    const HookModal = modal.confirm({
      title: '查看文本',
      maskClosable: false,
      width: 550,
      icon: ' ',
      content: record.blobUrl,
      footer: (<Button style={{ float:"right"}} children="确认" type="primary" onClick={() => {
        HookModal.destroy();
      }} />)
    });
  }

  /** 下载所有 */
  const downLoadAll = async () => {
    // fetch("/api/test", {method: "POST"}).then((data) => {
    //   console.log(data)
    // })
  }

  /** 提取音频中的文案 */
  const convertAudio = async () => {
    await new Promise(resolve => {
      selectedRow.forEach(item => {
        const interval = setInterval(() => {
          setProgress((prevProgress: any) => ({
            ...prevProgress,
            [item.id]: (parseInt(prevProgress[item.id]) || 0) + Math.floor(Math.random() * 5),
            [item.id + "_timer"]: interval
          }));
        }, 500);
      })
      resolve(undefined);
    })

    for (const item of selectedRow) {
      const file = await checkAndAddWaveFmtHeader((item as any).originFileObj as File);
      const result = await videoRecognizer(file);
      console.log("RTTREW", result)
      if (result.status === 200) {
        message.success(item.fileName + "文字识别成功!");
        await asyncWriteTableData(item.id, { blobUrl: result.data, status: "success" })
        setProgress((prevProgress: any) => ({
          ...prevProgress,
          [item.id]: 100,
        }));
      } else {
        await asyncWriteTableData(item.id, { status: 'exception' })
        setProgress((prevProgress: any) => ({
          ...prevProgress,
          [item.id]: 100,
        }));
        message.error(item.fileName + ' ' + result.message);
      }
    }

    // selectedRow.forEach(async item => {
    // const steam = await handleFileToStream((item as any).originFileObj);

    // console.log("befor", (item as any).originFileObj)
    // const bb = await getFileHeader((item as any).originFileObj as File)
    // console.log("RRRRRRRRR", bb)

    // console.log("after", file)
    // const aa = await getFileHeader(file)
    // console.log("RRRRRRRRR", aa)

    // videoRecognizer((item as any).originFileObj);
    // console.log("RR", file)

    // const reader = new FileReader();
    // reader.onload = function(e:any) {
    //   const blob = new Blob([e.target.result], { type: 'audio/wav' }); // 将e.target.result转换为Blob对象
    //   const url = URL.createObjectURL(blob); // 生成URL
    //   console.log("RRRRRRRR", url)
    //   update(config => config.blobUrl = url)
    // };
    // reader.readAsArrayBuffer(file); // 读取文件内容

    // })
  }

  /** 异步修改列表数据 */
  const asyncWriteTableData = async (id: string, writeobj: any) => {
    await new Promise(resolve =>
      setTableData(table => {
        return table.map((keys) =>
          keys.id === id ? { ...keys, ...writeobj } : keys
          , resolve(undefined))
      })
    )
  }

  useEffect(() => {
    selectedRow.forEach(item => {
      if ((progress[item.id]) >= 100) {
        clearInterval(progress[item.id+"_timer"]);
        setSelectedRow(selectedRow => selectedRow.filter(keys => keys.id !== item.id));
      }
    })
  },[progress])

  return (
    <div className={styles.extract} >
      {
        !tableData.length && (
          <div className={styles.uploadBox}>
            <UploadFilePage style={{ height: "100%" }} fileType={'video/wav video/mp3 audio/mp4'} tableData={tableData} setTableData={(data) => setTableData(data)} />
          </div>
        )
      }

      {
        !!tableData.length && (<>
          <Space style={{ marginBottom: 5 }}>
            <Button type="primary" children="批量识别" size="small" disabled={!selectedRow.length} onClick={convertAudio} />
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
          {tableData.length < 5 && <UploadFilePage fileType={'video/wav video/mp3 audio/mp4'} tableData={tableData} setTableData={(data) => setTableData(data)} />}
        </>)
      }

      {contextHolder}
    </div>
  )
}

export default Extract