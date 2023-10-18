import { Col, Dropdown, Form, Input, MenuProps, Row, Segmented, Space } from 'antd'
import React, { useMemo, useRef, useState } from 'react'
import styles from './index.module.css'
import AudioControl from '../../common/audio-control'
import { SegmentedProps } from 'antd/lib'
import { DownOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { TextAreaRef } from 'antd/es/input/TextArea'
import { useTextToSpeechConfig } from '@/store/text-to-speech-config'

// 文本
function Paperwork(props:any) {
  const inputTextAreaRef = useRef<TextAreaRef>(null);
  // const [textAreaText, setTextAreaText] = useState('');
  const textToSpeechConfig = useTextToSpeechConfig();
  const { text,isSSML, blobUrl, update } = textToSpeechConfig;
  const cursorRef = useRef({
    start: 0,
    end: 0
  })
  console.log("KKKKKKKKKK", textToSpeechConfig)

  const segmentOption: SegmentedProps["options"] = useMemo(() => [
    { label: "自述", value: 'text', icon: "" },
    { label: "场景对话", value: 'ssml', icon: "" },
  ], [])

  const dropdownItems: MenuProps['items'] = useMemo(() => [
    { type: 'group', label: "插入停顿标签" },
    { label: "0.4秒", key: 0.4 },
    { label: "0.5秒", key: 0.5 },
    { label: "0.8秒", key: 0.8 },
    { label: "1.0秒", key: 1.0 },
    { type: 'divider' },
    { label: "2秒", key: 2 },
    { label: "3秒", key: 3 },
    { label: "5秒", key: 5 },
    { type: 'divider' },
    { label: "0.05秒(紧凑间隔)", key: 0.05 },
    { label: "0.02秒(紧凑间隔)", key: 0.02 },
    { type: 'divider' },
  ], [])

  const dropSelect: MenuProps["onClick"] = ({ item, key }) => {
    const newText = text.substring(0, cursorRef.current.start) + `((⏰=${+key * 1000}))` + text.substring(cursorRef.current.end)
    textToSpeechConfig.update((config) => config.text = newText)
  }

  // 取光标位置
  const handleRecordCursorPosition = () => {
    if (inputTextAreaRef.current?.resizableTextArea?.textArea.selectionStart) {
      cursorRef.current.start = inputTextAreaRef.current?.resizableTextArea?.textArea.selectionStart;
    }
    if (inputTextAreaRef.current?.resizableTextArea?.textArea.selectionEnd) {
      cursorRef.current.end = inputTextAreaRef.current?.resizableTextArea?.textArea.selectionEnd;
    }
  }

  // 切换类型
  const segmentChange: SegmentedProps["onChange"] = (value) => {
    update((config) => config.isSSML = value as string)
  }

  /** 文本内容变更 */
  const textChange = (value: string) => {
    update((config) => config.text = value)
  }

  return (
    <div className={styles['text-sty']}>
      <Row>
        <Col span={12}>
          <Segmented size="small" value={isSSML} options={segmentOption} onChange={segmentChange} />
        </Col>
        {
          !(isSSML === "text") && (
            <Col span={12} style={{ textAlign: "right" }}>
              <Dropdown menu={{ items: dropdownItems, onClick: dropSelect }} trigger={['click']} className={styles.dropdownSty} >
                <Space>
                  <FieldTimeOutlined />
                  插入停顿
                  <DownOutlined />
                </Space>
              </Dropdown>
            </Col>
          )
        }

      </Row>
      <Input.TextArea className={styles["textarea-sty"]}
        placeholder='请输入配音文案...'
        ref={inputTextAreaRef}
        onBlur={handleRecordCursorPosition}
        allowClear
        value={text}
        showCount
        onChange={(e) => textChange(e.target.value)}
      />
      <div className={styles["audio-payer"]}>
        <AudioControl src={ blobUrl } />
      </div>
    </div >

  )
}

export default Paperwork