import { Button, Checkbox, Form, Input, Modal, message } from 'antd'
import React, { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ModalProps } from 'antd/lib';
import styles from './login.module.css'
import { useUserService } from '@/hooks/use-user-service';
import { userStore } from '@/store/user-data';

type LoginPropsType = ModalProps & {
  open: boolean;
  onCancel: () => void;
}

type RegistDataType = {
  username: string;
  password: string;
}

function Login(props: LoginPropsType) {
  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true)
  const { login, register } = useUserService();
console.log("RRRRRRRRRRR", userStore.getState())
  const onFinish = async (values: RegistDataType) => {
    // console.log("WWWWWW",values)
    let result:any = {};
    if(isLogin){
      result  = await login(values.username, values.password)
    }else{
      result  = await register({username:values.username, password: values.password})
    }
    if(result.status === 200){
      if(isLogin) {
        message.success("登录成功")
        userStore.setState({currentUser: result.data});
        handleCancel()
      }
      if(!isLogin) {
        message.success("注册成功");
        form.resetFields();
        setIsLogin(true);
      }
    }
  }

  const handleCancel = () => {
    form.resetFields();
    setIsLogin(true);
    props.onCancel();
  }

  const checkRegist = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Modal
      title="提示"
      {...props}
      open={props.open}
      onCancel={handleCancel}
    >
      <Form
        name="login"
        autoComplete="off"
        form={form}
        initialValues={{
          remember: true
        }}
        onFinish={onFinish}
        labelAlign="left"
        labelCol={{
          sm: { span: 6}
        }}
      >
        <Form.Item name="username" label="账号" rules={[{ required: true, message: '账号是必填项!' }]}>
          <Input prefix={<UserOutlined />} placeholder="请输入账号" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[
          { required: true, message: '密码是必填项!' },
          { min: 6, message: '至少是6位数'}
        ]}>
          <Input.Password
            prefix={<LockOutlined />}
            visibilityToggle
            placeholder="请输入密码"
            min={6}
          />
        </Form.Item>
        {
          !isLogin && (
            <Form.Item name="password2" label="重复密码" dependencies={['password']} rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('输入的新密码不匹配!'));
                },
              }),
            ]}>
              <Input.Password
                prefix={<LockOutlined />}
                visibilityToggle
                placeholder="请重新输入密码"
              />
            </Form.Item>
          )
        }

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>记住密码</Checkbox>
          </Form.Item>

          <span className={styles.regist} onClick={checkRegist} >{isLogin ? "注册" : "返回"}</span>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles['login-form-button']}>
            {isLogin ? "登录" : "注册"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Login