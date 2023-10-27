import { Col, Dropdown, Form, Input, MenuProps, Row, Segmented, Space } from 'antd'
import React, { useMemo, useRef, useState } from 'react'
import styles from './index.module.css'
import AudioControl from '../../common/audio-control'
import { SegmentedProps } from 'antd/lib'
import { DownOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { TextAreaRef } from 'antd/es/input/TextArea'
import { useTextToSpeechConfig } from '@/store/text-to-speech-config'
import { SSMLTYPE } from '@/interface'

// 文本
function Paperwork(props: any) {
  const inputTextAreaRef = useRef<TextAreaRef>(null);
  const textToSpeechConfig = useTextToSpeechConfig();
  const { text, isSSML, blobUrl, update } = textToSpeechConfig;
  const cursorRef = useRef({
    start: 0,
    end: 0
  })

  const segmentOption: SegmentedProps["options"] = useMemo(() => [
    { label: "自述", value: SSMLTYPE.TEXT, icon: "" },
    { label: "场景对话", value: SSMLTYPE.SSML, icon: "" },
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
    update((config) => config.isSSML = value as SSMLTYPE)
  }

  /** 文本内容变更 */
  const textChange = (value: string) => {
    update((config) => config.text = value)
  }

  const audioError = () => {
    console.log('Audio 加载失败')
    update(config => config.blobUrl = undefined);
  }

  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    let paste = (event.clipboardData || window.Clipboard).getData("text");
    paste = paste.toUpperCase();

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    selection.collapseToEnd();
  }

  return (
    <div className={styles['text-sty']}>
      <Row>
        <Col span={12}>
          <Segmented size="small" value={isSSML} options={segmentOption} onChange={segmentChange} />
        </Col>
        {
          !(isSSML === SSMLTYPE.TEXT) && (
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
      {
        isSSML === SSMLTYPE.TEXT && (
          <Input.TextArea className={`${styles["textarea-sty"]} flex-1`}
            style={{ resize: "none" }}
            placeholder='请输入配音文案...'
            ref={inputTextAreaRef}
            onBlur={handleRecordCursorPosition}
            allowClear
            value={text}
            showCount
            onChange={(e) => textChange(e.target.value)}
          />
        )
      }
      {
        isSSML === SSMLTYPE.SSML && (
          <div onPaste={(e) => onPaste(e)} className={`${styles["configbox"]} flex-1`} tabIndex={1} >
            
          </div>
        )
      }

      <div className={styles["audio-payer"]}>
        <AudioControl src={blobUrl}  audioError={audioError} fileName={text.substring(0,8)+'... '} />
      </div>
    </div >

  )
}

export default Paperwork