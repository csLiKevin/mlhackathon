import { S3 } from 'aws-sdk';
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { Component, Fragment } from 'react';

import './App.css';
import { UploadButton } from './UploadButton.js';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            analysisProgress: null,
            uploadProgress: null
        };

        this.handleUploadVideo = this.handleUploadVideo.bind(this);
    }

    async handleUploadVideo(event) {
        const videoFile = event.dataTransfer.files[0]; // Only supports one video at a time.

        const s3VideoObj = await this.uploadToS3(videoFile);
        this.setState({ analysisProgress: 0, uploadProgress: null });

        await this.indexFaces(s3VideoObj);
    }

    async indexFaces(s3VideoObj) {
        // api reference https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#indexFaces-property
        console.log(s3VideoObj);
    }

    async uploadToS3(fileObj) {
        // Upload file to s3.
        const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY;
        const secretAccessKey = process.env.REACT_APP_AWS_SECRET_KEY;
        const s3Bucket = process.env.REACT_APP_AWS_S3_BUCKET;
        const s3Key = `${Date.now()}--${fileObj.name}`;
        const s3Client = new S3({
            accessKeyId,
            secretAccessKey
        });

        return s3Client
            .upload({
                Body: fileObj,
                Bucket: s3Bucket,
                Key: s3Key
            })
            .on('httpUploadProgress', progressEvent => {
                this.setState({ uploadProgress: progressEvent.loaded / progressEvent.total * 100 });
            })
            .promise();
    }

    render() {
        let contents = null;

        if (this.state.uploadProgress !== null)
            contents = (
                <Fragment>
                    <h2>Uploading</h2>
                    <CircularProgress size={ 100 } variant="static" value={ this.state.uploadProgress } />
                </Fragment>
            );
        else if (this.state.analysisProgress !== null)
            contents = (
                <Fragment>
                    <h2>Analyzing</h2>
                    <CircularProgress size={ 100 } variant="indeterminate" />
                </Fragment>
            );
        else
            contents = <UploadButton onDropComplete={ this.handleUploadVideo } />;

        return (
            <div className="App">
                <header className="App-header">
                    { contents }
                </header>
            </div>
        );
    }
}

export default App;
