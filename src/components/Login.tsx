import * as React from 'react';
import {
    Modal,
    FormGroup,
    ControlLabel,
    FormControl
} from 'react-bootstrap';
import { HTML_IDS } from '../App';

export class LoginModal extends React.Component {
    props: {
        show: boolean;
        onHide: () => void;
        login: () => void;
    };

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                onShow={() => {
                    (document.getElementById(HTML_IDS.login_username) as HTMLElement).focus();
                }}
            >
                <Modal.Body>
                    <FormGroup>
                        <ControlLabel >Username: </ControlLabel>
                        <FormControl
                            id={HTML_IDS.login_username}
                            type="text"
                        />
                        <ControlLabel >Password: </ControlLabel>
                        <FormControl
                            id={HTML_IDS.login_password}
                            type="password"
                        />
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={this.props.login}>Log In</button>
                </Modal.Footer>
            </Modal>
        );
    }
}