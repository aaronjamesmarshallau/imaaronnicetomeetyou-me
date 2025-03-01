import { ChangeEventHandler, FunctionComponent, useState } from "react";
import styled from "styled-components";

const InputContainer = styled("div")`
  position: relative;
  margin-bottom: 10px;
`;

const Input = styled("input")`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  outline: none;
  transition: box-shadow ease 0.2s;
  box-sizing: border-box;
  padding: 5px 10px;
  font-size: 1.1em;

  &:active, &:focus {
      outline: none;
      box-shadow: 5px 5px 0 0 ${({ theme }) => theme.highlight.primary};
  }

  &:active + label, &:focus + label, &:not([value='']) + label {
    top: -8px;
    font-size: 0.8em;
  }
`;

const Label = styled("label")`
  position: absolute;
  left: 8px;
  top: 8px;
  font-size: 1.1em;
  border-radius: 5px;
  background-color: #fff;
  padding: 2px 4px;
  transition: top 0.2s ease, font-size 0.2s ease;
  pointer-events: none;
`;

interface TextInputProps {
  type?: "email" | "number" | "password" | "search" | "tel" | "text" | "url"
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const TextInput: FunctionComponent<TextInputProps> = (props: TextInputProps) => {
  const [value, setValue] = useState<string>("");
  const defaultOnChange: ChangeEventHandler<HTMLInputElement> = (e) => setValue(e.target.value);

  return (
    <InputContainer>
      <Input type={props.type || "text"} value={props.value || value} onChange={props.onChange || defaultOnChange} />
      <Label htmlFor={props.name} >{props.placeholder}</Label>
    </InputContainer>
  )
}

export { TextInput };