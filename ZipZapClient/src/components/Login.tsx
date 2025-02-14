import React, { useState } from 'react';
import { Form, Button, Message, Container } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        { name, value }: { name: string; value: string }
    ) => {
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Login failed');
            }
            const data = await res.json();
            // For simplicity, we use the email as the user's name.
            const user = { name: credentials.email };
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
                    label="Email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
                <Form.Input
                    label="Password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                {error && <Message error header="Login Error" content={error} />}
                <Button primary type="submit">Login</Button>
            </Form>
        </Container>
    );
};

export default Login;
