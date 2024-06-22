import {useState,useEffect} from "react";

const LoginForm = ({
    handleSubmit,
    handleUsernameChange,
    handlePasswordChange,
    username,
    password,
    newUsername,
    newPassword,
    handleNewUsernameChange,
    handleNewPasswordChange,
    handleCreateUser

}) => {


    const [showLogin, setShowLogin] = useState(true);
    const toggleForm = () => {
        setShowLogin(!showLogin);
    };

    return (
        <div>
            {showLogin ? (
                <div>
                    <h2 style={{textAlign:"center"}}>Event Finder login</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            Username: &nbsp;
                            <input
                                type="text"
                                value={username}
                                name="Username"
                                onChange={handleUsernameChange}
                            />
                        </div>
                        <div>
                            Password:  &ensp;
                            <input
                                type="password"
                                value={password}
                                name="Password"
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <br/>
                        <button type="submit">Login</button> <br />
                        <br />
                        <button onClick={toggleForm}>Create an account</button>
                    </form>
                </div>
            ) : (
                <div>
                    <form onSubmit={handleCreateUser}>
                        <div>
                            <h2>Create an account</h2>
                            <div>
                                Username: &nbsp;
                                <input
                                    type="text"
                                    value={newUsername}
                                    name="New Username"
                                    onChange={handleNewUsernameChange}
                                />
                            </div>
                            <div>
                                Password:  &ensp;
                                <input
                                    type="password"
                                    value={newPassword}
                                    name="New Password"
                                    onChange={handleNewPasswordChange}
                                />
                            </div>
                            <br/>
                            <button type="submit">Create your account</button>
                        </div>
                        <br/>
                        <button onClick={toggleForm}>Back to login form</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginForm;
