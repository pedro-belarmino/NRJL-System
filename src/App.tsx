import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './views/Login';
import Home from './views/Home';
import { AuthProvider } from './context/AuthContext';
function App() {

  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
  });

  return (
    <>
      <AuthProvider>

        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/*' element={<Login />} />
              <Route path='/home' element={<Home />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </>
  )
}

export default App
