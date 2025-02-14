import React, { useEffect, useState } from 'react';
import { Form, Button, Message, Container } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { registerRequest } from '../redux/slices/authSlice';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);
    const [userData, setUserData] = useState({ name: '', email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(registerRequest(userData));
    };

    useEffect(() => {
        if (auth.token) {
            navigate('/');
        }
    }, [auth.token, navigate]);

    return (
        <Container style={{ marginTop: '2em' }}>
            <Form onSubmit={handleSubmit} error={!!auth.error}>
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
                {auth.error && <Message error header="Registration Error" content={auth.error} />}
                <Button primary type="submit">Register</Button>
            </Form>
        </Container>
    );
};

export default Register;
