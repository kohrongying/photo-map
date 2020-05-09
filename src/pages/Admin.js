import React from 'react';
import firebase from "../firebase";
import { Layout, Menu, Form, Input, Button, Row, Col, message } from 'antd';
import Map from "../components/Map";

const { Header } = Layout;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default class Admin extends React.Component {

  state = {
    user: null,
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        this.setState({ user: user.uid })
      } else {
        this.setState({ user: null })
      }
    });
  }

  onLogout = () => {
    firebase.auth().signOut()
      .catch(function(error) {
        console.log(error);
      });
  }

  onFinish = values => {
    firebase.auth().signInWithEmailAndPassword(values.username, values.password).catch(function(error) {
      var errorMessage = error.message;
      message.error('Incorrect email or password');
      console.log(errorMessage)
    });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.user ? (
          <Layout>
            <Header>
              <Menu theme="dark" mode="horizontal">
                <Menu.Item key="1">Admin</Menu.Item>
                <Menu.Item key="2" onClick={this.onLogout}>Logout</Menu.Item>
              </Menu>
            </Header>
            
            <Map />
          </Layout>
        ) : (
          <React.Fragment>
            <Row style={{ marginTop: 50 }} justify="center">
              <Col span={12}>
                <Form
                  {...layout}
                  name="basic"
                  onFinish={this.onFinish}
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  {this.state.formEf}
                  <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </React.Fragment>
        )}
        
      </React.Fragment>
    );
  }
}