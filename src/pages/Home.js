import React from 'react';
import { Layout, Menu, Typography, Form, Input, Button, Upload, Modal, Spin  } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import exifr from 'exifr'
import firebase from "../firebase";

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

export default class Home extends React.Component {
  formRef = React.createRef();

  state = {
    imageURL: null,
    isLoading: false,
    latitude: '',
    longitude: '',
    firebaseKey: '',
    isUploadingImg: false,
  }

  saveToDb = userDetails => {
    if (!this.state.firebaseKey) {
      return firebase.database().ref('submissions').push(userDetails)
        .then(() => {
          this.setState({ isLoading: false, imageURL: null, latitude: '', longitude: '' });
          Modal.success({
            content: 'Upload successful. We will notify you if you win',
          });
          this.formRef.current.resetFields();
        })
        .catch(err => {
          console.log(err);
          this.setState({ isLoading: false });
          Modal.warning({
            title: 'This is a warning message',
            content: 'Something went wrong. Please try again',
          });
        }) 
    }
    return firebase.database().ref(`submissions/${this.state.firebaseKey}`).set(userDetails)
      .then(() => {
        this.setState({ isLoading: false, imageURL: null, latitude: '', longitude: '' });
        this.setState({ isLoading: false });
        Modal.success({
          content: 'Upload successful. We will notify you if you win',
        });
        this.formRef.current.resetFields();
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
        Modal.warning({
          title: 'This is a warning message',
          content: 'Something went wrong. Please try again',
        });
      }) 
  }

  saveLatLong = () => {
    firebase.database().ref('latlong').push({ 
      lat: this.state.latitude,
      long: this.state.longitude,
    })
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  handleSubmit = async (values) => {
    this.setState({ isLoading: true });
    const userDetails = {
      name: values.name,
      contact: values.contact,
      imageURL: this.state.imageURL,
    }
    await Promise.all([ this.saveToDb(userDetails), this.saveLatLong() ]);
  }

  setLatLong = async (file) => {
    let {latitude, longitude} = await exifr.gps(file)
    this.setState({ latitude, longitude });
  }

  getFirebaseKey = () => {
    const newPostRef = firebase.database().ref('submissions').push();
    this.setState({ firebaseKey: newPostRef.key })
  }

  customUpload = async ({ onError, onSuccess, file }) => {
    this.setState({ isUploadingImg: true })
    //EXIF DATA
    this.setLatLong(file);

    await this.getFirebaseKey();

    const imgFile =  firebase.storage().ref(`uploads/${this.state.firebaseKey}`)
    const uploadTask = imgFile.put(file, { contentType: 'image/jpeg'});
   
    uploadTask.then(() =>{
      imgFile.getDownloadURL().then(url => this.setState({ 
        imageURL: url, 
        isUploadingImg: false 
      }));
    }).catch(err => {
      console.log(err);
    });
  };

  render() {
    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1" href="#home">Home</Menu.Item>
            <Menu.Item key="2" href="#win">How to Win</Menu.Item>
            <Menu.Item key="3" href="#about">About Us</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '50px' }}>

          <Title id="home">Hello There</Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
          </Paragraph>

          <Title id="win">Stand to win</Title>

          <Form
            layout='vertical'
            onFinish={this.handleSubmit}
            ref={this.formRef}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input your name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item 
              label="Contact Number"
              name="contact"
              rules={[{ required: true, message: 'Please input your contact number'}]}
            >
              <Input />
            </Form.Item>
            
            {this.state.imageURL ? (
              <img src={this.state.imageURL} alt="imageUpload" width="200"/>
            ) : (
              <React.Fragment>
                {this.state.isUploadingImg ? <Spin /> : (
                  <Upload
                    accept=".jpg,.jpeg,.png"
                    listType='picture'
                    fileList={this.state.fileList}
                    customRequest={this.customUpload}
                  >
                    <Button>
                      <UploadOutlined /> Upload
                    </Button>
                  </Upload>
                )}
              </React.Fragment>
            )}

            <Form.Item>
              <Button
                style={{ marginTop: 20 }}
                type="primary"
                htmlType="submit"
                loading={this.state.isLoading}
                disabled={!this.state.imageURL}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>


          <Title id="about">About Us</Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
          </Paragraph>

        </Content>
        <Footer style={{ textAlign: 'center' }}>Big Red Button © 2020</Footer>
      </Layout>
    )
  }
}
