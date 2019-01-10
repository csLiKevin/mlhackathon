import React, { createRef, Component } from "react";
import Button from '@material-ui/core/Button';


export class UploadButton extends Component {
    constructor(props){
        super(props);

        // Reference to the hidden input element used to select local files.
        this.inputField = createRef();

        // Bind event handlers.
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleOnDrop = this.handleOnDrop.bind(this);
    }

    static defaultProps = {
        onDropComplete: () => {}
    };

    handleOnChange() {
        const event = new Event('drop');
        event.dataTransfer = { files: this.inputField.current.files };
        this.handleOnDrop(event);
    }

    handleOnClick() {
        this.inputField.current.click();
    }

    handleOnDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleOnDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleOnDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleOnDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
        this.props.onDropComplete(event);
    }

    render() {
        return (
            <Button
                color="primary"
                onClick={ this.handleOnClick }
                onDragEnter={ this.handleOnDragEnter }
                onDragLeave={ this.handleOnDragLeave }
                onDragOver={ this.handleOnDragOver }
                onDrop={ this.handleOnDrop }
                size="large"
                variant="outlined"
            >
                <input hidden ref={ this.inputField } type='file' onChange={ this.handleOnChange }/>
                Upload Video
            </Button>
        );
    }
}
export default UploadButton;
