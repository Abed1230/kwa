import React from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { StringsConsumer } from '../contexts/StringsContext';
import { createStripeCheckoutSession } from '../MyCloudFunctions';
import MyStrings from '../MyStrings.js';
import { UserConsumer } from '../UserContext';
import { analytics } from '../FirebaseData.js';

const UnlockIcon = () => (
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" heigh="80" width="80" viewBox="0 0 512.65 512.65">
        <defs>
            <defs>
                <linearGradient id="grad" x1="0" y1="1" x2="0" y2="0">
                    <stop id="stop1" offset={1} stopColor="#1dc6e0" />
                    <stop id="stop3" offset={0} stopColor="#17a2b8" />
                </linearGradient>
            </defs>
        </defs>
        <path fill="url(#grad)" d="M409.925,205.45h-230.4v-74.24c0-38.4,25.6-71.68,61.44-79.36c48.64-7.68,92.16,28.16,92.16,76.8 c0,15.36,12.8,25.6,25.6,25.6c12.8,0,25.6-10.24,25.6-25.6c0-74.24-64-135.68-140.8-128c-66.56,7.68-115.2,66.56-115.2,133.12 v71.68h-25.6c-12.8,0-25.6,10.24-25.6,25.6v256c0,12.8,12.8,25.6,25.6,25.6h307.2c15.36,0,25.6-12.8,25.6-25.6v-256 C435.525,215.69,425.285,205.45,409.925,205.45z M281.925,376.97v33.28c0,15.36-10.24,25.6-25.6,25.6s-25.6-10.24-25.6-25.6 v-33.28c-15.36-10.24-25.6-25.6-25.6-43.52c0-33.28,30.72-56.32,64-48.64c17.92,5.12,33.28,20.48,38.4,38.4 C312.645,346.25,299.845,366.73,281.925,376.97z" /> </svg>
);

export const KEY_SHOULD_SHOW_PURCHASE_MODAL = "shouldShowPurchaseModal";

class PurchaseModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            checkoutError: null,
        };

        this.hideAndReset = this.hideAndReset.bind(this);
        this.checkout = this.checkout.bind(this);
    }

    hideAndReset(shouldOpenAddPartnerModal) {
        this.props.handleHide(shouldOpenAddPartnerModal ? true : false);
        setTimeout(() => {
            this.setState({
                loading: false,
                checkoutError: null
            });
        }, 500)
    }

    handleClick(user) {
        if (user) {
            this.checkout(user);
        }
    }

    async checkout(user) {
        this.setState({
            loading: true,
        });

        const sessionId = await createStripeCheckoutSession(
            user.uid,
            user.firstName + " " + user.lastName,
            user.email,
            user.partner ? user.partner.uid : null
        );

        if (!sessionId) {
            this.setState({
                loading: false,
                checkoutError: MyStrings.Errors.unknown
            });
            return;
        }

        const stripe = window.Stripe('pk_live_QWiSrSy2RSzTX9Z3lTANAxf000ahB4xIgQ');

        stripe.redirectToCheckout({
            sessionId: sessionId
        }).then(function (result) {
            if (result.error) {
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer.
                console.log("stripe error msg: " + result.error.message);
                this.setState({ checkoutError: result.error.message });
            }
            analytics.logEvent('begin_checkout', {
                items: ['Kärlekstanken Licens']
            });
        });
    }

    handleSignUpClick() {
        localStorage.setItem(KEY_SHOULD_SHOW_PURCHASE_MODAL, true);
    }

    render() {
        return (
            <UserConsumer>
                {user => {
                    const signedIn = user ? true : false;
                    return (
                        <Modal show={this.props.show} onHide={this.hideAndReset}>
                            <Modal.Header closeButton>
                                <Modal.Title>{MyStrings.PurchaseModal.title}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="text-center mb-4">
                                    <UnlockIcon />
                                </div>
                                <StringsConsumer>
                                    {strings => (
                                        <div dangerouslySetInnerHTML={{ __html: strings.purchaseModalHTML }} />
                                    )}
                                </StringsConsumer>
                            </Modal.Body>
                            <Modal.Footer>
                                <div className="mx-auto text-center">
                                    {signedIn ?
                                        <>
                                            {this.state.checkoutError &&
                                                <p className="text-danger mt-2" style={{ fontSize: "0.95rem" }}>{this.state.checkoutError}</p>
                                            }
                                            {this.state.loading ?
                                                <Spinner animation="border" style={{ color: "#6772E5" }} />
                                                :
                                                <Button disabled={!signedIn} onClick={this.handleClick.bind(this, user)} style={{ backgroundColor: "#6772E5", color: "#FFF", padding: "8px 12px", border: "0", borderRadius: "4px", fontSize: "1em" }}
                                                    id="checkout-button-sku_G9eu1VDO87OV9b"
                                                    role="link">
                                                    {MyStrings.PurchaseModal.checkoutBtn}
                                                </Button>
                                            }
                                            <br />
                                            <small className="text-muted">{MyStrings.PurchaseModal.byContinuing} <a href={MyStrings.licenseAndTermsUrl} target="_blank">{MyStrings.licenseAndTerms}</a> {MyStrings.and} <a href={MyStrings.privacyPolicyUrl} target="_blank">{MyStrings.privacyPolicy}</a></small>
                                        </>
                                        :
                                        <Alert variant="warning" className="mt-2">
                                            {MyStrings.PurchaseModal.notSignedIn + " "}
                                            <Link to="/signup" onClick={() => this.handleSignUpClick()}>{MyStrings.PurchaseModal.signUp}</Link>
                                        </Alert>
                                    }
                                </div>
                            </Modal.Footer>
                        </Modal>
                    );
                }}
            </UserConsumer>
        );
    }
}

export default PurchaseModal;