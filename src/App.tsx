import styled from "styled-components";
import "./App.css";
import { Link, BrowserRouter as Router } from "react-router-dom";
import { NameCardBackground } from "./NameCardBackground";
import { useState } from "react";

const Frame = styled("div")`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 60px 1fr;
`;

const Header = styled("div")`
  width: 100%;
  height: 60px;
  text-align: right;
  box-sizing: border-box;
`;

const HeaderContent = styled("div")`
  max-width: 1080px;
  width: 100%;
  margin: auto;
`;

const Navigation = styled("nav")``;

const Content = styled("div")`
  height: 100%;
  width: 100%;
`;

const NameCard = styled("div")`
  height: 500px;
  width: 100%;
  text-align: center;
  padding-top: 60px;
  padding-bottom: 60px;
  box-sizing: border-box;
  position: relative;
`;

const NameCardContent = styled("div")`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  padding-top: 60px;
  padding-bottom: 60px;
  box-sizing: border-box;
`;

const Name = styled("span")`
  display: block;
  font-size: 108pt;
  font-family: Josefin Sans;
  z-index: 10;
  line-height: 190px;
`;

const NavItem = styled(Link)`
  text-decoration: none;
  color: black;
  text-transform: uppercase;
  font-family: Josefin Sans;
  border-bottom: 2px solid #000;
  margin-left: 10px;
  line-height: 60px;
`;

const Experience = styled("div")`
  width: 100%;
  border-radius: 20px;
  box-shadow: 5px 5px 15px -3px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  margin: auto;
  min-height: 600px;
  background-color: #fff;
  padding: 30px;
`;

const ExperienceContent = styled("div")`
  width: 1080px;
  margin: auto;
`;

const H1 = styled("h1")`
  font-family: Josefin Sans;
  margin-top: 0;
  margin-bottom: 20px;
`;

const H2 = styled("h2")`
  font-family: Josefin Sans;
  margin-top: 0;
  margin-bottom: 10px;
`;

const H5 = styled("h5")`
  font-family: Josefin Sans;
  margin-top: 0;
  margin-bottom: 0;
  color: #888;
`;

const P = styled("p")`
  font-family: Josefin Sans;
`;

const Img = styled("img")``;

const ExperienceLogo = styled(Img)`
  height: 100px;
  margin-bottom: 10px;
`;

const ColumnLayout = styled("div")`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 20px;
`;

const ExperienceCard = styled("div")`
  width: 100%;
  height: 300px;
  border-radius: 20px;
  box-shadow: 5px 5px 15px -3px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  padding: 20px;
  text-align: center;
  transition: box-shadow 0.3s ease;

  &:hover {
    cursor: pointer;
    box-shadow: 10px 10px 30px -3px rgba(0, 0, 0, 0.2);
  }
`;

interface ExperienceSectionProps {
  expanded: boolean;
}

const ExperienceSection = styled("section")<ExperienceSectionProps>`
  height: ${(props) => (props.expanded ? "auto" : "0")};

  transition: height: 0.4s ease;
`;

const App = () => {
  const [melbourneWaterExpanded, setMelbourneWaterExpanded] =
    useState<boolean>(false);
  const [compassExpanded, setCompassExpanded] = useState<boolean>(false);
  const [reaGroupExpanded, setReaGroupExpanded] = useState<boolean>(false);

  return (
    <Router>
      <Frame>
        <Header>
          <HeaderContent>
            <Navigation>
              <NavItem to="#experience">Experience</NavItem>
              <NavItem to="#contact">Contact</NavItem>
            </Navigation>
          </HeaderContent>
        </Header>
        <Content>
          <NameCard>
            <NameCardBackground />
            <NameCardContent>
              <Name>Aaron</Name>
              <Name>Marshall</Name>
            </NameCardContent>
          </NameCard>
          <Experience>
            <ExperienceContent>
              <H1>Experience</H1>
              <ColumnLayout>
                <ExperienceCard
                  onClick={() =>
                    setMelbourneWaterExpanded(!melbourneWaterExpanded)
                  }
                >
                  <ExperienceLogo
                    src="/MelbourneWaterLogo.png"
                    alt="Melbourne Water logo"
                  />
                  <H2>Melbourne Water</H2>
                  <H5>Jan 2016 &mdash; June 2016</H5>
                  <P>
                    Cross-cutting governance and service delivery. Auditing, and
                    document ownership and management.
                  </P>
                </ExperienceCard>
                <ExperienceCard
                  onClick={() => setCompassExpanded(!compassExpanded)}
                >
                  <ExperienceLogo
                    src="/compass-logo.png"
                    alt="Compass Education logo"
                  />
                  <H2>Compass Education</H2>
                  <H5>Jan 2017 &mdash; Jan 2021</H5>
                  <P>
                    Infrastructure and platform transformation. Service
                    optimisation, uptime, and stability.
                  </P>
                </ExperienceCard>
                <ExperienceCard
                  onClick={() => setReaGroupExpanded(!reaGroupExpanded)}
                >
                  <ExperienceLogo
                    src="/reagrouplogo.png"
                    alt="Compass Education logo"
                  />
                  <H2>REA Group</H2>
                  <H5>Feb 2021 &mdash; Present</H5>
                  <P>
                    Product development in a moderate-throughput system.
                    Leveraging FP practices to modernize business-critical data
                    pipelines.
                  </P>
                </ExperienceCard>
              </ColumnLayout>
              <ExperienceSection
                expanded={melbourneWaterExpanded}
              ></ExperienceSection>
              <ExperienceSection expanded={compassExpanded}></ExperienceSection>
              <ExperienceSection
                expanded={reaGroupExpanded}
              ></ExperienceSection>
            </ExperienceContent>
          </Experience>
        </Content>
      </Frame>
    </Router>
  );
};

export default App;
