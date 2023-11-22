import { Col, Dropdown, Input, MenuProps, Row, Segmented, Space } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import styles from './index.module.css'
import AudioControl from '../../common/audio-control'
import { SegmentedProps } from 'antd/lib'
import { DownOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { TextAreaRef } from 'antd/es/input/TextArea'
import { useTextToSpeechConfig } from '@/store/text-to-speech-config'
import { AudioBtnConfig, SSMLTYPE, SSMLTextType, SpeechConfigType } from '@/interface'
import AudioConfig from '../audio-config'
import SsmlConfigPage, { SsmlConfigRef } from './ssml-config'

// 文本
function Paperwork(props: any) {
  const inputTextAreaRef = useRef<TextAreaRef>(null);
  const textToSpeechConfig = useTextToSpeechConfig();
  const ssmlRef = useRef<SsmlConfigRef>(null)
  const { text, isSSML, blobUrl, update } = textToSpeechConfig;
  const [sceneTalkConfig, setSceneTalkConfig] = useState<SSMLTextType[]>()
  const [saveItemConfig, setSaveItemConfig] = useState<SSMLTextType[]>()

  const segmentOption: SegmentedProps["options"] = useMemo(() => [
    { label: "自述", value: SSMLTYPE.TEXT, icon: "" },
    // { label: "场景对话", value: SSMLTYPE.SSML, icon: "" },
  ], [])


  // 切换类型
  const segmentChange: SegmentedProps["onChange"] = (value) => {
    update((config) => {
      config.isSSML = value as SSMLTYPE;
      if (value === SSMLTYPE.TEXT) {
        config.text = ssmlRef.current?.getInnerText() || ""
      }
    })
    setSceneTalkConfig(undefined);
    setSaveItemConfig(undefined);
  }

  /** 文本内容变更 */
  const textChange = (value: string) => {
    update((config) => config.text = value)
  }

  /** 音频加载失败回调 */
  const audioError = () => {
    console.log('Audio 加载失败')
    update(config => config.blobUrl = undefined);
  }

  // 配置语音相关信息
  const setItemConfigFn = useCallback((config: SSMLTextType[]) => {
    setSceneTalkConfig(config)
  },[saveItemConfig])

  const configCb = (data: Partial<SpeechConfigType & SSMLTextType>) => {
    const configList = sceneTalkConfig?.map(keys => Object.assign(keys, data))
    setSaveItemConfig(configList);
    setSceneTalkConfig(undefined)
  }

  return (
    <div className={styles.continar} >
      <div className={styles['text-sty']}>
        <Row>
          <Col span={12}>
            <Segmented size="small" value={isSSML} options={segmentOption} onChange={segmentChange} />
          </Col>
          {/* {
            !(isSSML === SSMLTYPE.TEXT) && (
              <Col span={12} style={{ textAlign: "right" }}>

              </Col>
            )
          } */}

        </Row>
        {
          isSSML === SSMLTYPE.TEXT && (
            <Input.TextArea className={`${styles["textarea-sty"]} flex-1`}
              spellCheck={false}
              style={{ resize: "none" }}
              placeholder='请输入配音文案...'
              maxLength={20000}
              ref={inputTextAreaRef}
              allowClear
              value={text}
              showCount
              onChange={(e) => textChange(e.target.value)}
            />
          )
        }
        {
          isSSML === SSMLTYPE.SSML && (
            <SsmlConfigPage ref={ssmlRef} setItemConfig={setItemConfigFn} saveItemConfig={saveItemConfig} />
          )
        }

        <div className={styles["audio-payer"]}>
          <AudioControl src={blobUrl} audioError={audioError} fileName={text.substring(0, 8) + '... '} />
        </div>
      </div >
      <div className={styles.config}>
        <AudioConfig buttonType={ isSSML === SSMLTYPE.SSML ? AudioBtnConfig.SCENETALK : AudioBtnConfig.SYNTHESIS }  
          currentConfig={isSSML === SSMLTYPE.SSML ? sceneTalkConfig?.[0] : undefined}
          configCb={isSSML === SSMLTYPE.SSML ? configCb : undefined}
        />
      </div>
    </div>
  )
}

export default Paperwork