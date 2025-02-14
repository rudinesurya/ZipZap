import React from 'react';
import { Menu, Button } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { logoutRequest } from '../redux/slices/authSlice';

const NavBar: React.FC = () => {
    const { profile } = useSelector((state: RootState) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    return (
        <Menu fixed="top" inverted>
            <Menu.Item header as={Link} to="/">
                Job Portal
            </Menu.Item>
            <Menu.Menu position="right">
                {profile ? (
                    <>
                        <Menu.Item>Welcome, {profile.name}</Menu.Item>
                        <Menu.Item as={Link} to="/create-job">Create Job</Menu.Item>
                        <Menu.Item>
                            <Button color="red" onClick={() => { dispatch(logoutRequest()); navigate('/'); }}>
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
