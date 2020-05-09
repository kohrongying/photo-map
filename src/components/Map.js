import React from 'react';
import { Map as GoogleMaps, GoogleApiWrapper, Marker } from 'google-maps-react';
import { Typography } from 'antd';
import firebase from "../firebase";

const { Title } = Typography;

const mapStyles = {
  width: '100%',
  height: '80%'
};

class Map extends React.Component {

  state = {
    coordinates: [],
  }

  componentDidMount() {
    
    firebase.database().ref('latlong').on('value', snapshot => {
      const coordinates = snapshot.val();
      this.setState({ coordinates })
    })
  }

  componentWillUnmount() {
    firebase.database().ref('latlong').off();
  }

  render() {
    return (
      <React.Fragment>
        <Title style={{ paddingTop: 50, paddingLeft: 50 }}>Admin</Title>

        <GoogleMaps
          google={this.props.google}
          zoom={12}
          style={mapStyles}
          initialCenter={{
            lat: 1.3521,
            lng: 103.8198
          }}
        >
          {Object.values(this.state.coordinates).map((coor, idx) => {
            if (coor.lat && coor.long) {
              return <Marker key={idx} position={{ lat: coor.lat, lng: coor.long }} />  
            }
            return null;
          })}
          
        </GoogleMaps>

      </React.Fragment>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(Map);