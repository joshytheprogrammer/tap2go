import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ 
    user: {
      
    },
    userBalance: 0,
    profilePic: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?',
    auth: {
      isAuthenticated: useCookie('isAuthenticated', { default: () => false }).value,
      uid: useCookie('uid', { default: () => '' }).value
    }
  }),
  actions: {
    async setUser(uid) {
      useCookie('uid').value = uid
      useCookie('isAuthenticated').value = true
      
      this.auth.uid = uid
      this.auth.isAuthenticated = true
    },
    async setUserData(user) {
      useCookie('user').value = user
      this.user = user
    },
    async setUserBalance(balance) {
      this.userBalance = balance
    },
    async setUserProfile(pic) {
      this.profilePic = pic
    },
    async clearUser() {
      useCookie('user').value = null
      useCookie('isAuthenticated').value = false
      useCookie('uid').value = null
      
      this.auth.uid = ''
      this.auth.isAuthenticated = false
      this.user = {}
      this.userBalance = 0
    }
  },
  getters: {
    getUser: (state) => state.auth.uid,
    getUserData: (state) => state.user,
    isAuthenticated: (state) => state.auth.isAuthenticated,
    getBalance: (state) => state.userBalance,
    getProfilePic: (state) => state.profilePic
  }
})