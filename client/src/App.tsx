import { ThemeProvider } from "styled-components"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BlogsPage } from "./pages/BlogsPage";
import { CreatePage } from "./pages/CreatePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { BlogPage } from "./pages/BlogPage";
import { ManagePage } from "./pages/ManagePage";

const darkTheme = {
  background: {
    primary: '#1F1B2D',
    secondary: '#201D28',
  },
  foreground: {
    primary: '#F4F3F6',
    secondary: '#D0C8CE',
  },
  highlight: {
    primary: '#EF2655',
    secondary: '#8E254A',
    tertiary: '#63254D',
  },
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <Routes>
          <Route path="/" element={<BlogsPage />} />
          <Route path="/b/:blogId" element={<BlogPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
};

export default App
