import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { fire, db } from './FirebaseData.js';
import { Button, Container, Row, Col, Card, Form } from 'react-bootstrap';
import loginImg from './assets/login_page.jpg';
import { Formik } from 'formik';
import *as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('Vänligen, skriv in ett förnamn'),
    lastName: Yup.string()
        .required('Vänligen, skriv in ett efternamn'),
    email: Yup.string()
        .email('Ogiltig Email adress')
        .required('Vänligen, skriv in ditt Email'),
    password: Yup.string()
        .min(6, 'Lösenordet måste bestå av minst 6 tecken')
        .required('Vänligen, skriv in ditt lösenord'),
});

export class Register extends Component {
    constructor(props) {
        super(props)

        this.signup = this.signup.bind(this);
    }

    signup(values) {
        //e.preventDefault();
        fire.auth().createUserWithEmailAndPassword(values.email, values.password).then((u) => {
            this.addUserToDocument(u.user.uid);
        }).catch((error) => {
            console.log(error);
        });
    }

    addUserToDocument(uid) {
        // Add a new document in collection "users"
        db.collection("users").doc(uid).set({
            email: this.state.email,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
        })
    }

    render() {

        return (
            <div style={{ backgroundImage: `url(${loginImg})`, backgroundSize: ('cover'), backgroundAttachment: ('fixed') }}>
                <Container style={{ marginTop: 20, height: 800 }}>
                    <Row className="justify-content-center">
                        <Card style={{ width: 500, marginTop: 40, borderRadius: 10, opacity: 0.90, padding: 40 }}>
                            <div style={{ padding: 5, position: ('absolute'), borderRadius: 5, margin: -40, opacity: 0.90, width: ('100%'), backgroundColor: ('blue') }}>
                                <h4 style={{ color: ('white') }} className="text-center">Registrera</h4>
                            </div>
                            <div style={{ padding: 10 }}></div>

                            <Row className="justify-content-center">
                                <Formik
                                    initialValues={{ email: '', password: '' }}
                                    validationSchema={RegisterSchema}
                                    onSubmit={this.signup}
                                >
                                    {({ handleSubmit, handleChange, values, errors }) =>
                                        (<Form noValidate={true} onSubmit={handleSubmit}>
                                            <Row>
                                                <Col>
                                                    <Form.Group controlId="firstNameForm">
                                                        <Form.Label className="text-muted">
                                                            Förnamn
                                                        </Form.Label>
                                                        <Form.Control type="text" name="firstName" placeholder="Förnamn" value={values.firstName} isInvalid={!!errors.firstName} onChange={handleChange} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.firstName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col>
                                                    <Form.Group controlId="lastNameForm">
                                                        <Form.Label className="text-muted">
                                                            Efternamn
                                                        </Form.Label>
                                                        <Form.Control required type="text" name="lastName" placeholder="Efternamn" value={values.lastName} isInvalid={!!errors.lastName} onChange={handleChange} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.lastName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col>
                                                    <Form.Group controlId="emailForm">
                                                        <Form.Label className="text-muted">
                                                            Email
                                                        </Form.Label>
                                                        <Form.Control type="email" name="email" placeholder="Email" value={values.email} isInvalid={!!errors.email} onChange={handleChange} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.email}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col>
                                                    <Form.Group controlId="passwordForm">
                                                        <Form.Label className="text-muted">
                                                            Lösenord
                                                        </Form.Label>
                                                        <Form.Control required type="password" name="password" placeholder="Lösenord" value={values.password} isInvalid={!!errors.password} onChange={handleChange} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="justify-content-center">
                                                <Col className="text-center">
                                                    <Button style={{ width: 200 }} type="submit">Registrera</Button>
                                                </Col>
                                            </Row>
                                            <Row className="justify-content-center">
                                                <small style={{ marginBottom: 10 }}><Link className="text-center" to='signin'>Inget konto? Registrera dig här</Link></small>
                                            </Row>
                                        </Form>)
                                    }
                                </Formik>
                            </Row>
                        </Card>
                    </Row>

                </Container >
            </div>
        )
    }
}

export default Register