import { Button, Col, Dropdown, Input, InputNumber, MenuProps, Modal, Row, Select, SelectProps, Slider, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { Form } from 'antd';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages, voiceGroup, voiceStyle, voiceRole, outputFormatDes } from '@/store';
import { useSetState } from 'ahooks';
import { CustomConfigType, useTextToSpeechConfig } from '@/store/text-to-speech-config';
import { PlayCircleOutlined } from '@ant-design/icons'
import { SSMLTYPE } from '@/interface';
import { randomStr } from '@/utils/common-methods';

type AudioConfigPropsType = {
  activeType: string;
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

function AudioConfig(props: AudioConfigPropsType) {
  const [form] = Form.useForm();
  const [titleForm] = Form.useForm();
  const { text, language, isSSML, speed, tone, blobUrl, audioConfig, quality, update } = useTextToSpeechConfig();
  const [state, setState] = useSetState<initialValuesType>(initialValues);
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
    if (switchObj?.voiceName) {
      filterData = data.find(item => item.Name === switchObj.voiceName)
    }
    const styles = voiceStyle(switchObj ? filterData?.StyleList : data[0].StyleList!);
    const voices = voiceRole(switchObj ? filterData?.RolePlayList : data[0].RolePlayList!);

    setState({ voiceList: data, styleList: styles, roleList: voices });
    form.setFieldsValue({
      language: switchObj?.language ?? initLang,
      voice: switchObj?.voiceName ?? data[0].value,
      style: switchObj?.styleName ?? styles?.[0]?.value,
      role: switchObj?.roleName ?? voices?.[0]?.value,
      quality: switchObj?.quality ?? quality,
      speed: switchObj?.speed ?? speed,
      tone: switchObj?.tone ?? tone
    })
    update((config) => {
      config.language = switchObj?.language ?? initLang,
        config.voiceName = switchObj?.voiceName ?? data[0].value;
      config.styleName = switchObj?.styleName ?? styles?.[0]?.value as string;
      config.roleName = switchObj?.roleName ?? voices?.[0]?.value as string;
      config.quality = switchObj?.quality ?? quality,
        config.speed = switchObj?.speed ?? speed,
        config.tone = switchObj?.tone ?? tone
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
    update((config) => {
      config.voiceName = newValue;
      config.styleName = styles?.[0]?.value as string;
      config.roleName = voices?.[0]?.value as string;
    })
  }

  // 语速
  const onSpeedChange = (newValue: number) => {
    update((config) => config.speed = newValue)
  }

  // 音调
  const onToneChange = (newValue: number) => {
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
            if(audioConfig.customConfig.filter(item => item.name === values.name.trim()).length) {
              message.error("名称已存在，请换一个")
              return false;
            }
            update(config => config.audioConfig.customConfig = config.audioConfig.customConfig.concat([{
              id: randomStr(),
              name: values.name.trim(),
              data: {
                language: config.language,
                voiceName: config.voiceName,
                styleName: config.styleName,
                roleName: config.roleName,
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
      voiceName: formData.voice,
      styleName: formData.style,
      roleName: formData.role,
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
      voiceName: item.voiceName,
      styleName: item.styleName,
      roleName: item.roleName,
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
      voiceName: item.Name,
      styleName: "Default",
      roleName: "Default",
      quality: 3,
      speed: 1,
      tone: 1,
      isSSML: SSMLTYPE.TEXT,
      playDefault: true
    })
    if (result.status !== 200) message.error(result.message)
  }

  useEffect(() => {
    initConfig();
  }, [])


  return (
    <Form form={form} labelCol={{ span: 4 }} initialValues={{ language, speed, tone, quality: quality }} >
      <Form.Item label="语言" name="language">
        <Select options={languages} showSearch onChange={(value) => initConfig(value)} />
      </Form.Item>
      <Form.Item label="语音" name="voice">
        <Select
          options={voiceList?.map((item) => ({
            ...item,
            label: (<div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item.label + `${item.Gender === 'Female' ? " (女性)" : " (男性)"}`}</span>
              <span style={{ padding: "0 5px" }} onClick={(e) => payAudio(e, item)}> <PlayCircleOutlined style={{ color: '#3c8308' }} /> </span>
            </div>)
          }))}
          onChange={voiceChange}
        />
      </Form.Item>
      <Form.Item label="风格" name="style">
        <Select options={styleList} onChange={(newValue) => update(config => config.styleName = newValue)} />
      </Form.Item>
      <Form.Item label="角色" name="role">
        <Select options={roleList} onChange={(newValue) => update(config => config.roleName = newValue)} />
      </Form.Item>
      <Form.Item label="音质" name="quality">
        <Select options={outputFormatDes} />
      </Form.Item>
      <Form.Item label="语速" name="speed">
        <Row>
          <Col span={17}>
            <Slider
              min={0.1}
              max={3}
              step={0.01}
              value={speed}
              onChange={onSpeedChange}
            />
          </Col>
          <Col span={6} offset={1}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={3}
              step={0.01}
              value={speed}
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
              value={tone}
              onChange={onToneChange}
            />
          </Col>
          <Col span={6} offset={1}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={2}
              step={0.01}
              value={tone}
              onChange={(value) => onToneChange(Number(value))}
            />
          </Col>
        </Row>
      </Form.Item>

      {
        props.activeType === 'paperwork' && (
          <Form.Item >
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
              <Button type="primary" htmlType="submit" onClick={synthesis} loading={loading} > 生成配音 </Button>
              <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
            </div>
          </Form.Item>
        )
      }

    </Form>
  )
}

export default AudioConfig