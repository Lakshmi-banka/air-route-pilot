const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
}

export interface Booking {
  id: string;
  userId: string;
  flightNumber: string;
  passengerName: string;
  seatNumber: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  bookingDate: string;
  totalAmount: number;
  flight?: Flight;
}

class ApiService {
  private token: string | null = localStorage.getItem('authToken');

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.fetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.fetch('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // User methods
  async getUser(userId: string): Promise<User> {
    return this.fetch(`/api/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return this.fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.fetch(`/api/users/${userId}/bookings`);
  }

  // Flight methods
  async getFlights(): Promise<Flight[]> {
    return this.fetch('/api/flights');
  }

  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
  }): Promise<Flight[]> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`/api/flights/search?${queryString}`);
  }

  async getFlight(flightNumber: string): Promise<Flight> {
    return this.fetch(`/api/flights/${flightNumber}`);
  }

  async createFlight(flightData: Omit<Flight, 'flightNumber'>): Promise<Flight> {
    return this.fetch('/api/flights', {
      method: 'POST',
      body: JSON.stringify(flightData),
    });
  }

  // Booking methods
  async createBooking(bookingData: {
    flightNumber: string;
    passengerName: string;
    seatNumber?: string;
  }): Promise<Booking> {
    return this.fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBooking(bookingId: string): Promise<Booking> {
    return this.fetch(`/api/bookings/${bookingId}`);
  }

  async deleteBooking(bookingId: string): Promise<void> {
    return this.fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // Pricing methods
  async calculatePrice(data: {
    flightNumber: string;
    passengerCount: number;
    seatClass: string;
  }): Promise<{ totalPrice: number; breakdown: any }> {
    return this.fetch('/api/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();