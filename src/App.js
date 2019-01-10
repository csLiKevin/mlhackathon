import { DynamoDB, Rekognition, S3 } from 'aws-sdk';
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { Component, Fragment } from 'react';

import './App.css';
import { Results } from "./Results";
import { UploadButton } from "./UploadButton.js";


const IN_PROGRESS = "IN_PROGRESS";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            analysisProgress: null,
            people: null,
            superFans: null,
            uploadProgress: null,
            videoFile: null
        };

        this.analyzeFaces = this.analyzeFaces.bind(this);
        this.handleUploadVideo = this.handleUploadVideo.bind(this);
    }

    get awsConstants() {
        return {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
            dynamoDB: process.env.REACT_APP_AWS_DYNAMO_DB,
            rekognitionCollection: process.env.REACT_APP_AWS_REKOGNITION_COLLECTION,
            roleArn: process.env.REACT_APP_AWS_ROLE_ARN,
            s3Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
            snsTopicArn: process.env.REACT_APP_AWS_SNS_TOPIC_ARN
        };
    };

    async handleUploadVideo(event) {
        const videoFile = event.dataTransfer.files[0]; // Only supports one video at a time.

        const s3VideoObj = await this.uploadToS3(videoFile);
        this.setState({
            analysisProgress: IN_PROGRESS,
            uploadProgress: null,
            videoFile: window.URL.createObjectURL(videoFile)
        });

        const [faceIds, people] = await this.analyzeFaces(s3VideoObj);
        const superFans = (await this.scanDynamoDB(Array.from(faceIds))).reduce((accumulator, currentValue) => {
            accumulator[currentValue.faceId.S] = currentValue;
            return accumulator;
        }, {});
        this.setState({ people, superFans, analysisProgress: null });
    }

    async analyzeFaces(s3VideoObj) {
        const rekognition = new Rekognition({
            accessKeyId: this.awsConstants.accessKeyId,
            region: "us-east-1",
            secretAccessKey: this.awsConstants.secretAccessKey
        });

        // Initiate the face search request.
        const { JobId: jobId } = await rekognition
            .startFaceSearch({
                CollectionId: this.awsConstants.rekognitionCollection,
                Video: {
                    S3Object: {
                        Bucket: s3VideoObj.Bucket,
                        Name: s3VideoObj.Key
                    }
                }
            })
            .promise();

        // Poll for the status of the job.
        let jobStatus = IN_PROGRESS;
        let results;
        do {
            results = await rekognition.getFaceSearch({
                JobId: jobId
            }).promise();
            jobStatus = results.JobStatus;
            console.log(jobStatus);

            // Wait one second.
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (jobStatus === IN_PROGRESS);

        // Grab the matched face ids.
        const persons = results.Persons;
        const superFans = persons.reduce((accumulator, currentValue) => {
            const faceMatches = currentValue.FaceMatches;
            if (faceMatches) {
                faceMatches.forEach(async matches => {
                    const faceId = matches.Face.FaceId;
                    accumulator.add(faceId);
                });
            }
            return accumulator;
        }, new Set());

        return [superFans, persons];
    }

    async scanDynamoDB(faceIds) {
        const dynamoDB = new DynamoDB({
            accessKeyId: this.awsConstants.accessKeyId,
            secretAccessKey: this.awsConstants.secretAccessKey,
            region: "us-east-1",
        });

        const promises = faceIds.map(faceId => dynamoDB.scan({
            ExpressionAttributeValues: {
                ":faceId": {
                    S: faceId
                }
            },
            FilterExpression: "faceId = :faceId",
            TableName: this.awsConstants.dynamoDB
        }).promise().then(result => result.Items[0]));

        return Promise.all(promises);
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
        else if (this.state.people !== null)
            contents = (
                <Fragment>
                    <h2>Results</h2>
                    <Results
                        people={ this.state.people }
                        superFans={ this.state.superFans }
                        video={ this.state.videoFile }
                    />
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
