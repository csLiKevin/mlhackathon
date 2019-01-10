import React, {Component, createRef} from "react";


export class Results extends Component {
    static defaultProps() {
        return {
            people: [],
            video: null
        };
    }

    constructor(props) {
        super(props);

        this.videoElement = createRef();
        this.state = {
            boundingBox: null
        };
    }

    renderBoundingBox() {
        if (this.videoElement.current === null || !this.state.boundingBox)
            return null;

        const videoHeight = this.videoElement.current.clientHeight;
        const videoWidth = this.videoElement.current.clientWidth;

        return (
            <div style={ {
                border: "2px solid red",
                position: "absolute",
                left: `${videoWidth * this.state.boundingBox.Left}px`,
                height: `${videoHeight * this.state.boundingBox.Height}px`,
                width: `${videoWidth * this.state.boundingBox.Width}px`,
                top: `${videoHeight * this.state.boundingBox.Top}px`,
            } }/>
        );
    }

    renderTimestamps(index, person) {
        const faceMatches = person.FaceMatches;
        const personObj = person.Person;
        const timestamp = person.Timestamp;
        console.log(faceMatches); // TODO: Only include facematches

        return (
            <div
                key={ index }
                onClick={ () => {
                    this.videoElement.current.currentTime = timestamp / 1000;
                    this.setState({ boundingBox: personObj.BoundingBox });
                } }
                style={ { cursor: "pointer", textAlign: "left" } }
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
            </div>
        );
    }
}
export default Results;
