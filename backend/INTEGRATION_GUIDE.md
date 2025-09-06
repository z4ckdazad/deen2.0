# Frontend-Backend Integration Guide

This guide explains how to integrate the DeenVerse frontend with the backend API.

## 🔗 API Base URL

The backend API is available at:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-domain.com/api`

## 🔐 Authentication Integration

### 1. Login Integration

Update the login form in `src/pages/Login.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to dashboard or feed
      window.location.href = '/feed';
    } else {
      // Handle error
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Registration Integration

Update the registration form in `src/pages/Register.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to dashboard
      window.location.href = '/feed';
    } else {
      // Handle error
      console.error('Registration failed:', data.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## 📡 API Service Layer

Create a centralized API service in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User methods
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  // Imaam methods
  async getImaamList(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/imaam?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async searchImaam(query: string, page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/imaam/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async requestConnection(imaamId: string, message?: string) {
    const response = await fetch(`${API_BASE_URL}/imaam/${imaamId}/connect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return this.handleResponse(response);
  }

  // Post methods
  async getFeed(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/posts/feed?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createPost(postData: any) {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    return this.handleResponse(response);
  }

  async likePost(postId: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Comment methods
  async getComments(postId: string, page = 1, limit = 20) {
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createComment(commentData: any) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(commentData),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
```

## 🔄 State Management Integration

### 1. User Context

Create `src/contexts/UserContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  islamicProfile: string;
  profilePicture?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiService.login(email, password);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const register = async (userData: any) => {
    const data = await apiService.register(userData);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    const data = await apiService.updateProfile(profileData);
    setUser(data.data);
    localStorage.setItem('user', JSON.stringify(data.data));
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

### 2. Update App.tsx

```typescript
import { UserProvider } from './contexts/UserContext';

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/imaam" element={<Imaam />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </UserProvider>
);
```

## 🎯 Component Updates

### 1. Update Navbar

```typescript
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
  const { user, logout } = useUser();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DeenVerse
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.fullName}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

### 2. Update Feed Component

```typescript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await apiService.getFeed();
      setPosts(data.data.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      const data = await apiService.createPost({
        content: newPost,
        type: 'general'
      });
      
      setPosts([data.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const data = await apiService.likePost(postId);
      // Update the post in the list
      setPosts(posts.map(post => 
        post._id === postId ? data.data : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Rest of component...
};
```

## 🔧 Environment Configuration

Create `.env.local` in your frontend project:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=DeenVerse
```

Update your API service to use environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

## 🚀 Deployment Checklist

### Backend Deployment
- [ ] Set up MongoDB database
- [ ] Configure environment variables
- [ ] Set up Cloudinary account
- [ ] Configure email service
- [ ] Deploy to hosting platform (Heroku, AWS, etc.)
- [ ] Set up SSL certificate
- [ ] Configure CORS for production domain

### Frontend Deployment
- [ ] Update API base URL for production
- [ ] Build production bundle
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Configure environment variables
- [ ] Test all functionality

## 🐛 Common Issues & Solutions

### 1. CORS Errors
- Ensure CORS is properly configured in backend
- Check that frontend URL is in allowed origins

### 2. Authentication Issues
- Verify JWT secret is consistent
- Check token expiration settings
- Ensure tokens are stored securely

### 3. File Upload Issues
- Verify Cloudinary configuration
- Check file size and type restrictions
- Ensure proper CORS headers for file uploads

### 4. Database Connection Issues
- Verify MongoDB connection string
- Check database permissions
- Ensure database is accessible from hosting platform

## 📞 Support

For integration issues:
1. Check the API documentation at `/api-docs`
2. Review the backend logs
3. Test API endpoints with Postman/curl
4. Check browser network tab for request/response details
