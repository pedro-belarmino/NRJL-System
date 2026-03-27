import {
    BottomNavigation, BottomNavigationAction, Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import HomeIcon from '@mui/icons-material/Home';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useLocation } from "react-router-dom";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";


export default function NavBar() {

    const navigate = useNavigate()
    const location = useLocation()
    const [value, setValue] = useState(0);
    const { user, profile } = useAuth();


    useEffect(() => {
        if (location.pathname === "/home") {
            setValue(0);
        } else if (location.pathname === "/criar-tarefa") {
            setValue(1);
        } else if (location.pathname === "/authorization") {
            setValue(2);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const isSuperUser = user?.email === "pedro.belarmino@escoteiros.org.br";
    const isAdmin = profile === "desenvolvedor" || profile === "coordenador" || isSuperUser;

    return (
        <Box sx={{ width: 'full', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}
                sx={{ borderTop: 1, borderColor: 'divider' }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<HomeIcon />}
                    onClick={() => navigate('/home')}
                    sx={{ '&.Mui-selected': { color: 'warning.main' } }}
                />

                {isAdmin && (
                    <BottomNavigationAction
                        label="Criar"
                        icon={<AddCircleOutlineIcon />}
                        onClick={() => navigate('/criar-tarefa')}
                        sx={{ '&.Mui-selected': { color: 'warning.main' } }}
                    />
                )}

                {isAdmin && (
                    <BottomNavigationAction
                        label="Autorizar"
                        icon={<ManageAccountsIcon />}
                        onClick={() => navigate('/authorization')}
                        sx={{ '&.Mui-selected': { color: 'warning.main' } }}
                    />
                )}

                <BottomNavigationAction
                    label="Sair"
                    icon={<LogoutRoundedIcon />}
                    onClick={handleLogout}
                    sx={{ '&.Mui-selected': { color: 'warning.main' } }}
                />
            </BottomNavigation>
        </Box>
    )
}
