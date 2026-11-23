import { combineReducers } from '@reduxjs/toolkit'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi } from '@/services/api/baseApi'

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
})
