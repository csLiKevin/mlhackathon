import { S3 } from "aws-sdk";
import React, {Component, createRef} from "react";


export class Results extends Component {
    static defaultProps() {
        return {
            people: [],
            superFans: {},
            video: null
        };
    }

    constructor(props) {
        super(props);

        this.videoElement = createRef();
        this.state = {
            boundingBox: null,
            superFanData: null
        };
    }

    get awsConstants() {
        return {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
        };
    };

    renderBoundingBox() {
        if (this.videoElement.current === null || !this.state.boundingBox)
            return null;

        const videoHeight = this.videoElement.current.clientHeight;
        const videoWidth = this.videoElement.current.clientWidth;
        const hasSuperFanData = this.state.superFanData !== null;
        let color = "tomato";

        if (hasSuperFanData)
            color = "springgreen";

        return (
            <div style={ {
                color,
                border: `2px solid ${color}`,
                position: "absolute",
                left: `${videoWidth * this.state.boundingBox.Left}px`,
                height: `${videoHeight * this.state.boundingBox.Height}px`,
                width: `${videoWidth * this.state.boundingBox.Width}px`,
                top: `${videoHeight * this.state.boundingBox.Top}px`,
            } }>
                { hasSuperFanData ? "SUPER" : undefined }
            </div>
        );
    }

    renderSuperFanData() {
        if (this.state.superFanData === null)
            return null;

        const [Bucket, Key] = this.state.superFanData.s3FaceImagePath.S.split(/\/(.+)/);
        const s3Client = new S3({
            accessKeyId: this.awsConstants.accessKeyId,
            secretAccessKey: this.awsConstants.secretAccessKey
        });
        const faceUrl = s3Client.getSignedUrl('getObject', { Bucket, Key });

        return (
            <div style={ { textAlign: "left" } }>
                <img style={ { maxHeight: 200 } } src={ faceUrl } alt="Matched Face" />
                <pre>
                    { JSON.stringify(this.state.superFanData, null, 2)}
                </pre>
            </div>
        );
    }

    renderTimestamps(index, person) {
        const faceMatches = person.FaceMatches;
        const personObj = person.Person;
        const timestamp = person.Timestamp;

        let color = undefined;
        let superFanData = null;
        let boundingBox = personObj.BoundingBox;
        if (faceMatches) {
            if (faceMatches[0]) { // Not sure why faceMatches is an empty array sometimes.
                const faceMatch = faceMatches[0].Face;
                const faceId = faceMatch.FaceId;
                superFanData = this.props.superFans[faceId];
                color = "springgreen";
                // Face bounding doesn't seem as good.
                // boundingBox = faceMatch.BoundingBox;
            }
        }

        return (
            <div
                key={ index }
                onClick={ () => {
                    this.videoElement.current.currentTime = timestamp / 1000;
                    this.setState({ boundingBox, superFanData });
                } }
                style={ { color, cursor: "pointer", textAlign: "left" } }
            >
                { timestamp }ms
            </div>
        );
    }

    render() {
        const height = 360;
        return (
            <div style={ { display: "flex", position: "relative" } }>
                { this.renderBoundingBox() }
                <video height={ height } ref={ this.videoElement } src={ this.props.video } style={ {} }/>
                <div style={ { maxHeight: height, overflow: "auto" } }>
                    { this.props.people.map((person, index) => this.renderTimestamps(index, person) ) }
                </div>
                <div style={ { maxHeight: height, overflow: "auto" } }>
                    { this.renderSuperFanData() }
                </div>
            </div>
        );
    }
}
export default Results;
