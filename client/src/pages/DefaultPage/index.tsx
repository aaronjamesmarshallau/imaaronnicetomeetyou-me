import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import profileUrl from '../../assets/profile.jpg';

const TwoColumnLayout = styled("div")`
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.background.primary};
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  color: ${({ theme }) => theme.foreground.primary};
  overflow: hidden;
`;

const Sidebar = styled("nav")`
  position: relative;
  left: -3px;
  top: -3px;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 3px solid ${({ theme }) => theme.highlight.primary};
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const Profile = styled("div")`
  margin: 40px 0 40px 40px;
  width: calc(100% - 80px);
  text-align: center;
`;

const ProfileImage = styled("img")`
  display: block;
  border: 3px solid ${({ theme }) => theme.highlight.primary};
  width: 100%;
  border-radius: 20px;
`;

export const DefaultPage: FunctionComponent = () => {
  return (
    <TwoColumnLayout>
      <Sidebar>
        <Profile>
          <ProfileImage src={profileUrl} />
          <h1>Aaron</h1>
          <p>Code. Tech. Other stuff.</p>
        </Profile>
      </Sidebar>
      <Outlet />
    </TwoColumnLayout>
  )
}