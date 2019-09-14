import { WithCurrentUserProps } from "../components/withCurrentUser";
import * as React from "react";
import "./Profile.scss";
import { Avatar, Typography, Button, Spin } from 'antd';
import { useState } from "react";
import { Redirect } from "react-router";
const { Title } = Typography;

export interface ProfileProps {
}

export const Profile: React.StatelessComponent<WithCurrentUserProps<ProfileProps>> = props => {
    const { currentUser, resetOnLogout, currentUserLoading } = props;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logOut = async () => {
        setIsLoggingOut(true);
        try {
            await fetch(`${process.env.REACT_APP_SERVER}/logout`, { method: "POST", mode: "cors", credentials: "include" });
        }
        catch (e) {
            console.error(e);
        }

        await resetOnLogout!();
        setIsLoggingOut(false);
    }

    if (currentUserLoading) {
        return <Spin spinning delay={500} className="middleSpinner" tip="Loading..." />
    }
    else if (!currentUser) {
        return <Redirect to="/" />;
    }
    return (
        <>
            <Title>{currentUser.name}</Title>
            <div className="profileContent">
                <Avatar className="profilePicture" size={200} src={currentUser.avatar || ""} shape="square" />
                <div className="profileActions">
                    <div>
                        <h3>Role</h3>
                        <span>{currentUser.role}</span>
                    </div>
                    <div>
                        <h3>Actions</h3>
                        <Button
                            type="primary"
                            icon="poweroff"
                            loading={isLoggingOut}
                            onClick={logOut}
                        >
                            Log out
                    </Button>
                    </div>
                </div>
            </div>
        </>

    );
};
