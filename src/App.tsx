import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './views/Login'
import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import Home from './views/Home';
import Authorization from './views/Authorization';
import CreateTask from './views/CreateTask';
import Template from './components/shared/Template';
import PrivateWrapper from './routes/PriavateWrapper';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br';

function App() {

    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#1976d2', // Standard blue primary
            },
            secondary: {
                main: '#9c27b0', // Purple secondary
            },
        },
        colorSchemes: {
            dark: true,
        },
    });


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Login />} />
                        <Route path='*' element={<Login />} />

                        <Route element={<PrivateWrapper />}>
                            <Route element={<Template />}>
                                <Route path='/home' element={<Home />} />
                                <Route path='/authorization' element={<Authorization />} />
                                <Route path='/criar-tarefa' element={<CreateTask />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </LocalizationProvider>
    )
}

export default App
