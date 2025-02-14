import React, { useEffect, useState } from 'react';
import { Form, Button, Message, Container } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { loginRequest } from '../redux/slices/authSlice';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        { name, value }: { name: string; value: string }
    ) => {
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginRequest({ email: credentials.email, password: credentials.password }));
    };

    // Redirect if logged in
    useEffect(() => {
        if (auth.token) {
            navigate('/');
        }
    }, [auth.token, navigate]);

    return (
        <Container style={{ marginTop: '2em' }}>
            <Form onSubmit={handleSubmit} error={!!auth.error}>
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
                {auth.error && <Message error header="Login Error" content={auth.error} />}
                <Button primary type="submit">Login</Button>
            </Form>
        </Container>
    );
};

export default Login;
