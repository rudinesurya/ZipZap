import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Segment, Header, Divider } from 'semantic-ui-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface LocationData {
    formattedAddress: string;
    placeId: string;
    lat: number;
    lng: number;
}

interface Job {
    _id: string;
    title: string;
    description: string;
    salary?: number;
    location?: LocationData;
}

interface RouteParams extends Record<string, string> {
    jobId: string;
}

const JobDetail: React.FC = () => {
    const { jobId } = useParams<RouteParams>();
    const [job, setJob] = useState<Job | null>(null);

    useEffect(() => {
        fetch(`${apiBaseUrl}/api/jobs/${jobId}`)
            .then((res) => res.json())
            .then((data) => setJob(data))
            .catch((err) => console.error(err));
    }, [jobId]);

    if (!job) {
        return <div>Loading...</div>;
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
