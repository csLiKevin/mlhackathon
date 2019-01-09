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
        console.log(event.dataTransfer.files);
    }

    render() {
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
