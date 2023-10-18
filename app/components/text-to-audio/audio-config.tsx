import { Button, Col, Dropdown, Input, InputNumber, MenuProps, Modal, Row, Select, SelectProps, Slider, message } from 'antd';
import React, { useEffect, useState } from 'react'
import { Form } from 'antd';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages, voiceGroup, voiceStyle, voiceRole, outputFormatDes } from '@/store';
import { useSetState } from 'ahooks';
import { useTextToSpeechConfig } from '@/store/text-to-speech-config';

type initialValuesType = {
  voiceList?: SelectProps["options"];
  styleList?: SelectProps["options"];
  roleList?: SelectProps["options"];
  loading?: boolean
}
const initialValues = {
  voiceList: [],
  styleList: [],
  roleList: [],
  loading: false
}

function AudioConfig(props: any) {
  const [form] = Form.useForm();
  const { text, language, isSSML, speed, tone, blobUrl, update } = useTextToSpeechConfig();

  const [state, setState] = useSetState<initialValuesType>(initialValues);
  const { confirm } = Modal;
  const { plainText } = useTextToSpeech();
  const {
    voiceList,
    styleList,
    roleList,
    loading
  } = state;


  const initConfig = (initLang = language) => {
    const data = voiceGroup(initLang!);
    if (!data.length) return;
    const styles = voiceStyle(data[0].StyleList!);
    const voices = voiceRole(data[0].RolePlayList!);

    setState({ voiceList: data, styleList: styles, roleList: voices });
    form.setFieldsValue({
      voice: data[0].value,
      style: styles?.[0]?.value,
      role: voices?.[0]?.value
    })
    update((config) => {
      config.voice = data[0].value;
      config.style = styles?.[0]?.value as string;
      config.role = voices?.[0]?.value as string;
    })
  }

  const onMenuClick: MenuProps['onClick'] = async (e) => {
    console.log('click', e);
    // imageToText()
  };

  // 语音
  const voiceChange = (newValue: string, options: any) => {
    // const data = voiceGroup(newValue);
    const styles = voiceStyle(options.StyleList!);
    const voices = voiceRole(options.RolePlayList!);

    setState({ styleList: styles, roleList: voices });
    form.setFieldsValue({
      voice: options.value,
      style: styles?.[0]?.value,
      role: voices?.[0]?.value
    })
    update((config) => {
      config.voice = options;
      config.style = styles?.[0]?.value as string;
      config.role = voices?.[0]?.value as string;
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
        <Form.Item label="自定义配置名称">
          <Input />
        </Form.Item>
      </>,
      onOk() {
        console.log('OK');
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
      // URL.revokeObjectURL(blobUrl);
    }
    const formData = form.getFieldsValue()
    const result: any = await plainText({
      text: text,
      language: formData.language,
      voiceName: formData.voice,
      styleName: formData.style,
      roleName: formData.role,
      outputFormat: formData.exportFormmat,
      speed: formData.speed,
      tone: formData.tone,
      isSSML
    })
    console.timeEnd()
    if (result.status == 200) {
      update(config => config.blobUrl = result.data);
      message.success("语音已生成!")
    }
    console.log("RRRRRRRRR", result.data);
    setState({ loading: false })
  }

  const items = [
    {
      key: '1',
      label: '1st item',
    },
    {
      key: '2',
      label: '2nd item',
    },
    {
      key: '3',
      label: '3rd item',
    },
  ];

  useEffect(() => {
    initConfig();
  }, [])


  return (
    <Form form={form} labelCol={{ span: 4 }} initialValues={{ language, speed, tone, exportFormmat: 3 }} >
      <Form.Item label="语言" name="language">
        <Select options={languages} showSearch onChange={(value) => initConfig(value)} />
      </Form.Item>
      <Form.Item label="语音" name="voice">
        <Select options={voiceList?.map((item) => ({ ...item, label: item.label + `${item.Gender === 'Female' ? " (女性)" : " (男性)"}` }))} onChange={voiceChange} />
      </Form.Item>
      <Form.Item label="风格" name="style">
        <Select options={styleList} />
      </Form.Item>
      <Form.Item label="情感" name="role">
        <Select options={roleList} />
      </Form.Item>
      <Form.Item label="格式" name="exportFormmat">
        <Select options={outputFormatDes} />
      </Form.Item>
      <Form.Item label="语速" name="speed">
        <Row>
          <Col span={18}>
            <Slider
              min={0.1}
              max={3}
              step={0.01}
              value={speed}
              onChange={onSpeedChange}
            />
          </Col>
          <Col span={6}>
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
          <Col span={18}>
            <Slider
              min={0.1}
              max={2}
              step={0.01}
              value={tone}
              onChange={onToneChange}
            />
          </Col>
          <Col span={6}>
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


      <Form.Item >
        <div style={{ display: 'flex', justifyContent: "space-between" }}>
          <Button type="primary" htmlType="submit" onClick={synthesis} loading={loading} > 生成配音 </Button>
          <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default AudioConfig