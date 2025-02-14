import React from 'react';
import { Menu, Button } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    return (
        <Menu fixed="top" inverted>
            <Menu.Item header as={Link} to="/">
                Job Portal
            </Menu.Item>
            <Menu.Menu position="right">
                {user ? (
                    <>
                        <Menu.Item>Welcome, {user.name}</Menu.Item>
                        <Menu.Item as={Link} to="/create-job">Create Job</Menu.Item>
                        <Menu.Item>
                            <Button color="red" onClick={() => { logout(); navigate('/'); }}>
                                Logout
                            </Button>
                        </Menu.Item>
                    </>
                ) : (
                    <>
                        <Menu.Item as={Link} to="/register">
                            <Button primary>Register</Button>
                        </Menu.Item>
                        <Menu.Item as={Link} to="/login">
                            <Button secondary>Login</Button>
                        </Menu.Item>
                    </>
                )}
            </Menu.Menu>
        </Menu>
    );
};

export default NavBar;
