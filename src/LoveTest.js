import React, { Component } from 'react';
import { getQuestions, calculateResults, sum } from "./LoveLanguage";
import { Spinner, Row, Col, Form, Button, Container, Card, Dropdown } from "react-bootstrap";
import { UserConsumer } from './UserContext';
import { Redirect } from 'react-router-dom';
import LoveLanguages from './LoveLanguages.json';
import MyTitleBar from './components/MyTitleBar';
import MyStrings from './MyStrings.js';

class Answers {
    constructor(props) {
        this.alt1Value = [];
        this.alt2Value = [];

        for (let i = 0; i < sum; i++) {
            this.alt1Value.push(false);
            this.alt2Value.push(false);
            //console.log(this.value[i]);
        }
    }
}

export class LoveTest extends Component {

    constructor(props) {
        super(props);
        this.answers = new Answers();

        this.state = {
            lang: null,
            errorMessage: null,
            loading: false,
            notCompleteIndexes: []
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setAnswerAlt1(index) {
        let newValue;
        let currentValue = this.answers.alt1Value[index];
        newValue = !currentValue;

        this.answers.alt1Value[index] = newValue;
        this.answers.alt2Value[index] = !newValue;
        //console.log("New Value" + newValue);

        this.setState({});
    }

    setAnswerAlt2(index) {
        let newValue;
        let currentValue = this.answers.alt2Value[index];
        newValue = !currentValue;

        this.answers.alt2Value[index] = newValue;
        this.answers.alt1Value[index] = !newValue;
        //console.log("New Value" + newValue);

        this.setState({});
    }

    handleSubmit(user) {
        const result = calculateResults(this.answers.alt1Value, this.answers.alt2Value, user);
        if (result.lang) {
            this.setState({ loading: true, errorMessage: null, notCompleteIndexes: [] });
            setTimeout(() => {
                this.setState({
                    lang: result.lang
                });
            }, 2000);
        } else {
            this.setState({
                errorMessage: MyStrings.LoveLanguageTest.testNotComplete,
                notCompleteIndexes: result.notCompleteIndexes
            })
        }
    }

    render() {
        const lang = this.state.lang;
        if (lang) {
            return (
                <>
                    <MyTitleBar title={MyStrings.LoveLanguageTest.title} />
                    <Container>
                        <Row className="mt-5 mb-4 justify-content-md-center">
                            <Col md="6" lg="9" className="text-center">
                                <h6 className="mb-3">{MyStrings.yourLoveLang}</h6>
                                <Dropdown.Divider />
                                <h4>{LoveLanguages[lang].name} ({lang})</h4>
                                <p className="mt-2">{LoveLanguages[lang].description}</p>
                                <Button className="mt-3 mb-2" variant="info" onClick={() => this.props.history.replace("/")}>Stäng</Button>
                                <br />
                                <small className="text-muted">{MyStrings.LoveLanguageTest.langSaved}</small>
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }
        return (
            <UserConsumer>
                {user => {
                    return user && user.premium ?
                        <>
                            <MyTitleBar title={MyStrings.LoveLanguageTest.title} />
                            <Container className="mt-4">
                                <Row className="mb-5">
                                    <Col>
                                        <p className="lead">{MyStrings.LoveLanguageTest.instructions}</p>
                                    </Col>
                                </Row>
                                {
                                    getQuestions().map((q, index) => {
                                        let a1 = this.answers.alt1Value[q.index];
                                        let a2 = this.answers.alt2Value[q.index];
                                        //console.log(q.index + "   " + a1);
                                        //console.log(q.index + "   " + a2);
                                        return (
                                            <Row key={index} className="mb-3 justify-content-center">
                                                <Col className="d-flex align-items-center justify-content-center" xs="1">
                                                    <h5 className="text-info">{index + 1}</h5>
                                                </Col>
                                                <Col className="" xs="12" md="10" lg="8">
                                                    <Card key={index} style={this.state.notCompleteIndexes.includes(index) ? { borderColor: "#dc3545" } : { borderTop: "2px solid #008B8B" }} >
                                                        {/* <h5 className="text-left" style={{ borderRadius: "3px", backgroundColor: "#008B8B", padding: "4px", color: "white" }}>{'' + (q.index + 1)}</h5> */}
                                                        {/*  <div className="text-center pt-2 bg-light text-info" /* style={{background: "linear-gradient(to left, #36D1DC, #5B86E5)"}}>
                                                            <h6>{index + 1}</h6>
                                                        </div> */}
                                                        <Card.Body className="p-3">
                                                            <Row>
                                                                <Col>
                                                                    <p>{q.alt1}</p>
                                                                </Col>
                                                                <Col xs='2'>
                                                                    <Form.Check
                                                                        className="text-right"
                                                                        custom
                                                                        id={"q" + q.index + "alt1"}
                                                                        label=""
                                                                        type="checkbox"
                                                                        name="check1"
                                                                        checked={a1}
                                                                        onChange={this.setAnswerAlt1.bind(this, q.index)} />
                                                                    {/*<p>{a1.toString()}</p>*/}
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col>
                                                                    <p>{q.alt2}</p>
                                                                </Col>
                                                                <Col xs='2'>
                                                                    <Form.Check
                                                                        className="text-right"
                                                                        custom
                                                                        id={"q" + q.index + "alt2"}
                                                                        label=""
                                                                        type="checkbox" name="check2"
                                                                        checked={a2}
                                                                        onChange={this.setAnswerAlt2.bind(this, q.index)} />
                                                                    {/*<p>{a2.toString()}</p>*/}
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        )
                                    })
                                }
                                <Row className="text-center mt-4 mb-4">
                                    <Col className="mx-auto" xs="12" lg="8">
                                        {this.state.errorMessage &&
                                            <>
                                                <span className="mt-3 text-danger">{this.state.errorMessage}</span>
                                                <br />
                                                <br />
                                            </>

                                        }
                                        {this.state.loading ?
                                            <Spinner animation="border" variant="info" />
                                            :
                                            <Button type="button" variant="info" size="md" onClick={() => this.handleSubmit(user)}>{MyStrings.LoveLanguageTest.submitBtn}</Button>
                                        }
                                    </Col>
                                </Row>
                            </Container>
                        </>
                        :
                        <Redirect to="/" />
                }
                }
            </UserConsumer >
        )
    }
}

export default LoveTest
