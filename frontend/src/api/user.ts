/**
 * 用户相关API
 */

import { http, type ApiResponse } from '@/lib/http'

export interface UserProfile {
  id: string
  username: string
  email: string | null
  displayName: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles?: string[]
  permissions?: string[]
}

export interface UpdateProfileData {
  displayName?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface UserSession {
  id: string
  userAgent: string
  ip: string
  lastActive: string
  current: boolean
}

export const userApi = {
  // 获取用户资料
  async getProfile() {
    return http.get<UserProfile>('/api/user/profile')
  },

  // 更新用户资料
  async updateProfile(data: UpdateProfileData) {
    return http.patch<UserProfile>('/api/user/profile', data)
  },

  // 修改密码
  async changePassword(data: ChangePasswordData) {
    return http.post<{ message: string }>('/api/user/change-password', data)
  },

  // 上传头像
  async uploadAvatar(file: File) {
    return http.upload<{ avatarUrl: string }>('/api/user/avatar', file)
  },

  // 获取用户会话
  async getSessions() {
    return http.get<UserSession[]>('/api/user/sessions')
  },

  // 撤销指定会话
  async revokeSession(sessionId: string) {
    return http.delete<{ message: string }>(`/api/user/sessions/${sessionId}`)
  },

  // 撤销所有其他会话
  async revokeAllOtherSessions() {
    return http.delete<{ message: string }>('/api/user/sessions/others')
  }
} 