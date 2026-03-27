import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './views/Login'
import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import Home from './views/Home';
import Template from './components/shared/Template';
import PrivateWrapper from './routes/PriavateWrapper';

function App() {

    const theme = createTheme({
        colorSchemes: {
            dark: true,
        },
    });


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='*' element={<Login />} />

                    <Route element={<PrivateWrapper />}>
                        <Route element={<Template />}>
                            <Route path='/home' element={<Home />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
