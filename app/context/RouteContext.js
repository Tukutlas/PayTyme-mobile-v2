import React, { useState, useContext, createContext } from 'react';

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
    const [initialRoute, setInitialRoute] = useState(null); // Start with null or a default route

    const setRouteContextInitialRoute = (route) => {
        setInitialRoute(route); // Update the route
    };

    return (
        <RouteContext.Provider value={{ initialRoute, setRouteContextInitialRoute }}>
            {children}
        </RouteContext.Provider>
    );
};

export const useRouteContext = () => useContext(RouteContext);
