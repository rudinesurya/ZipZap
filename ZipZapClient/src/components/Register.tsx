import React, { useState } from 'react';
import { Form, Button, Message, Container } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [userData, setUserData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        { name, value }: { name: string; value: string }
    ) => {
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async () => {
        console.log(JSON.stringify(userData));
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Registration failed');
            }
            const data = await res.json();
            const user = { name: userData.name };
            login(user, data.access_token);
            navigate('/');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <Container style={{ marginTop: '2em' }}>
            <Form onSubmit={handleSubmit} error={!!error}>
                <Form.Input
                    label="Name"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    required
                />
                <Form.Input
                    label="Email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />
                <Form.Input
                    label="Password"
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                />
                {error && <Message error header="Registration Error" content={error} />}
                <Button primary type="submit">Register</Button>
            </Form>
        </Container>
    );
};

export default Register;
