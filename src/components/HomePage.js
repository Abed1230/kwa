import React from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChaptersConsumer } from '../contexts/ChaptersContext';
import { CoupleDataConsumer } from '../CoupleDataContext';
import { auth, analytics } from '../FirebaseData';
import MyStrings from '../MyStrings.js';
import { UserConsumer } from '../UserContext';
import { isInStandaloneMode } from '../UtilFunctions';
import InstallationGuideModal from './InstallationGuide/InstallationGuideModal';
import InstallBanner from './InstallationGuide/InstallBanner';
import ListCard from './ListCard';
import MyNavBar from './MyNavBar';
import PurchaseBanner from './PurchaseBanner/PurchaseBanner';
import { KEY_SHOULD_SHOW_PURCHASE_MODAL } from './PurchaseModal';
import PurchaseModal from './PurchaseModal';
import TransparentButton from "./TransparentButton";
import HomeGuide from './HomeGuide.js';

const HeartProgressBar = ({ value }) => {
    value = (value < 0) ? 0 : (value > 1) ? 1 : value;
    const textValue = Math.trunc(value * 100);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="94" height="94" viewBox="0 0 24 24">
            <defs>
                <linearGradient id="progress" x1="0" y1="1" x2="0" y2="0">
                    <stop id="stop1" offset={value} stopColor="#e53935" />
                    <stop id="stop2" offset={value} stopColor="#e53935" stopOpacity="0.7" />
                </linearGradient>
            </defs>
            <g>
                <path fill="url(#progress)" d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
                <text x="12" y="12" textAnchor="middle" alignmentBaseline="central" fontWeight="bold" fill="#B71C1C" fontSize="5">{textValue}%</text>
            </g>
        </svg>
    );
};

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showPurchaseModal: false,
            showInstallationGuideModal: false,
            showInstallationBanner: !localStorage.getItem("hideInstallationBanner"),
            showGuide: !localStorage.getItem("hideGuide")
        };

        this.handleCheck = this.handleCheck.bind(this);
        this.showPurchaseModal = this.showPurchaseModal.bind(this);
        this.hideInstallationBanner = this.hideInstallationBanner.bind(this);
        this.onFirstChapterRefChange = this.onFirstChapterRefChange.bind(this);
        this.hideGuide = this.hideGuide.bind(this);
    }

    handleCheck(user, coupleData, chapter) {
        const coupleDataRef = user && user.coupleDataRef;
        if (!coupleDataRef || !coupleData) return;

        const completed = !this.isChapterComplete(coupleData, chapter.id);

        const data = {
            [`completionStatus.${chapter.id}.completed`]: completed
        }

        chapter.taskIds.forEach((id) => {
            data[`completionStatus.${chapter.id}.tasks.${id}`] = completed;
        });

        coupleDataRef.update(data);
    }

    isChapterComplete(coupleData, chapId) {
        const completionStatus = coupleData && coupleData.completionStatus;

        if (completionStatus && completionStatus[chapId] && completionStatus[chapId].completed) {
            return completionStatus[chapId].completed;
        }

        return false;
    }

    calculateProgressValue(chapters, coupleData) {
        // get total number of tasks
        const taskIds = [];
        let numTasks = 0;
        chapters.forEach((chap) => {
            if (chap.taskIds) {
                numTasks += chap.taskIds.length;
                taskIds.push.apply(taskIds, chap.taskIds);
            }
        });

        // get number of completed tasks
        let numCompletedTasks = 0;
        const completionStatus = coupleData.completionStatus;
        if (completionStatus) {
            Object.keys(completionStatus).forEach((key) => {
                const tasks = completionStatus[key].tasks;
                if (tasks) {
                    for (const [id, completed] of Object.entries(tasks)) {
                        // Ignores completed tasks that have been deleted
                        if (completed && taskIds.includes(id)) {
                            numCompletedTasks++;
                        }
                    }
                }
            });
        }

        if ((numCompletedTasks === 0 && numTasks === 0) || (numCompletedTasks === 1 && numTasks === 0)) {
            return 0;
        }

        return (numCompletedTasks / numTasks);
    }

    handleClick(chapter, user) {
        const premiumUser = user && user.premium;
        if (chapter.premium && !premiumUser) {
            this.showPurchaseModal();
            return;
        }

        this.props.history.push({ pathname: "/chapter", state: { chapter: chapter } })
    }

    showPurchaseModal() {
        analytics.logEvent('view_item', { items: ['Kärlekstanken Licens'] });
        this.setState({ showPurchaseModal: true });
    }

    hideInstallationBanner(e) {
        e.stopPropagation();
        localStorage.setItem("hideInstallationBanner", true);
        this.setState({ showInstallationBanner: false });
    }

    onFirstChapterRefChange(node) {
        if (node) {
            const rect = node.getBoundingClientRect();
            const firstChapterCoordinates = {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height
            }
            this.setState({ firstChapterCoordinates: firstChapterCoordinates })
        }
    }

    hideGuide() {
        localStorage.setItem("hideGuide", true);
        this.setState({ showGuide: false });
    }

    handleHideGuide(e, firstChapter) {
        if (e.target.attributes['data-tag'] &&
            e.target.attributes['data-tag'].value === "chapter") {
            // 1. hide spotlight
            this.hideGuide();
            // 2. open first chapter
            this.handleClick(firstChapter);
            console.log("chapter clicked");
        } else {
            this.hideGuide();
        }
    }

    componentDidMount() {
        this.mounted = true;
        const shouldShowPurchaseModal = localStorage.getItem(KEY_SHOULD_SHOW_PURCHASE_MODAL);
        if (shouldShowPurchaseModal) {
            this.setState({
                showPurchaseModal: true
            });
            localStorage.removeItem(KEY_SHOULD_SHOW_PURCHASE_MODAL);
        }
        //localStorage.clear();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const signedOut = auth.currentUser ? false : true;
        const showInstallationBanner = this.state.showInstallationBanner && !isInStandaloneMode();
        return (
            <>
                <MyNavBar onRef={ref => (this.myNavBar = ref)} />
                <ChaptersConsumer>
                    {chapters => (
                        <UserConsumer>
                            {user => {
                                return (
                                    <CoupleDataConsumer>
                                        {coupleData => {
                                            const showUnlockMsg = user ? !user.premium : true;
                                            const firstChapterCoordinates = this.state.firstChapterCoordinates;
                                            return (
                                                <div>
                                                    {signedOut &&
                                                        <div className="p-1 bg-warning sticky-top text-center" style={{ top: "60px", zIndex: "1" }}>
                                                            {MyStrings.signedOut}
                                                            <Link className="ml-2 mr-2" to="/signin">{MyStrings.signIn}</Link>
                                                            |
                                                            <Link className="ml-2" to="/signup">{MyStrings.createAccount}</Link>
                                                        </div>}
                                                    <div className="sticky-top text-center mt-3" style={{ top: signedOut ? "100px" : "78px", zIndex: "1" }}>
                                                        <HeartProgressBar value={chapters && coupleData ? this.calculateProgressValue(chapters, coupleData) : 0} />
                                                    </div>
                                                    <Container id="container" className="mt-4" style={showUnlockMsg ? { paddingBottom: "130px" } : showInstallationBanner ? { paddingBottom: "80px" } : { paddingBottom: "15px" }}>
                                                        {user && user.premium && !user.partner &&
                                                            <Row className="mb-4 justify-content-center">
                                                                <Col xs="12" md="8" lg="6">
                                                                    <Alert variant="info" >
                                                                        {MyStrings.AddPartnerAlert.text}
                                                                        <br />
                                                                        <TransparentButton className="text-primary" onClick={() => this.myNavBar.openAddPartnerModal(true)}>{MyStrings.AddPartnerAlert.addBtn}</TransparentButton>
                                                                    </Alert>
                                                                </Col>
                                                            </Row>
                                                        }
                                                        {showUnlockMsg &&
                                                            <PurchaseBanner handleClick={this.showPurchaseModal} />
                                                        }
                                                        <Row>
                                                            {chapters ?
                                                                chapters.map((item, index) => {
                                                                    const premiumUser = user && user.premium;
                                                                    const enableCheck = item.premium ? coupleData && premiumUser : Boolean(coupleData);
                                                                    return (
                                                                        <Col key={item.id} className="mb-3" xs="12" md="6" lg="4">
                                                                            <ListCard
                                                                                ref={index === 0 ? this.onFirstChapterRefChange : null}
                                                                                subhead={item.subHead}
                                                                                title={item.title}
                                                                                disabled={item.premium && !premiumUser}
                                                                                enableCheck={enableCheck}
                                                                                complete={this.isChapterComplete(coupleData, item.id)}
                                                                                tasksCount={item.taskIds && item.taskIds.length}
                                                                                handleClick={() => this.handleClick(item, user)}
                                                                                handleCheck={() => this.handleCheck(user, coupleData, item)} />
                                                                        </Col>
                                                                    );
                                                                })
                                                                :
                                                                [...Array(10)].map((item, index) => (
                                                                    <Col key={index} className="mb-3" xs="12" md="6" lg="4">
                                                                        <div className="rounded" style={{ height: "110px", backgroundColor: "#f0f0f0" }} />
                                                                    </Col>
                                                                ))
                                                            }
                                                        </Row>
                                                    </Container>
                                                    <PurchaseModal
                                                        show={this.state.showPurchaseModal}
                                                        handleHide={(shouldOpenAddPartnerModal) => {
                                                            this.setState({ showPurchaseModal: false });
                                                            if (shouldOpenAddPartnerModal)
                                                                this.myNavBar.openAddPartnerModal(false);
                                                        }}
                                                        numChapters={chapters && chapters.length} />
                                                    {this.state.showGuide && firstChapterCoordinates &&
                                                        <HomeGuide
                                                            top={firstChapterCoordinates.top}
                                                            left={firstChapterCoordinates.left}
                                                            width={firstChapterCoordinates.width}
                                                            height={firstChapterCoordinates.height}
                                                            handleClick={(e) => this.handleHideGuide(e, chapters[0])} />
                                                    }
                                                </div>
                                            )
                                        }}
                                    </CoupleDataConsumer>
                                )
                            }}
                        </UserConsumer>
                    )}
                </ChaptersConsumer>
                {showInstallationBanner &&
                    <InstallBanner
                        handleClick={() => this.setState({ showInstallationGuideModal: true })}
                        handleClose={(e) => this.hideInstallationBanner(e)}
                    />
                }
                <InstallationGuideModal
                    show={this.state.showInstallationGuideModal}
                    handleHide={() => this.setState({ showInstallationGuideModal: false })}
                />
            </>
        );
    }
}

export default Home;