import { FunctionComponent, PropsWithChildren } from "react";
import styled from "styled-components";

const PageWrapper = styled("div")`
  max-width: 100%;
  max-height: 100%;
  height: 100vh;
  width: 100vw;
  overflow-y: scroll;
  background-color: ${({ theme }) => theme.background.primary};
`;

const PageContent = styled("div")`
  max-width: 960px;
  width: 100%;
  margin: auto;
  height: 100%;
  box-sizing: border-box;
  padding-left: 20px;
  padding-right: 20px;
`;

const Page: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <PageWrapper>
      <PageContent>
        {children}
      </PageContent>
    </PageWrapper>
  )
};

export { Page };