import React, { useState, useEffect } from 'react';
import { Card, Loader, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchJobsRequest } from '../redux/slices/jobsSlice';

const JobList: React.FC = () => {
    const dispatch = useDispatch();
    const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);

    useEffect(() => {
        dispatch(fetchJobsRequest());
    }, [dispatch]);
    
    if (loading) {
        return <Loader active inline="centered" />;
    }

    if (error) {
        return <Message error header="Error" content={error} />;
    }

    return (
        <Card.Group>
            {jobs.map((job) => (
                <Card key={job._id} as={Link} to={`/jobs/${job._id}`}>
                    <Card.Content>
                        <Card.Header>{job.title}</Card.Header>
                        <Card.Meta>{job.salary ? `$${job.salary}` : 'Salary not specified'}</Card.Meta>
                        <Card.Description>{job.description.substring(0, 100)}...</Card.Description>
                    </Card.Content>
                </Card>
            ))}
        </Card.Group>
    );
};

export default JobList;
