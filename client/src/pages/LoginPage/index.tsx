import { ChangeEventHandler, FunctionComponent, MouseEventHandler, useState } from "react"
import { Page } from "../Page";
import styled from "styled-components";
import { TextInput } from "../../components/forms/inputs/TextInput";
import { Button } from "../../components/forms/inputs/Button";
import { CheckBoxInput } from "../../components/forms/inputs/CheckBoxInput";
import { useNavigate } from "react-router";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../auth";

const LoginModal = styled("div")`
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

const ErrorMessage = styled("div")`
  margin-bottom: 10px;
  color: ${({ theme }) => theme.highlight.primary};
`;

const getErrorMessageComponent = (message?: string): React.ReactElement | null => {
  if (message === undefined) {
    return null;
  }

  return (
    <ErrorMessage>{message}</ErrorMessage>
  )
};

const LoginPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => setEmail(e.target.value);
  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (e) => setPassword(e.target.value);
  const onRememberChange: ChangeEventHandler<HTMLInputElement> = (e) => setRemember(Boolean(e.target.value));

  const onSubmitClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, remember })
    })
      .then(response => response.json())
      .then(responseBody => {
        localStorage.setItem(REFRESH_TOKEN_KEY, responseBody.refreshToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, responseBody.accessToken);

        navigate("/");
      })
      .catch(_err => setSignInError("There was an error signing you in. Please double check your username and password and try again."));
  };

  const errorMessage = getErrorMessageComponent(signInError)

  return (
    <Page>
      <LoginModal>
        <FormTitle>Login</FormTitle>
        <Form>
          <TextInput type="text" placeholder="Email" value={email} onChange={onEmailChange} />
          <TextInput type="password" placeholder="Password" value={password} onChange={onPasswordChange} />
          <CheckBoxInput label="Remember on this device" value={remember.toString()} onChange={onRememberChange} />
          {errorMessage}
          <Button onClick={onSubmitClick}>Login</Button>
        </Form>
      </LoginModal>
    </Page>
  );
};

export { LoginPage };