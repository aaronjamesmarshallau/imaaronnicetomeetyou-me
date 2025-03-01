import { ChangeEventHandler, FunctionComponent, useState } from "react";
import styled from "styled-components";

const InputContainer = styled("div")`
  position: relative;
  margin-bottom: 10px;
`;

const Label = styled("label")`
  color: ${({ theme }) => theme.foreground.primary};
  font-size: 1.1em;
  border-radius: 5px;
  padding: 2px 4px;
  transition: top 0.2s ease, font-size 0.2s ease;
`;

const Input = styled("input")`
`;

interface CheckBoxInputProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const CheckBoxInput: FunctionComponent<CheckBoxInputProps> = (props: CheckBoxInputProps) => {
  const [value, setValue] = useState<string>("");
  const defaultOnChange: ChangeEventHandler<HTMLInputElement> = (e) => setValue(e.target.value);

  return (
    <InputContainer>
      <Label htmlFor={props.name} >
        <Input id={props.name} name={props.name} type="checkbox" value={props.value || value} onChange={props.onChange || defaultOnChange} />
        {props.label}
      </Label>
    </InputContainer>
  )
}

export { CheckBoxInput };