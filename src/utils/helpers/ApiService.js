// services/apiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiConfig, { ENDPOINTS, getEndpoint } from '../helpers/ApiConfig';

class ApiService {
  constructor() {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const newToken = await this.getToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  // Error handler with React Native Alert
  handleError(error) {
    let errorMessage = 'Something went wrong';
    
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
    } else if (error.request) {
      console.error('Network Error:', error.request);
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      console.error('Request Setup Error:', error.message);
      errorMessage = error.message;
    }

    // Show alert in React Native (optional - you can remove this if you want to handle errors in components)
    Alert.alert('Error', errorMessage);
  }

  // Token management with AsyncStorage
  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async removeTokens() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userProfile']);
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  }

  // Save user profile
  async saveUserProfile(userProfile) {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Generic HTTP methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch(endpoint, data = {}) {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // File upload method for React Native
  async uploadFile(endpoint, fileData, onUploadProgress = null) {
    try {
      const formData = new FormData();
      
      // Handle different file formats
      if (fileData.uri) {
        formData.append('file', {
          uri: fileData.uri,
          type: fileData.type || 'image/jpeg',
          name: fileData.name || 'file.jpg',
        });
      }

      // Add additional fields if provided
      if (fileData.additionalFields) {
        Object.keys(fileData.additionalFields).forEach(key => {
          formData.append(key, fileData.additionalFields[key]);
        });
      }

      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication methods
  async login(phone, password) {
    try {
      const response = await this.post(ENDPOINTS.AUTH.LOGIN, { phone, password });
      
      if (response.token) {
        await this.setToken(response.token);
      }
      
      if (response.refreshToken) {
        await this.setRefreshToken(response.refreshToken);
      }
      
      if (response.user) {
        await this.saveUserProfile(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(navigation = null) {
    try {
      await this.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeTokens();
      
      // Navigate to login screen if navigation is provided
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
      
      if (response.token) {
        await this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      await this.removeTokens();
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // Employee methods
  async getEmployeeProfile(id) {
    return this.get(getEndpoint(ENDPOINTS.EMPLOYEE.PROFILE, id));
  }

  async getEmployeeList() {
    return this.get(ENDPOINTS.EMPLOYEE.LIST);
  }

  async createEmployee(employeeData) {
    return this.post(ENDPOINTS.EMPLOYEE.CREATE, employeeData);
  }

  async updateEmployee(id, employeeData) {
    return this.put(getEndpoint(ENDPOINTS.EMPLOYEE.UPDATE, id), employeeData);
  }

  async deleteEmployee(id) {
    return this.delete(getEndpoint(ENDPOINTS.EMPLOYEE.DELETE, id));
  }

  // Department methods
  async getDepartmentList() {
    return this.get(ENDPOINTS.DEPARTMENT.LIST);
  }

  async createDepartment(departmentData) {
    return this.post(ENDPOINTS.DEPARTMENT.CREATE, departmentData);
  }

  async updateDepartment(id, departmentData) {
    return this.put(getEndpoint(ENDPOINTS.DEPARTMENT.UPDATE, id), departmentData);
  }

  async deleteDepartment(id) {
    return this.delete(getEndpoint(ENDPOINTS.DEPARTMENT.DELETE, id));
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;