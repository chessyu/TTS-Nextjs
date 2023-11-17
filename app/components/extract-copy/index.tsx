import { Button, Col, Modal, Popconfirm, Progress, Row, SegmentedProps, Select, Space, Table, Upload, Form, message, Input } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { InboxOutlined, DeleteOutlined, QuestionCircleOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import styles from './index.module.css'
import UploadFilePage from '../common/upload-file-page';
import { checkAndAddWaveFmtHeader, getFileHeader } from '@/utils/common-methods';
import { useVideoToText } from '@/hooks/use-video-to-text';
import { useTextToSpeechConfig } from '@/store/text-to-speech-config';
import AudioControl from '../common/audio-control';
import { languages } from '@/store/voices';

type TableDataType = {
  id: string;
  fileName: string;
  blobUrl?: string;
  content: string;
  status: "active" | "normal" | "exception" | "success";
}

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
      title: '音频',
      dataIndex: 'content',
      key: 'content',
      align: "center",
      render: (_, record) => {
        return (<>
          {record.blobUrl && <AudioControl showDownBtn={false} style={{ height: 30 }} src={record.blobUrl} autoPlay={false} fileName={record.fileName} />}
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
    setTableData((data) => data.filter(item => {
      if (item.id === record.id) URL.revokeObjectURL(record.blobUrl!);
      return item.id !== record.id
    }))
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: TableDataType[]) => {
    setSelectedRow(newSelectedRow);
    setProgress({});
  };

  // 清空列表
  const tableClear = () => {
    tableData.forEach(item => {
      try { URL.revokeObjectURL(item.blobUrl!); } catch (error) { console.error('清空列表-删除URL失败: ', error) }
    })
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
      footer: (<Button style={{ float: "right" }} children="确认" type="primary" onClick={() => {
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
    // await new Promise(resolve => {
    //   selectedRow.forEach(item => {
    //     const interval = setInterval(() => {
    //       setProgress((prevProgress: any) => ({
    //         ...prevProgress,
    //         [item.id]: (parseInt(prevProgress[item.id]) || 0) + Math.floor(Math.random() * 5),
    //         [item.id + "_timer"]: interval
    //       }));
    //     }, 500);
    //   })
    //   resolve(undefined);
    // })

    for (const item of selectedRow) {
      // const bb = await getFileHeader((item as any).originFileObj as File)
      // console.log("RRRRRRRRR", bb)
      const file = await checkAndAddWaveFmtHeader((item as any).originFileObj as File);

      // const cc = await getFileHeader(file)
      // console.log("RRRRRRRRR", cc, file)

      const result = await videoRecognizer(file);


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

  /** 展开的配置 */
  const expandedRowRender = (record: TableDataType) => {
    return (
      <Row gutter={6} style={{ height: 150, overflow: 'hidden', }}>
        <Col span={12}>
          <div className={styles.console}>
            <div style={{ overflow: 'auto', height: 138 }}>

            </div>
          </div>
        </Col>
        <Col span={12}>
          <Row gutter={6}>
            <Form style={{ width: '100%' }} layout="inline" labelAlign="right" labelCol={{ span: 3 }} initialValues={{ fileName: "mta asdkwqer", language: ['zh-CN', 'en-US'] }} >
              <Col span={24}>
                <Form.Item name="fileName" label="文件名称" >
                  <Input readOnly bordered={false} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="language" label="识别语言" >
                  <Select options={languages} mode="tags" maxTagCount={2} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="phrases" label="短语列表" style={{ marginTop: 16 }} >
                  <Input.TextArea rows={2} style={{ resize: 'none' }} placeholder='提高语音识别的准确性。例如: 北京; 上海;' />
                </Form.Item>
              </Col>

            </Form>
          </Row>
        </Col>
      </Row>
    )
  }

  useEffect(() => {
    selectedRow.forEach(item => {
      if ((progress[item.id]) >= 100) {
        clearInterval(progress[item.id + "_timer"]);
        setSelectedRow(selectedRow => selectedRow.filter(keys => keys.id !== item.id));
      }
    })
  }, [progress])

  return (
    <div className={styles.extract} >
      {
        !tableData.length && (
          <div className={styles.uploadBox}>
            <UploadFilePage<TableDataType> style={{ height: "100%" }} fileType={'audio/wav,audio/mp3,video/mp4'} tableData={tableData} setTableData={(data) => setTableData(data)} />
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
            expandable={{
              rowExpandable: () => true,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <DownOutlined onClick={e => onExpand(record, e)} style={{ fontSize: 12 }} />
                ) : (
                  <RightOutlined onClick={e => onExpand(record, e)} style={{ fontSize: 12 }} />
                ),
              expandedRowRender: expandedRowRender
            }}
            size="small"
          />
          {tableData.length < 5 && <UploadFilePage<TableDataType> fileType={'audio/wav,audio/mp3,video/mp4'} tableData={tableData} setTableData={(data) => setTableData(data)} />}
        </>)
      }

      {contextHolder}
    </div>
  )
}

export default Extract