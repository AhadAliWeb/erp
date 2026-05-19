import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const tokenFromStorage = localStorage.getItem('psfcl_token');
let initialUser = null;
if (tokenFromStorage) {
  try {
    const decoded = jwtDecode(tokenFromStorage);
    initialUser = {
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || '',
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '',
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || '',
      tenantId: decoded.tenantId || null,
    };
  } catch {
    localStorage.removeItem('psfcl_token');
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: tokenFromStorage || null,
    user: initialUser,
  },
  reducers: {
    setCredentials: (state, action) => {
      const token = action.payload;
      state.token = token;
      localStorage.setItem('psfcl_token', token);
      try {
        const decoded = jwtDecode(token);
        state.user = {
          name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || '',
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '',
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || '',
          tenantId: decoded.tenantId || null,
        };
      } catch {
        state.user = null;
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('psfcl_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;