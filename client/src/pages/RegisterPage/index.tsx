import { ChangeEventHandler, FunctionComponent, MouseEventHandler, useState } from "react"
import { Page } from "../Page";
import styled from "styled-components";
import { TextInput } from "../../components/forms/inputs/TextInput";
import { Button } from "../../components/forms/inputs/Button";

const RegisterModal = styled("div")`
  position: absolute;
  width: 400px;
  height: 400px;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 2px solid ${({ theme }) => theme.highlight.primary};
  border-radius: 10px;
  text-align: center;
`;

const FormTitle = styled("h1")`
  color: ${({ theme }) => theme.foreground.primary}
`;

const Form = styled("form")`
  width: 80%;
  margin: auto;
`;

const RegisterPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => setEmail(e.target.value);
  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (e) => setPassword(e.target.value);

  const onSubmitClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
  };

  return (
    <Page>
      <RegisterModal>
        <FormTitle>Register</FormTitle>
        <Form>
          <TextInput type="text" placeholder="Email" value={email} onChange={onEmailChange} />
          <TextInput type="password" placeholder="Password" value={password} onChange={onPasswordChange} />
          <Button onClick={onSubmitClick}>Register</Button>
        </Form>
      </RegisterModal>
    </Page>
  )
};

export { RegisterPage };