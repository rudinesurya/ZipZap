import React, { useEffect, useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { createJobRequest } from '../redux/slices/jobsSlice';

interface JobFormData {
    title: string;
    description: string;
    salary: string;
    formattedAddress: string;
    placeId: string;
    lat: string;
    lng: string;
}

const CreateJob: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);
    const { loading, error } = useSelector((state: RootState) => state.jobs);
    const [job, setJob] = useState<JobFormData>({
        title: '',
        description: '',
        salary: '',
        formattedAddress: '',
        placeId: '',
        lat: '',
        lng: '',
    });
    
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        { name, value }: { name: string; value: string; }
    ) => {
        setJob({ ...job, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: job.title,
            description: job.description,
            salary: job.salary ? Number(job.salary) : undefined,
            location: job.formattedAddress
                ? {
                    formattedAddress: job.formattedAddress,
                    placeId: job.placeId,
                    lat: Number(job.lat),
                    lng: Number(job.lng),
                }
                : undefined,
        };

        if (!auth.token) {
            // Ideally, you would redirect to login if the user is not authenticated.
            alert('You must be logged in to create a job');
            return;
        }

        // Dispatch the createJobRequest with the payload and token.
        dispatch(createJobRequest({ data: payload, token: auth.token }));
    };

    // Redirect to job detail page when a job is successfully created.
    // const { jobs } = useSelector((state: RootState) => state.jobs);
    // useEffect(() => {
    //     // Assuming the newly created job is appended at the end of the jobs array.
    //     if (jobs.length > 0 && !loading && !error) {
    //         const latestJob = jobs[jobs.length - 1];
    //         navigate(`/jobs/${latestJob._id}`);
    //     }
    // }, [jobs]);

    return (
        <Form onSubmit={handleSubmit} error={!!error}>
            <Form.Input
                label="Job Title"
                name="title"
                value={job.title}
                onChange={handleChange}
                required
            />
            <Form.TextArea
                label="Description"
                name="description"
                value={job.description}
                onChange={handleChange}
                required
            />
            <Form.Input
                label="Salary"
                name="salary"
                type="number"
                value={job.salary}
                onChange={handleChange}
            />
            <Form.Input
                label="Formatted Address"
                name="formattedAddress"
                value={job.formattedAddress}
                onChange={handleChange}
            />
            <Form.Input
                label="Place ID"
                name="placeId"
                value={job.placeId}
                onChange={handleChange}
            />
            <Form.Group widths="equal">
                <Form.Input
                    label="Latitude"
                    name="lat"
                    type="number"
                    value={job.lat}
                    onChange={handleChange}
                />
                <Form.Input
                    label="Longitude"
                    name="lng"
                    type="number"
                    value={job.lng}
                    onChange={handleChange}
                />
            </Form.Group>
            {error && <Message error header="Error" content={error} />}
            <Button primary type="submit">Create Job</Button>
        </Form>
    );
};

export default CreateJob;
