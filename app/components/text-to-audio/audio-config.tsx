import { Button, Col, Dropdown, Input, InputNumber, MenuProps, Modal, Row, Select, SelectProps, Slider, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { Form } from 'antd';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages, voiceGroup, voiceStyle, voiceRole, outputFormatDes } from '@/store';
import { useSetState } from 'ahooks';
import { CustomConfigType, useTextToSpeechConfig } from '@/store/text-to-speech-config';
import { PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { AudioBtnConfig, SSMLTYPE, SSMLTextType, SpeechConfigType } from '@/interface';
import { randomStr } from '@/utils/common-methods';

type AudioConfigPropsType = {
  /** 是否展示 操作按钮 */
  buttonType?: AudioBtnConfig;

  /** 当前文案的配置项 */
  currentConfig?: Partial<SpeechConfigType & SSMLTextType>;

  /** 当前配置的回调 */
  configCb?: (data: Partial<SpeechConfigType & SSMLTextType>) => void;

}

type initialValuesType = {
  voiceList?: SelectProps["options"];
  styleList?: SelectProps["options"];
  roleList?: SelectProps["options"];
  loading?: boolean
  open?: Boolean
}
const initialValues = {
  voiceList: [],
  styleList: [],
  roleList: [],
  loading: false
}

const initialDisable = {
  language: false,
  voice: false,
  style: false,
  role: false,
  stop: false,
  pronunciation: false,
  speed: false,
  tone: false,
}

function AudioConfig(props: AudioConfigPropsType) {
  const [form] = Form.useForm();
  const [titleForm] = Form.useForm();
  const { text, language, isSSML, speed, tone, blobUrl, audioConfig, quality, update } = useTextToSpeechConfig();
  const [state, setState] = useSetState<initialValuesType>(initialValues);
  const [speechValue, setSpeechValue] = useState(1)
  const [toneValue, setToneValue] = useState(1)
  const [isDisable, setIsDisable] = useState(initialDisable)
  const { confirm } = Modal;
  const { plainText } = useTextToSpeech();
  const {
    voiceList,
    styleList,
    roleList,
    loading
  } = state;

  /** 初始化配置项 */
  const initConfig = (initLang = language, switchObj?: any) => {
    const data = voiceGroup(initLang!);
    if (!data.length) return;
    let filterData: any = {};
    if (switchObj?.voice) {
      filterData = data.find(item => item.Name === switchObj.voice)
    }
    const styles = voiceStyle(switchObj ? filterData?.StyleList : data[0].StyleList!);
    const voices = voiceRole(switchObj ? filterData?.RolePlayList : data[0].RolePlayList!);

    setState({ voiceList: data, styleList: styles, roleList: voices });

    if (props.buttonType !== AudioBtnConfig.SYNTHESIS) return false;

    form.setFieldsValue({
      language: switchObj?.language ?? initLang,
      voice: switchObj?.voice ?? data[0].value,
      style: switchObj?.style ?? styles?.[0]?.value,
      role: switchObj?.role ?? voices?.[0]?.value,
      quality: switchObj?.quality ?? quality,
      speed: switchObj?.speed ?? speed,
      tone: switchObj?.tone ?? tone
    })

    update((config) => {
      config.language = switchObj?.language ?? initLang;
      config.voice = switchObj?.voice ?? data[0].value;
      config.style = switchObj?.style ?? styles?.[0]?.value as string;
      config.role = switchObj?.role ?? voices?.[0]?.value as string;
      config.quality = switchObj?.quality ?? quality;
      config.speed = switchObj?.speed ?? speed;
      config.tone = switchObj?.tone ?? tone;
    })
  }

  /** 选择某一自定义配置 */
  const onMenuClick: MenuProps['onClick'] = async (e) => {
    const current = audioConfig.customConfig.filter(item => item.id === e.key);
    if (current.length) initConfig(current[0].data.language, current[0].data)
  };

  // 语音
  const voiceChange = (newValue: string, options: any) => {
    const styles = voiceStyle(options.StyleList!);
    const voices = voiceRole(options.RolePlayList!);

    setState({ styleList: styles, roleList: voices });
    form.setFieldsValue({
      voice: newValue,
      style: styles?.[0]?.value,
      role: voices?.[0]?.value
    })
    form.setFieldValue("voiceName", options.label)
    if (props.buttonType !== AudioBtnConfig.SYNTHESIS) return;
    update((config) => {
      config.voice = newValue;
      config.style = styles?.[0]?.value as string;
      config.role = voices?.[0]?.value as string;
    })
  }

  // 语速
  const onSpeedChange = (newValue: number) => {
    if (props.buttonType !== AudioBtnConfig.SYNTHESIS) {
      setSpeechValue(newValue)
      return;
    };
    update((config) => config.speed = newValue)
  }

  // 音调
  const onToneChange = (newValue: number) => {
    if (props.buttonType !== AudioBtnConfig.SYNTHESIS) {
      setToneValue(newValue);
      return
    };
    update((config) => config.tone = newValue)
  }

  // 保存配置
  const saveConf = () => {
    confirm({
      title: '确定要保存此份配置吗？',
      icon: null,
      content: <>
        <Form form={titleForm}>
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: "必填项" }]}>
            <Input />
          </Form.Item>
        </Form>
      </>,
      onOk() {
        titleForm.validateFields()
          .then(values => {
            if (audioConfig.customConfig.filter(item => item.name === values.name.trim()).length) {
              message.error("名称已存在，请换一个")
              return false;
            }
            update(config => config.audioConfig.customConfig = config.audioConfig.customConfig.concat([{
              id: randomStr(),
              name: values.name.trim(),
              data: {
                language: config.language,
                voice: config.voice,
                style: config.style,
                role: config.role,
                quality: config.quality,
                speed: config.speed,
                tone: config.tone
              }
            }]))
            message.success("配置保存成功")
            titleForm.resetFields();
          }).catch(error => console.log(error))
      },
    });
  }

  /** 生成配音 */
  const synthesis = async () => {
    console.time()
    setState({ loading: true })
    if (blobUrl) {
      update(config => {
        config.blobUrl = undefined;
      })
      URL.revokeObjectURL(blobUrl);
    }
    const formData = form.getFieldsValue()
    const result: any = await plainText({
      text: text,
      language: formData.language,
      voice: formData.voice,
      style: formData.style,
      role: formData.role,
      quality: formData.quality,
      speed: speed,
      tone: tone,
      isSSML
    })
    console.timeEnd()
    if (result.status == 200) {
      update(config => config.blobUrl = result.data);
      message.success("语音已生成!")
    } else {
      message.error(result.message)
    }

    setState({ loading: false })
  }

  const items = audioConfig.customConfig.map(item => ({
    key: item.id,
    label: (<div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{item.name}</span>
      <span style={{ padding: "0 5px" }} onClick={(e) => configPayAuio(e, item.data)}> <PlayCircleOutlined style={{ color: '#3c8308' }} /> </span>
    </div>)
  }));

  /** 配置项的声音试听 */
  const configPayAuio = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, item: CustomConfigType["data"]) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await plainText({
      text: audioConfig.audition || "这声音是来自配置项",
      language: item.language,
      voice: item.voice,
      style: item.style,
      role: item.role,
      quality: item.quality,
      speed: item.speed,
      tone: item.tone,
      isSSML: SSMLTYPE.TEXT,
      playDefault: true
    })
    if (result.status !== 200) message.error(result.message)
  }

  /** 播放试听音频 */
  const payAudio = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await plainText({
      text: audioConfig.audition || "这声音是来自" + item.LocalName,
      language: item.Locale,
      voice: item.Name,
      style: "Default",
      role: "Default",
      quality: 3,
      speed: 1,
      tone: 1,
      isSSML: SSMLTYPE.TEXT,
      playDefault: true
    })
    if (result.status !== 200) message.error(result.message)
  }

  useEffect(() => {
    if (props.currentConfig) {
      form.setFieldsValue(props.currentConfig)
      setSpeechValue(props.currentConfig.speed || 1)
      setToneValue(props.currentConfig.tone || 1)
      initConfig(props.currentConfig.language, props.currentConfig);

      if (props.buttonType === AudioBtnConfig.SCENETALK) {
        let disable: any = {}
        if (!props.currentConfig.selectNodeType || props.currentConfig.selectNodeType === 1 || props.currentConfig.selectNodeType === 3) {
          const enable = ["pronunciation", 'tone']
          for (let key in initialDisable) {
            disable[key] = enable.includes(key) ? true : false
          }
        }
        if (props.currentConfig.selectNodeType === 2) {
          const enable = ["pronunciation", 'speed', 'tone']
          for (let key in initialDisable) {
            disable[key] = enable.includes(key) ? false : true
          }
        }
        setIsDisable({ ...isDisable, ...disable })
        return
      }
      
    } else {
      setIsDisable(initialDisable);
    }
    initConfig();
  }, [props.currentConfig])


  return (
    <Form form={form} labelCol={{ span: 4 }} initialValues={{ language, quality: quality }} >
      <Form.Item label="语言" name="language">
        <Select options={languages} showSearch onChange={(value) => initConfig(value)} disabled={isDisable.language} />
      </Form.Item>
      <Form.Item name="voiceName" noStyle>
        <Form.Item label="语音" name="voice">
          <Select
            options={voiceList?.map((item) => ({
              ...item,
              label: (<div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.label + `${item.Gender === 'Female' ? "👧🏻 (女声)" : "👦🏻 (男声)"}`}</span>
                <span style={{ padding: "0 5px" }} onClick={(e) => payAudio(e, item)}> <PlayCircleOutlined style={{ color: '#3c8308' }} /> </span>
              </div>)
            }))}
            onChange={voiceChange}
            disabled={isDisable.voice}
          />
        </Form.Item>
      </Form.Item>
      <Form.Item name="styleName" noStyle>
        <Form.Item label="风格" name="style">
          <Select options={styleList} onChange={(newValue, options) => {
            if (!(options instanceof Array)) {
              form.setFieldValue("styleName", options.label)
            }
            if (props.buttonType !== AudioBtnConfig.SYNTHESIS) return;
            update(config => config.style = newValue)
          }} disabled={isDisable.style} />
        </Form.Item>
      </Form.Item>
      <Form.Item name="roleName" noStyle>
        <Form.Item label="角色" name="role" >
          <Select options={roleList} onChange={(newValue, options) => {
            if (!(options instanceof Array)) {
              form.setFieldValue("roleName", options.label)
            }
            if (props.buttonType !== AudioBtnConfig.SYNTHESIS) return;
            update(config => config.role = newValue)
          }} disabled={isDisable.role} />
        </Form.Item>
      </Form.Item>
      {
        props.buttonType !== AudioBtnConfig.SCENETALK && (
          <Form.Item label="音质" name="quality">
            <Select options={outputFormatDes} onChange={(newValue) => {
              if (props.buttonType !== AudioBtnConfig.SYNTHESIS) return;
              update(config => config.quality = newValue)
            }} />
          </Form.Item>
        )
      }
      {
        props.buttonType === AudioBtnConfig.SCENETALK && (
          <>
            <Form.Item name="stopName" noStyle>
              <Form.Item label="停顿" name="stop">
                <Select
                  options={[
                    { label: "0.4秒", value: 0.4 },
                    { label: "0.5秒", value: 0.5 },
                    { label: "0.8秒", value: 0.8 },
                    { label: "1.0秒", value: 1.0 },
                    { label: "2秒", value: 2 },
                    { label: "3秒", value: 3 },
                    { label: "5秒", value: 5 },
                    { label: "0.05秒(紧凑间隔)", value: 0.05 },
                    { label: "0.02秒(紧凑间隔)", value: 0.02 },
                  ]}
                  disabled={isDisable.stop}
                  onChange={(newValue, options) => {
                    if (!(options instanceof Array)) {
                      form.setFieldValue("stopName", `【${options.label}】`)
                    }
                  }}
                />
              </Form.Item>
            </Form.Item>

            <Form.Item label="发音" name="pronunciation" tooltip={{
              title: `
              例如，'li 4 zi 5' 表示 '例子'。数字代表拼音声调。'5' 代表轻声。
              若要控制儿化音，请在拼音的声调前插入 "r"。例如，"hou r 2 shan 1" 代表“猴儿山”。
              `,
              icon: <QuestionCircleOutlined style={{ fontSize: 10 }} />
            }}>
              <Input disabled={isDisable.pronunciation} />
            </Form.Item>

          </>
        )
      }
      <Form.Item label="语速" name="speed">
        <Row>
          <Col span={17}>
            <Slider
              min={0.1}
              max={3}
              step={0.01}
              value={props.buttonType === AudioBtnConfig.SYNTHESIS ? speed : speechValue}
              onChange={onSpeedChange}
              disabled={isDisable.speed}
            />
          </Col>
          <Col span={6} offset={1}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={3}
              step={0.01}
              disabled={isDisable.speed}
              value={props.buttonType === AudioBtnConfig.SYNTHESIS ? speed : speechValue}
              onChange={(value) => onSpeedChange(Number(value))}
            />
          </Col>
        </Row>

      </Form.Item>
      <Form.Item label="音调" name="tone">
        <Row>
          <Col span={17}>
            <Slider
              min={0.1}
              max={2}
              step={0.01}
              value={props.buttonType === AudioBtnConfig.SYNTHESIS ? tone : toneValue}
              onChange={onToneChange}
              disabled={isDisable.tone}
            />
          </Col>
          <Col span={6} offset={1}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={2}
              step={0.01}
              value={props.buttonType === AudioBtnConfig.SYNTHESIS ? tone : toneValue}
              onChange={(value) => onToneChange(Number(value))}
              disabled={isDisable.tone}
            />
          </Col>
        </Row>
      </Form.Item>

      {
        props.buttonType === AudioBtnConfig.SCENETALK && (
          <Form.Item label="语音试听" labelCol={{ span: 6 }} >
            <PlayCircleOutlined style={{ fontSize: 20, color: '#3c8308', cursor: "pointer", marginTop: 5 }} />
          </Form.Item>
        )
      }

      {
        props.buttonType === AudioBtnConfig.SYNTHESIS && (
          <Form.Item >
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
              <Button type="primary" htmlType="submit" onClick={synthesis} loading={loading} > 生成配音 </Button>
              <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
            </div>
          </Form.Item>
        )
      }

      {
        props.buttonType === AudioBtnConfig.FILESYTHESIS && (
          <Form.Item >
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
              <Button disabled={!Boolean(props.currentConfig)} type="primary" onClick={() => {
                props.configCb && props.configCb({ ...form.getFieldsValue(), speed: speechValue, tone: toneValue })
                form.resetFields();
              }} > 应用此配置 </Button>
              <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
            </div>
          </Form.Item>
        )
      }

      {
        props.buttonType === AudioBtnConfig.SCENETALK && (
          <Form.Item >
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
              <Button disabled={!Boolean(props.currentConfig)} type="primary" onClick={() => {
                props.configCb && props.configCb({ ...form.getFieldsValue(), speed: speechValue, tone: toneValue })
                form.resetFields();
                setIsDisable(initialDisable)
              }} > 应用此配置 </Button>
            </div>
          </Form.Item>
        )
      }
    </Form>
  )
}

export default AudioConfig