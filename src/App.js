import { Rekognition, S3 } from 'aws-sdk';
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

        this.analyzeFaces = this.analyzeFaces.bind(this);
        this.handleUploadVideo = this.handleUploadVideo.bind(this);
    }

    get awsConstants() {
        return {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
            s3Bucket: process.env.REACT_APP_AWS_S3_BUCKET
        };
    };

    async handleUploadVideo(event) {
        const videoFile = event.dataTransfer.files[0]; // Only supports one video at a time.

        const s3VideoObj = await this.uploadToS3(videoFile);
        this.setState({ analysisProgress: 0, uploadProgress: null });

        await this.analyzeFaces(s3VideoObj);
    }

    // Video: { /* required */
    //     S3Object: {
    //         Bucket: 'STRING_VALUE',
    //         Name: 'STRING_VALUE',
    //         Version: 'STRING_VALUE'
    //     }
    // },
    async analyzeFaces(s3VideoObj) {
        const rekognition = new Rekognition({
            accessKeyId: this.awsConstants.accessKeyId,
            secretAccessKey: this.awsConstants.secretAccessKey
        });

        console.log(s3VideoObj);
        return rekognition
            .startFaceDetection({
                Video: {
                    S3Object: {
                        Bucket: s3VideoObj.Bucket,
                        Name: s3VideoObj.Key
                    }
                }
            })
            .promise();
        // api reference https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#indexFaces-property
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#startFaceDetection-property
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#startFaceSearch-property
    }

    async uploadToS3(fileObj) {
        // Upload file to s3.
        const s3Key = `${Date.now()}--${fileObj.name}`;
        const s3Client = new S3({
            accessKeyId: this.awsConstants.accessKeyId,
            secretAccessKey: this.awsConstants.secretAccessKey
        });

        return s3Client
            .upload({
                Body: fileObj,
                Bucket: this.awsConstants.s3Bucket,
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
