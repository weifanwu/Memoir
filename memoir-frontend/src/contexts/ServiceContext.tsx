import { createContext, useContext } from "react";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE || "local";

type ServiceUrls = {
  user: string;
  store: string;
};

const urls: Record<string, ServiceUrls> = {
  local: {
    user: "http://localhost:8080",
    store: "http://localhost:8000",
  },
  k8s: {
    user: `http://localhost:8080`,
    store: `http://localhost:8000`,
  },
};

const ServiceContext = createContext<ServiceUrls>(urls[DEV_MODE]);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => (
  <ServiceContext.Provider value={urls[DEV_MODE]}>
    {children}
  </ServiceContext.Provider>
);

export const useServices = () => useContext(ServiceContext);