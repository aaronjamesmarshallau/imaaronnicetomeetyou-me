import { FunctionComponent } from "react";
import "./NameCardBackground.css";
import styled from "styled-components";

const InkBlotBackgroundContainer = styled("div")`
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  filter: blur(40px);
`;

const InkBlot = styled("div")<{ $blotColor: string }>`
  background: ${(props) => props.$blotColor};
  border-radius: 40% 50% 30% 40%;
  opacity: 0.7;
  position: absolute;

  transition: background-color 0.6s ease;

  &.one {
    height: 150px;
    width: 200px;
    left: 10%;
    top: 5%;
    transform: rotate(-180deg);
    animation: transform 8s ease-in-out infinite both alternate,
      movement_two 12s ease-in-out infinite both;
  }

  &.two {
    height: 200px;
    width: 200px;
    left: 10%;
    top: 70%;
    transform: rotate(-180deg);
    animation: transform 10s ease-in-out infinite both alternate,
      movement_two 10s ease-in-out infinite both;
  }

  &.three {
    height: 300px;
    width: 300px;
    left: 80%;
    top: 10%;
    transform: rotate(-180deg);
    animation: transform 7s ease-in-out infinite both alternate,
      movement_two 4s ease-in-out infinite both;
  }

  &.four {
    height: 100px;
    width: 80px;
    left: 50%;
    top: 60%;
    transform: rotate(-180deg);
    animation: transform 17s ease-in-out infinite both alternate,
      movement_two 6s ease-in-out infinite both;
  }

  &.five {
    height: 100px;
    width: 80px;
    left: 20%;
    top: 50%;
    transform: rotate(-180deg);
    animation: transform 12s ease-in-out infinite both alternate,
      movement_two 15s ease-in-out infinite both;
  }

  &.six {
    height: 70px;
    width: 100px;
    left: 40%;
    top: 20%;
    transform: rotate(-180deg);
    animation: transform 5s ease-in-out infinite both alternate,
      movement_two 5s ease-in-out infinite both;
  }

  &.seven {
    height: 80px;
    width: 60px;
    animation: transform 18s ease-in-out infinite both alternate,
      movement_one 12s ease-in-out infinite both;
    left: 75%;
    top: 80%;
  }
`;

interface InkBlotBackgroundProps {
  blotColor: string;
}

export const InkBlotBackground: FunctionComponent<InkBlotBackgroundProps> = (
  props: InkBlotBackgroundProps
) => {
  return (
    <InkBlotBackgroundContainer>
      <InkBlot className="seven" $blotColor={props.blotColor} />
      <InkBlot className="one" $blotColor={props.blotColor} />
      <InkBlot className="two" $blotColor={props.blotColor} />
      <InkBlot className="three" $blotColor={props.blotColor} />
      <InkBlot className="four" $blotColor={props.blotColor} />
      <InkBlot className="five" $blotColor={props.blotColor} />
      <InkBlot className="six" $blotColor={props.blotColor} />
    </InkBlotBackgroundContainer>
  );
};
