import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plane, User, Calendar, Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-airline-dark text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-airline-red p-2 rounded-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">SkyWings</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Button variant="ghost" className="text-white hover:text-airline-gold" onClick={() => navigate('/')}>
            BOOK
          </Button>
          <Button variant="ghost" className="text-white hover:text-airline-gold">
            MANAGE
          </Button>
          <Button variant="ghost" className="text-white hover:text-airline-gold">
            EXPERIENCE
          </Button>
          <Button variant="ghost" className="text-white hover:text-airline-gold">
            WHERE WE FLY
          </Button>
          {isAdmin && (
            <Button variant="ghost" className="text-white hover:text-airline-gold" onClick={() => navigate('/admin')}>
              ADMIN
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-airline-blue text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/bookings')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-white hover:text-airline-gold" onClick={() => navigate('/login')}>
                LOG IN
              </Button>
              <Button className="bg-airline-red hover:bg-airline-red/90" onClick={() => navigate('/register')}>
                SIGN UP
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;