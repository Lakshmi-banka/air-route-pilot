import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  aircraft: string;
  price: number;
  available_seats: number;
  total_seats: number;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_name: string;
  seat_number: string | null;
  status: 'confirmed' | 'cancelled' | 'pending';
  booking_date: string;
  total_amount: number;
  flight?: Flight;
}

class SupabaseService {
  // Auth methods
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Profile | null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // Flight methods
  async getFlights(): Promise<Flight[]> {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('departure_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
  }): Promise<Flight[]> {
    let query = supabase.from('flights').select('*');

    if (params.origin) {
      query = query.ilike('origin', `%${params.origin}%`);
    }

    if (params.destination) {
      query = query.ilike('destination', `%${params.destination}%`);
    }

    if (params.date) {
      const searchDate = new Date(params.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);
      
      query = query
        .gte('departure_time', searchDate.toISOString())
        .lt('departure_time', nextDay.toISOString());
    }

    query = query.order('departure_time', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getFlight(flightId: string): Promise<Flight | null> {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flightId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createFlight(flightData: Omit<Flight, 'id'>): Promise<Flight> {
    const { data, error } = await supabase
      .from('flights')
      .insert(flightData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFlight(flightId: string, updates: Partial<Flight>): Promise<Flight> {
    const { data, error } = await supabase
      .from('flights')
      .update(updates)
      .eq('id', flightId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFlight(flightId: string): Promise<void> {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', flightId);

    if (error) throw error;
  }

  // Booking methods
  async createBooking(bookingData: {
    flight_id: string;
    passenger_name: string;
    seat_number?: string;
    total_amount: number;
  }): Promise<Booking> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Booking[];
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(*)
      `)
      .eq('id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Booking | null;
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select(`
        *,
        flight:flights(*)
      `)
      .single();

    if (error) throw error;
    return data as Booking;
  }

  async deleteBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
  }

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Booking[];
  }
}

export const supabaseService = new SupabaseService();