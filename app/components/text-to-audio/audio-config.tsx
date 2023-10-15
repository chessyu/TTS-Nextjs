import { Button, Col, Dropdown, Input, InputNumber, MenuProps, Modal, Row, Select, SelectProps, Slider } from 'antd';
import React, { useEffect, useState } from 'react'
import { Form } from 'antd';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages, voiceGroup,voiceStyle, voiceRole } from '@/store';
import { useSetState } from 'ahooks';

type initialValuesType = {
  speedValue?: number;
  toneValue?: number;
  language?: string;
  voiceList?: SelectProps["options"];
  styleList?: SelectProps["options"];
  roleList?: SelectProps["options"];
}
const initialValues = {
  speedValue: 1,
  toneValue: 1,
  language: "zh-CN",
  voiceList: [],
  styleList: [],
  roleList: [],
}

function AudioConfig(props: any) {
  const [form] = Form.useForm();
  const [state, setState] = useSetState<initialValuesType>(initialValues);
  const { confirm } = Modal;
  const { plainText, getVoiceOptions } = useTextToSpeech();
  const {
    speedValue,
    toneValue,
    language,
    voiceList,
    styleList,
    roleList
  } = state;


  const initConfig = (initLang = language) => {
    const data = voiceGroup(initLang!);
    if(!data.length) return;
    const styles = voiceStyle(data[0].StyleList!);
    const voices = voiceRole(data[0].RolePlayList!);

    setState({voiceList: data, styleList: styles, roleList: voices});
    form.setFieldsValue({
      voice: data[0].value,
      style: styles?.[0]?.value,
      role: voices?.[0]?.value
    })
  }

  const onMenuClick: MenuProps['onClick'] = async (e) => {
    console.log('click', e);
    // imageToText()
  };

  // 语音
  const voiceChange = (newValue: string, options:any) => {
    // const data = voiceGroup(newValue);
    const styles = voiceStyle(options.StyleList!);
    const voices = voiceRole(options.RolePlayList!);

    setState({ styleList: styles, roleList: voices});
    form.setFieldsValue({
      voice: options.value,
      style: styles?.[0]?.value,
      role: voices?.[0]?.value
    })
  }



  // 语速
  const onSpeedChange = (newValue: number) => {
    setState({ speedValue: newValue });
  }

  // 音调
  const onToneChange = (newValue: number) => {
    setState({ toneValue: newValue });
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
    // const result:any = await plainText({
    //   text: 'The recommended usage is to colocate actions and states within the store (let your actions be located together with your state)',
    //   outputFileName: 'a',
    //   language: 'b',
    //   voiceName: 'c',
    //   outputFormat: 'd'
    // })

    // console.log("RRRRRRRRR", result);

    const result: any = await getVoiceOptions()
    console.log("RRRRRRR", result);
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
  },[])


  return (
    <Form form={form} labelCol={{ span: 4 }} initialValues={{ language, speed: speedValue, tone: toneValue }} >
      <Form.Item label="语言" name="language">
        <Select options={languages} showSearch onChange={(value) => initConfig(value)} />
      </Form.Item>
      <Form.Item label="语音" name="voice">
        <Select options={voiceList} onChange={voiceChange }/>
      </Form.Item>
      <Form.Item label="风格" name="style">
        <Select options={styleList} />
      </Form.Item>
      <Form.Item label="情感" name="role">
        <Select options={roleList} />
      </Form.Item>
      <Form.Item label="语速" name="speed">
        <Row>
          <Col span={18}>
            <Slider
              min={0.1}
              max={2.5}
              step={0.01}
              value={speedValue}
              onChange={onSpeedChange}
            />
          </Col>
          <Col span={6}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={2.5}
              step={0.01}
              value={speedValue}
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
              max={2.5}
              step={0.01}
              value={toneValue}
              onChange={onToneChange}
            />
          </Col>
          <Col span={6}>
            <InputNumber style={{ width: "100%" }}
              min={0.1}
              max={2.5}
              step={0.01}
              value={toneValue}
              onChange={(value) => onToneChange(Number(value))}
            />
          </Col>
        </Row>
      </Form.Item>

      <Form.Item >
        <div style={{ display: 'flex', justifyContent: "space-between" }}>
          <Button type="primary" onClick={synthesis} > 生成配音 </Button>
          <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default AudioConfig