import React from 'react';
import { Layout, Menu, Typography, Form, Input, Button, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import exifr from 'exifr'
import firebase from "../firebase";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

export default class Home extends React.Component {
  state = {
    name: "",
    contact: "",
    imageURL: null,
    isLoading: false,
    latitude: '',
    longitude: '',
    firebaseKey: '',
  }

  saveToDb = userDetails => {
    if (!this.state.firebaseKey) {
      return firebase.database().ref('submissions').push(userDetails)
        .then(() => {
          this.setState({ isLoading: false, name: '', contact: '', imageURL: null, latitude: '', longitude: '' });
          Modal.success({
            content: 'Upload successful. We will notify you if you win',
          });
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
        this.setState({ isLoading: false, name: '', contact: '', imageURL: null, latitude: '', longitude: '' });
        this.setState({ isLoading: false });
        Modal.success({
          content: 'Upload successful. We will notify you if you win',
        });
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

  handleSubmit = async () => {
    this.setState({ isLoading: true });
    const userDetails = {
      name: this.state.name,
      contact: this.state.contact,
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
    //EXIF DATA
    this.setLatLong(file);

    await this.getFirebaseKey();

    const imgFile =  firebase.storage().ref(`uploads/${this.state.firebaseKey}`)
    const uploadTask = imgFile.put(file, { contentType: 'image/jpeg'});
   
    uploadTask.then(() =>{
      imgFile.getDownloadURL().then(url => this.setState({ imageURL: url }));
    }).catch(err => {
      console.log(err);
    });
  };

  render() {
    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '50px' }}>

          <Title>Hello There</Title>

          <Title>Stand to win</Title>

          <Form
            layout='vertical'
            onFinish={this.handleSubmit}
          >
            <Form.Item label="Name">
              <Input
                placeholder="Name"
                value={this.state.name}
                onChange={this.handleChange('name')}
              />
            </Form.Item>
            <Form.Item label="Contact Number">
              <Input
                placeholder="Phone Number"
                value={this.state.contact}
                onChange={this.handleChange('contact')}
              />
            </Form.Item>
            {this.state.imageURL ? (
              <img src={this.state.imageURL} alt="imageUpload" width="200"/>
            ) : (
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

            <Form.Item>
              <Button style={{ marginTop: 20 }} type="primary" htmlType="submit" loading={this.state.isLoading}>Submit</Button>
            </Form.Item>
          </Form>


        </Content>
        <Footer style={{ textAlign: 'center' }}>Big Red Button © 2020</Footer>
      </Layout>
    )
  }
}
