import { CustomConfigType, useTextToSpeechConfig } from "@/store/text-to-speech-config";
import { Button, Col, Form, Input, List, Modal, Popconfirm, Row, Select, Space, Switch, Table, message } from "antd"
import { ChangeEvent } from "react";
import { getStyleRoleName, getVoiceName } from '@/store/voices'

function ConfigPage() {
    const [form] = Form.useForm();
    const [titleForm] = Form.useForm();
    const { confirm } = Modal;
    const { audioConfig, update } = useTextToSpeechConfig();

    const switchChange = (value: boolean) => {
        update(config => config.audioConfig.autoplay = value);
    }

    const auditionChang = (event: ChangeEvent<HTMLInputElement>) => {
        update(config => config.audioConfig.audition = event.target.value);
    }

    const downloadChange = (value: string) => {
        update(config => config.audioConfig.download = value)
    }

    const updateCustomConfig = (item: CustomConfigType) => {
        confirm({
            title: '修改配置名称',
            icon: null,
            content: <>
                <Form form={titleForm} initialValues={{ name: item.name }}>
                    <Form.Item name="name" label="配置名称" rules={[{ required: true, message: "必填项" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </>,
            onOk() {
                titleForm.validateFields()
                    .then(values => {
                        update(config => config.audioConfig.customConfig = config.audioConfig.customConfig.map(keys => keys.id === item.id ? ({ ...keys, name: values.name }) : keys))
                        message.success("保存成功")
                        titleForm.resetFields();
                    }).catch(error => console.log(error))
            },
        });
    }

    const deleteCustomConfig = (item: CustomConfigType) => {
        update(config => config.audioConfig.customConfig = config.audioConfig.customConfig.filter(keys => keys.id !== item.id))
        message.success("删除成功")
    }

    return (
        <>
            <Form name="audioConfig" form={form} initialValues={{ autoplay: audioConfig.autoplay, audition: audioConfig.audition, download: audioConfig.download }} >
                <Form.Item label="自动播放" name="autoplay" tooltip="生成语音后是否自动播放音频" valuePropName="checked">
                    <Switch onChange={switchChange} />
                </Form.Item>
                <Form.Item label="下载格式" name="download" tooltip="默认下载格式为.mp3">
                    <Select style={{ width: 250 }}
                        onChange={downloadChange}
                        options={[
                            {
                                label: "mp3",
                                value: '.mp3'
                            },
                            {
                                label: "wav",
                                value: '.wav'
                            },
                            {
                                label: "ogg",
                                value: '.ogg'
                            },
                            {
                                label: "webm",
                                value: '.webm'
                            },
                            {
                                label: "silk",
                                value: '.silk'
                            },
                        ]}
                    />
                </Form.Item>
                <Form.Item label="试听文本" name="audition" tooltip="试听时的文案">
                    <Input onChange={auditionChang} style={{ width: 250 }} />
                </Form.Item>
            </Form>

            <List
                header="自定义语音配置表"
                dataSource={audioConfig.customConfig}
                style={{ paddingRight: 20 }}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <List.Item.Meta
                            title={item.name}
                            description={<>
                                <Row justify="space-evenly">
                                    <Col span={8}><span>语言: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{getStyleRoleName(item.data.language)}</i></span></Col>
                                    <Col span={8}><span>语音: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{getVoiceName(item.data.language, item.data.voiceName)}</i></span></Col>
                                    <Col span={8}><span>风格: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{getStyleRoleName(item.data.styleName!)}</i></span></Col>
                                </Row>
                                <Row justify="space-evenly">
                                    <Col span={8}><span>角色: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{getStyleRoleName(item.data.roleName!)}</i></span></Col>
                                    <Col span={8}><span>语速: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{item.data.speed}</i></span></Col>
                                    <Col span={8}><span>音调: <i style={{fontStyle:"normal", color:'#000', fontSize:13}}>{item.data.tone}</i></span></Col>
                                </Row>
                            </>}
                        />
                        <div>

                            <a style={{ marginRight: 5 }} onClick={() => updateCustomConfig(item)}>修改</a>
                            <Popconfirm
                                title="提示"
                                description="确定要删除此配置项?"
                                onConfirm={() => deleteCustomConfig(item)}
                                okText="确认"
                                cancelText="取消"
                            >
                                <a>删除</a>
                            </Popconfirm>
                            
                        </div>
                    </List.Item>
                )}
            />

        </>
    )
}

export default ConfigPage