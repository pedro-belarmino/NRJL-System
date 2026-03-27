import {
    BottomNavigation, BottomNavigationAction, Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from "react-router-dom";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";


export default function NavBar() {

    const navigate = useNavigate()
    const location = useLocation()
    const [value, setValue] = useState(0);


    useEffect(() => {
        if (location.pathname === "/home") {
            setValue(0);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <Box sx={{ width: 'full', }}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<HomeIcon />}
                    onClick={() => navigate('/home')}
                    sx={{ '&.Mui-selected': { color: 'warning.main' } }}
                />
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
