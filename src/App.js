import React, { Component } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import ParticlesBg from 'particles-bg';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import NavigationLogo from './components/NavigationLogo/NavigationLogo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    this.faceDetector = null;
  }

  componentDidMount = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
      );

      this.faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5,
      });

      console.log('MediaPipe face detector is ready');
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
    }
  };

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  detectFace = () => {
    const image = document.getElementById('inputimage');

    if (!this.faceDetector) {
      console.log('Face detector is not ready');
      return;
    }

    if (!image || !image.complete || image.naturalWidth === 0) {
      console.log('Image is not ready');
      return;
    }

    try {
      const result = this.faceDetector.detect(image);

      if (!result.detections || result.detections.length === 0) {
        console.log('No face detected');
        this.displayFaceBox({});
        return;
      }

      const boundingBox = result.detections[0].boundingBox;

      // Original image dimensions
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      // Image dimensions displayed on the page
      const displayWidth = image.width;
      const displayHeight = image.height;

      // Convert MediaPipe coordinates to displayed image coordinates
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;

      const left = boundingBox.originX * scaleX;
      const top = boundingBox.originY * scaleY;
      const width = boundingBox.width * scaleX;
      const height = boundingBox.height * scaleY;

      const box = {
        leftCol: left,
        topRow: top,
        rightCol: displayWidth - (left + width),
        bottomRow: displayHeight - (top + height),
      };

      console.log('Face detected:', box);

      this.displayFaceBox(box);
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState(
      {
        imageUrl: this.state.input,
        box: {},
      },
      () => {
        const image = document.getElementById('inputimage');

        if (!image) {
          console.log('Image element not found');
          return;
        }

        image.onload = () => {
          this.detectFace();
        };

        if (image.complete && image.naturalWidth > 0) {
          this.detectFace();
        }
      }
    );

    fetch('https://face-detection-app-api.onrender.com/image', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: this.state.user.id,
      }),
    })
      .then((response) => response.json())
      .then((count) => {
        this.setState((prevState) => ({
          user: {
            ...prevState.user,
            entries: count,
          },
        }));
      })
      .catch(console.log);
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }

    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className='App'>
        <ParticlesBg
          color='#ffffff'
          type='cobweb'
          bg={true}
        />

        <NavigationLogo
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />

        {route === 'home' ? (
          <div>
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />

            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />

            <FaceRecognition
              box={box}
              imageUrl={imageUrl}
            />
          </div>
        ) : route === 'signin' ? (
          <Signin
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
