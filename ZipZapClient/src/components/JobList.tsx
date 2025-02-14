import React, { useState, useEffect } from 'react';
import { Card, Loader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface Job {
    _id: string;
    title: string;
    description: string;
    salary?: number;
}

const JobList: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { apiBaseUrl } = useSelector((state: RootState) => state.config);

    useEffect(() => {
        fetch(`${apiBaseUrl}/api/jobs`)
            .then((res) => res.json())
            .then((data) => {
                setJobs(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Loader active inline="centered" />;
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
