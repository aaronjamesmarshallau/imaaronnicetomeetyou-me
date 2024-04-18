import styled from "styled-components";
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { InkBlotBackground } from "./InkBlotBackground";
import { useState } from "react";

const Frame = styled("div")`
  width: 100%;
  height: 100%;
`;

const Content = styled("div")`
  position: relative;
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const Slide = styled("div")`
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;

  transition: left 0.6s ease;

  &:has(~ .selected) {
    left: -100%;
  }

  .selected ~ & {
    left: 100%;
  }
`;

const NameSlideContent = styled("div")`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  height: 280px;
  width: 50%;
  min-width: 1080px;
  margin: auto;
  box-sizing: border-box;
  text-align: right;
  display: grid;
  grid-template-columns: 1fr 250px;
`;

const Name = styled("span")`
  display: block;
  font-size: 96pt;
  font-family: Josefin Sans;
  z-index: 10;
  line-height: 140px;
`;

const P = styled("p")`
  font-family: Josefin Sans;
  font-size: 16pt;
`;

const Controls = styled("div")`
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 10;
`;

const SlideButton = styled("button")`
  width: 50px;
  height: 50px;
  padding: 5px;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const SlideButtonIcon = styled("img")`
  width: 100%;
  height: 100%;
`;

interface SlideButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const PreviousButton = (props: SlideButtonProps) => {
  return (
    <SlideButton type="button" {...props}>
      <SlideButtonIcon src="/chevron-left.svg" />
    </SlideButton>
  );
};

const NextButton = (props: SlideButtonProps) => {
  return (
    <SlideButton type="button" {...props}>
      <SlideButtonIcon src="/chevron-right.svg" />
    </SlideButton>
  );
};

const H1 = styled("h1")`
  font-family: Josefin Sans;
`;

const TextSlideContent = styled("div")`
  position: absolute;
  max-width: 1080px;
  width: 100%;
  margin: auto;
  top: 20%;
  left: 0;
  right: 0;
`;

const Img = styled("img")`
  max-height: 100%;
  max-width: 100%;
`;

const Li = styled("li")`
  font-family: Josefin Sans;
  font-size: 16pt;
`;

const slideColours = ["#151F30", "#103778", "#0593A2", "#FF7A48", "#E3371E"];

const App = () => {
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  const blotColor = slideColours[selectedSlide];
  const MIN_SLIDE_INDEX = 0;
  const MAX_SLIDE_INDEX = 4;

  return (
    <Router>
      <Frame>
        <Content>
          <InkBlotBackground blotColor={blotColor} />
          <Controls>
            <PreviousButton
              onClick={() =>
                setSelectedSlide(Math.max(selectedSlide - 1, MIN_SLIDE_INDEX))
              }
              disabled={selectedSlide === MIN_SLIDE_INDEX}
            />
            <NextButton
              onClick={() =>
                setSelectedSlide(Math.min(selectedSlide + 1, MAX_SLIDE_INDEX))
              }
              disabled={selectedSlide === MAX_SLIDE_INDEX}
            />
          </Controls>
          <Slide className={selectedSlide === 0 ? "selected" : ""}>
            <NameSlideContent>
              <div>
                <Name>Aaron</Name>
                <Name>Marshall</Name>
                <P>Leader. Teacher. Engineer. Student.</P>
              </div>
              <div>
                <Img className="" src="/profile-cropped.png" />
              </div>
            </NameSlideContent>
          </Slide>
          <Slide className={selectedSlide === 1 ? "selected" : ""}>
            <TextSlideContent>
              <H1>I'm a proven Leader.</H1>
              <P>
                Some people believe that leadership is power. I believe that
                leadership is responsibility. A responsibility to guide, to
                shelter, to advocate, and to serve.
              </P>
              <P>
                My journey with leadership began in school. Attending a
                Christian school, I was exposed to a form of leadership built on
                sacrifice. Great leaders were painted as guides, not commanders;
                to lead was to be of service. I was a Prefect in high school,
                and have always found myself rising to leadership through taking
                the initiative.
              </P>
              <P>
                During my time at Compass Education, I was frequently in
                positions of leadership, leading:
              </P>
              <ul>
                <Li>Incident response</Li>
                <Li>Projects</Li>
                <Li>My immediate team as second-in-charge</Li>
              </ul>
              <P>Now at REA Group</P>
            </TextSlideContent>
          </Slide>
          <Slide className={selectedSlide === 2 ? "selected" : ""}></Slide>
          <Slide className={selectedSlide === 3 ? "selected" : ""}></Slide>
          <Slide className={selectedSlide === 4 ? "selected" : ""}></Slide>
          <Slide className={selectedSlide === 5 ? "selected" : ""}></Slide>
        </Content>
      </Frame>
    </Router>
  );
};

export default App;
