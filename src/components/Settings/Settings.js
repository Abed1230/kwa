import React from 'react';
import MyTitleBar from '../MyTitleBar';
import { Spinner, Form, Modal, Row, Col, Container, Card, Dropdown, Button, Alert } from 'react-bootstrap';
import { UserConsumer } from '../../UserContext';
import strftime from 'strftime';
import ChangePasswordModal from './ChangePasswordModal';
import RemovePartnerModal from './RemovePartnerModal';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            success: false,
            changePasswordFormValidated: false,
            showChangePasswordModal: false,
            showRemovePartnerModal: false,
            showDeleteAccountModal: false,
        };

        this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    }

    timeStampToDateString(ts) {
        return strftime('%F %T', ts.toDate());
    }

    handleDeleteAccount(event) {
        event.preventDefault();
        event.stopPropagation();

        // TODO: call delete account cloud function
        this.setState({ loading: true });
    }

    render() {
        return (
            <>
                <MyTitleBar title="Inställningar" />
                <UserConsumer>
                    {user => {
                        return user ?
                            (
                                <Container>
                                    <Row>
                                        <Col className="mt-4" md="6">
                                            <Card>
                                                <Card.Body>
                                                    <h5 className="text-center">Inloggad som</h5>
                                                    <p>
                                                        {user.firstName + " " + user.lastName}
                                                        <br />
                                                        E-postaddress: {user.email}
                                                    </p>

                                                    <Dropdown.Divider className="mt-3" />
                                                    <span><strong>Partner</strong></span>
                                                    {user.partner ?
                                                        <p>
                                                            {user.partner.name}
                                                            <br />
                                                            E-postaddress: {user.partner.email}
                                                        </p>
                                                        :
                                                        <p>Du har inte laggt till någon partner ännu</p>
                                                    }

                                                    <Dropdown.Divider className="mt-3" />
                                                    <span><strong>Licens</strong></span>
                                                    {user.premium ?
                                                        <p>
                                                            Sedan {this.timeStampToDateString(user.premium.since)}
                                                            <br />
                                                            <mark>Upphör att gälla {this.timeStampToDateString(user.premium.expiry)}</mark>
                                                        </p>
                                                        :
                                                        <p>Du har ingen licens</p>
                                                    }
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col className="mt-4" md="6">
                                            <Button className="mb-4" variant="light" block onClick={() => this.setState({ showChangePasswordModal: true })}>Ändra lösenord</Button>
                                            {!user.premium && user.partner &&
                                                <>
                                                    <Button variant="outline-danger" block onClick={() => this.setState({ showRemovePartnerModal: true })}>Ta bort partner</Button>
                                                    <small className="mt-2 text-muted" /* style={{ fontSize: "0.95rem" }} */>Observera att du inte kan ta bort din partner när du har licens</small>
                                                </>
                                            }
                                            <Dropdown.Divider />
                                            <Button className="mt-3 mb-3" variant="danger" onClick={() => this.setState({ showDeleteAccountModal: true })}>Avsluta konto</Button>
                                            {/* <p className="mt-2 text-muted" style={{ fontSize: "0.95rem" }}>Observera att om du har partner avslutas/tas bort dennes konto även. Om du har köpt license upphör den att gälla</p> */}
                                        </Col>
                                    </Row>

                                    <ChangePasswordModal show={this.state.showChangePasswordModal} handleHide={() => this.setState({ showChangePasswordModal: false })} />

                                    <RemovePartnerModal show={this.state.showRemovePartnerModal} user={user} handleHide={() => this.setState({ showRemovePartnerModal: false })} />
                                    
                                    {/* ------ Delete Account Modal ------ */}
                                    <Modal show={this.state.showDeleteAccountModal} onHide={() => this.setState({ showDeleteAccountModal: false })}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                {user.partner && user.premium ?
                                                    "Är du säker på att du vill avsluta/ta bort ditt konto och " + user.partner.name + "'s konto?"
                                                    :
                                                    "Är du säker på att du vill avsluta/ta bort ditt konto?"
                                                }
                                            </Modal.Title>
                                        </Modal.Header>
                                        {user.partner && user.premium ?
                                            <Modal.Body>
                                                <p className="text-danger">Observera att om du avslutar ditt konto avslutas även din partners konto. Er licens upphör också att gälla. Detta har omedelbar verkan och kan inte ångras!</p>
                                                <Form onSubmit={this.handleDeleteAccount}>
                                                    <Form.Check required type="checkbox" label={"Jag bekräftar att jag vill avsluta mitt och " + user.partner.name + "'s konto"} />
                                                    <hr />
                                                    <div className="text-right">
                                                        {this.state.loading ?
                                                            <Spinner animation="border" variant="info" />
                                                            :
                                                            <>
                                                                <Button className="mr-2" variant="danger" type="submit">Avsluta</Button>
                                                                <Button variant="info" onClick={() => this.setState({ showDeleteAccountModal: false })}>Avbryt</Button>
                                                            </>
                                                        }
                                                    </div>
                                                </Form>
                                            </Modal.Body>
                                            :
                                            <Modal.Footer>
                                                {this.state.loading ?
                                                    <Spinner animation="border" variant="info" />
                                                    :
                                                    <>
                                                        <Button className="mr-2" variant="danger" onClick={this.handleDeleteAccount}>Avsluta</Button>
                                                        <Button variant="info" onClick={() => this.setState({ showDeleteAccountModal: false })}>Avbryt</Button>
                                                    </>
                                                }
                                            </Modal.Footer>
                                        }
                                    </Modal>
                                </Container>
                            )
                            :
                            null
                    }
                    }
                </UserConsumer>
            </>
        );
    }
}

export default Settings;