import React, { Component } from 'react';
import './App.css';
import { UploadButton } from './UploadButton.js';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            video: null
        };

        this.handleUploadVideo = this.handleUploadVideo.bind(this);
    }

    handleUploadVideo(event) {
        const videoFile = event.dataTransfer.files[0]; // Only supports one video at a time.

        // Upload file to s3.
    }

    render() {
        console.log(process.env.REACT_APP_REKOGNITION);
        return (
            <div className="App">
                <header className="App-header">
                    <UploadButton onDropComplete={ this.handleUploadVideo } />
                </header>
            </div>
        );
    }
}

export default App;
