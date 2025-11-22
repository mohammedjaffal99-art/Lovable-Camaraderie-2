import Layout from "./Layout.jsx";

import Home from "./Home";

import BroadcasterProfile from "./BroadcasterProfile";

import Register from "./Register";

import Balance from "./Balance";

import AdminPanel from "./AdminPanel";

import PrivateSession from "./PrivateSession";

import Notifications from "./Notifications";

import BroadcasterDashboard from "./BroadcasterDashboard";

import Profile from "./Profile";

import About from "./About";

import Billing from "./Billing";

import Contact from "./Contact";

import CSAMPolicy from "./CSAMPolicy";

import DMCAPolicy from "./DMCAPolicy";

import NCCPolicy from "./NCCPolicy";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import ForWhoThisPlatformIs from "./ForWhoThisPlatformIs";

import FAQs from "./FAQs";

import BecomeAStreamer from "./BecomeAStreamer";

import StreamingGuide from "./StreamingGuide";

import StreamingDirectory from "./StreamingDirectory";

import MyFavorites from "./MyFavorites";

import AdvancedSearch from "./AdvancedSearch";

import WhosLive from "./WhosLive";

import Rankings from "./Rankings";

import TopStreamers from "./TopStreamers";

import News from "./News";

import WatchHistory from "./WatchHistory";

import ReportBugs from "./ReportBugs";

import AdminLogin from "./AdminLogin";

import ChangePassword from "./ChangePassword";

import BroadcasterOnboarding from "./BroadcasterOnboarding";

import ForYou from "./ForYou";

import DebugUser from "./DebugUser";

import payment-success from "./payment-success";

import payment-cancelled from "./payment-cancelled";

import SocialSuccess from "./SocialSuccess";

import PayoutSetup from "./PayoutSetup";

import AdminPayouts from "./AdminPayouts";

import AdminPayoutDashboard from "./AdminPayoutDashboard";

import PayoutsHub from "./PayoutsHub";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    BroadcasterProfile: BroadcasterProfile,
    
    Register: Register,
    
    Balance: Balance,
    
    AdminPanel: AdminPanel,
    
    PrivateSession: PrivateSession,
    
    Notifications: Notifications,
    
    BroadcasterDashboard: BroadcasterDashboard,
    
    Profile: Profile,
    
    About: About,
    
    Billing: Billing,
    
    Contact: Contact,
    
    CSAMPolicy: CSAMPolicy,
    
    DMCAPolicy: DMCAPolicy,
    
    NCCPolicy: NCCPolicy,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    ForWhoThisPlatformIs: ForWhoThisPlatformIs,
    
    FAQs: FAQs,
    
    BecomeAStreamer: BecomeAStreamer,
    
    StreamingGuide: StreamingGuide,
    
    StreamingDirectory: StreamingDirectory,
    
    MyFavorites: MyFavorites,
    
    AdvancedSearch: AdvancedSearch,
    
    WhosLive: WhosLive,
    
    Rankings: Rankings,
    
    TopStreamers: TopStreamers,
    
    News: News,
    
    WatchHistory: WatchHistory,
    
    ReportBugs: ReportBugs,
    
    AdminLogin: AdminLogin,
    
    ChangePassword: ChangePassword,
    
    BroadcasterOnboarding: BroadcasterOnboarding,
    
    ForYou: ForYou,
    
    DebugUser: DebugUser,
    
    payment-success: payment-success,
    
    payment-cancelled: payment-cancelled,
    
    SocialSuccess: SocialSuccess,
    
    PayoutSetup: PayoutSetup,
    
    AdminPayouts: AdminPayouts,
    
    AdminPayoutDashboard: AdminPayoutDashboard,
    
    PayoutsHub: PayoutsHub,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/BroadcasterProfile" element={<BroadcasterProfile />} />
                
                <Route path="/Register" element={<Register />} />
                
                <Route path="/Balance" element={<Balance />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/PrivateSession" element={<PrivateSession />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/BroadcasterDashboard" element={<BroadcasterDashboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/CSAMPolicy" element={<CSAMPolicy />} />
                
                <Route path="/DMCAPolicy" element={<DMCAPolicy />} />
                
                <Route path="/NCCPolicy" element={<NCCPolicy />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/ForWhoThisPlatformIs" element={<ForWhoThisPlatformIs />} />
                
                <Route path="/FAQs" element={<FAQs />} />
                
                <Route path="/BecomeAStreamer" element={<BecomeAStreamer />} />
                
                <Route path="/StreamingGuide" element={<StreamingGuide />} />
                
                <Route path="/StreamingDirectory" element={<StreamingDirectory />} />
                
                <Route path="/MyFavorites" element={<MyFavorites />} />
                
                <Route path="/AdvancedSearch" element={<AdvancedSearch />} />
                
                <Route path="/WhosLive" element={<WhosLive />} />
                
                <Route path="/Rankings" element={<Rankings />} />
                
                <Route path="/TopStreamers" element={<TopStreamers />} />
                
                <Route path="/News" element={<News />} />
                
                <Route path="/WatchHistory" element={<WatchHistory />} />
                
                <Route path="/ReportBugs" element={<ReportBugs />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/ChangePassword" element={<ChangePassword />} />
                
                <Route path="/BroadcasterOnboarding" element={<BroadcasterOnboarding />} />
                
                <Route path="/ForYou" element={<ForYou />} />
                
                <Route path="/DebugUser" element={<DebugUser />} />
                
                <Route path="/payment-success" element={<payment-success />} />
                
                <Route path="/payment-cancelled" element={<payment-cancelled />} />
                
                <Route path="/SocialSuccess" element={<SocialSuccess />} />
                
                <Route path="/PayoutSetup" element={<PayoutSetup />} />
                
                <Route path="/AdminPayouts" element={<AdminPayouts />} />
                
                <Route path="/AdminPayoutDashboard" element={<AdminPayoutDashboard />} />
                
                <Route path="/PayoutsHub" element={<PayoutsHub />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}