import NotificationBell from "@/components/NotificationBell"; 

export default function DashboardHeader() { 
  return ( 
    <header className="flex items-center justify-between border-b bg-white px-6 py-4"> 
      {/* Title section left-aligned */}
      <div> 
        <h2 className="text-xl font-semibold"> Dashboard </h2> 
        <p className="text-sm text-gray-500"> Your personal memory space </p> 
      </div> 

      {/* Action items right-aligned */}
      <div className="flex items-center gap-4"> 
        {/* Replaced hardcoded emoji button with your custom component */}
        <NotificationBell /> 
        
        {/* User profile avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 font-semibold"> 
          V 
        </div> 
      </div> 
    </header> 
  ); 
}