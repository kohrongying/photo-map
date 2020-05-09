import React from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import firebase from "../firebase";

const mapStyles = {
  width: '100%',
  height: '100%'
};

class Admin extends React.Component {

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
        <h1>Admin</h1>

        <Map
          google={this.props.google}
          zoom={12}
          style={mapStyles}
          initialCenter={{
          lat: 1.3521,
          lng: 103.8198
          }}
        >
          {Object.values(this.state.coordinates).map(coor => {
            if (coor.lat && coor.long) {
              return <Marker position={{ lat: coor.lat, lng: coor.long }} />  
            }
            return null;
          })}
          
        </Map>

      </React.Fragment>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(Admin);