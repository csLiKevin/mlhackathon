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

        return (
            <div style={ { textAlign: "left" } }>
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

        let superFanData = null;
        let color = undefined;
        if (faceMatches) {
            const faceId = faceMatches[0].Face.FaceId;
            superFanData = this.props.superFans[faceId];
            color = "springgreen";
        }

        return (
            <div
                key={ index }
                onClick={ () => {
                    this.videoElement.current.currentTime = timestamp / 1000;
                    this.setState({ boundingBox: personObj.BoundingBox, superFanData });
                } }
                style={ { color, cursor: "pointer", textAlign: "left" } }
            >
                { timestamp }ms
            </div>
        );
    }

    render() {
        return (
            <div style={ { display: "flex", position: "relative" } }>
                { this.renderBoundingBox() }
                <video height={ 360 } ref={ this.videoElement } src={ this.props.video } style={ {} }/>
                <div style={ { maxHeight: 360, overflow: "auto" } }>
                    { this.props.people.map((person, index) => this.renderTimestamps(index, person) ) }
                </div>
                { this.renderSuperFanData() }
            </div>
        );
    }
}
export default Results;
