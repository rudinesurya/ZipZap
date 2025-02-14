import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
    const [job, setJob] = useState<JobFormData>({
        title: '',
        description: '',
        salary: '',
        formattedAddress: '',
        placeId: '',
        lat: '',
        lng: '',
    });
    const [error, setError] = useState<string>('');
    const { apiBaseUrl } = useSelector((state: RootState) => state.config);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        { name, value }: { name: string; value: string; }
    ) => {
        setJob({ ...job, [name]: value });
    };

    const handleSubmit = async () => {
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

        try {
            const res = await fetch(`${apiBaseUrl}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create job');
            }
            const createdJob = await res.json();
            navigate(`/jobs/${createdJob._id}`);
        } catch (err) {
            setError((err as Error).message);
        }
    };

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
