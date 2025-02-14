import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import JobList from './components/JobList';
import JobDetail from './components/JobDetail';
import CreateJob from './components/CreateJob';
import Login from './components/Login';
import Register from './components/Register';
import { useDispatch } from 'react-redux';
import { fetchConfigRequest } from "./redux/slices/configSlice";

const App: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Dispatch an action to load the configuration.
        dispatch(fetchConfigRequest());
    }, [dispatch]);

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