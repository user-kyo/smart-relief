import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useSmartRelief } from "../../context/SmartReliefContext";
import { AlertOctagon, Bell, LifeBuoy } from "lucide-react";

export const GlobalNotifications: React.FC = () => {
  const { alerts, currentRole } = useSmartRelief();

  // Simulate a live dispatch/alert system periodically
  useEffect(() => {
    // Only show live simulated notifications for specific roles to reduce spam
    if (currentRole === "CITIZEN") return;

    const interval = setInterval(() => {
      const randomSeed = Math.random();
      
      if (randomSeed > 0.8) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    New Priority Incident
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Flash flood reported in San Jose Sector 4. Responders needed immediately.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      } else if (randomSeed > 0.6) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <LifeBuoy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Assistance Request Updated
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Team Alpha has successfully rescued 3 civilians at Roxas Blvd.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 4000 });
      }
    }, 45000); // 45 seconds interval

    return () => clearInterval(interval);
  }, [currentRole]);

  return (
    <Toaster 
      position="top-right" 
      toastOptions={{ 
        className: 'dark:bg-slate-800 dark:text-white',
      }} 
    />
  );
};
