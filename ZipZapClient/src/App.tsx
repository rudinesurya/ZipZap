import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import JobList from './components/JobList';
import JobDetail from './components/JobDetail';
import CreateJob from './components/CreateJob';
import Login from './components/Login';
import Register from './components/Register';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConfigRequest } from "./redux/slices/configSlice";
import { fetchUserProfileRequest } from "./redux/slices/usersSlice";
import { RootState } from "./redux/store";

const App: React.FC = () => {
    const dispatch = useDispatch();
    const apiBaseUrl = useSelector((state: RootState) => state.config.apiBaseUrl);
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        // Dispatch an action to load the configuration.
        dispatch(fetchConfigRequest());
    }, [dispatch]);

    useEffect(() => {
        if (apiBaseUrl && token) {
            dispatch(fetchUserProfileRequest());
        }
    }, [apiBaseUrl, token, dispatch]);

    return (
        <Router>
            <NavBar />
            <div className="ui container" style={{ marginTop: '7em' }}>
                <Routes>
                    <Route path="/" element={<JobList />} />
                    <Route path="/jobs/:jobId" element={<JobDetail />} />
                    <Route path="/create-job" element={<CreateJob />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;