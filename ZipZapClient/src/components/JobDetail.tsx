import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Segment, Header, Divider, Loader, Message } from 'semantic-ui-react';
import { RootState } from '../redux/store';
import { fetchJobRequest } from '../redux/slices/jobsSlice';

interface RouteParams extends Record<string, string> {
    jobId: string;
}

const JobDetail: React.FC = () => {
    const { jobId } = useParams<RouteParams>();
    const dispatch = useDispatch();
    const { selectedJob: job, loading, error } = useSelector((state: RootState) => state.jobs);

    useEffect(() => {
        if (jobId) {
            dispatch(fetchJobRequest(jobId));
        }
    }, [dispatch, jobId]);

    if (loading || !job) {
        return <Loader active inline="centered" />;
    }

    if (error) {
        return <Message error header="Error" content={error} />;
    }

    return (
        <Segment>
            <Header as="h2">{job.title}</Header>
            <p>{job.description}</p>
            {job.salary && <p><strong>Salary:</strong> ${job.salary}</p>}
            {job.location && (
                <>
                    <Divider />
                    <Header as="h4">Location</Header>
                    <p>{job.location.formattedAddress}</p>
                    <p>
                        Coordinates: {job.location.lat}, {job.location.lng}
                    </p>
                    <p><strong>Place ID:</strong> {job.location.placeId}</p>
                </>
            )}
        </Segment>
    );
};

export default JobDetail;
