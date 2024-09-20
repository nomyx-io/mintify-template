import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {useAccount, useDisconnect} from 'wagmi';
import KronosSpin from "../../KronosSpin/KronosSpin";

function PrivateRoute({children, onConnect, role, forceLogout, handleForecLogout}) {

    console.log("PrivateRoute");

    const {disconnect} = useDisconnect();
    const router = useRouter();
    const {address, isConnected, isConnecting} = useAccount();
    const [history, setHistory] = useState([]);

    const handleDisconnect = () => {
        disconnect();
        handleForecLogout();
    };

    useEffect(() => {
        if (!isConnected && !address) {
            router.push('/login');
        }

        console.log("role = ", role);

        if (isConnected && role.length == 0) {
            onConnect()
        }
    }, [address, isConnected, role]);

    useEffect(() => {

        if(isConnected && role.length > 0){
            const redirectTarget = history[1] == '/' || history[1] == '/login' ? '/home' : history[1] ||  history[0];
            router.push(redirectTarget);
        }
    }, [role, isConnected]);

    useEffect(() => {
        forceLogout && handleDisconnect();
    }, [forceLogout]);

    useEffect(() => {
        const handleRouteChange = (url) => {
            setHistory((prevHistory) => {
                const newHistory = [url, ...prevHistory].slice(0, 3);
                return newHistory;
            });
        };

        handleRouteChange(router.asPath);
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };

    }, []);

    console.log("role = ", role);

    return isConnected && role.length == 0 ? <div
        className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center'>
        <KronosSpin/>
    </div> : children;

}

export default PrivateRoute;
