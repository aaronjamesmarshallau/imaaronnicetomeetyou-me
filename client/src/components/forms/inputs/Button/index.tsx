import styled from "styled-components";

const Button = styled("button")`
  width: 100%;
  border: none;
  background-color: ${({ theme }) => theme.highlight.primary};
  border-radius: 10px;
  font-size: 1.3em;
  font-family: "FantasqueSansM Nerd Font Mono";
  color: ${({ theme }) => theme.foreground.primary};
  padding: 10px;
  transition: box-shadow ease 0.2s;
  cursor: pointer;

  &:hover, &:active, &:focus {
      outline: none;
      box-shadow: 5px 5px 0 0 ${({ theme }) => theme.highlight.secondary};
  }
`;

export { Button };