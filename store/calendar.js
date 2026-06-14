import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCalendarStore = defineStore('calendar', () => {
  //记录模块当前日期
  const recordCurrentDate = ref({});

  const setCurrentDate = (pet) => {
    recordCurrentDate.value = pet;
  };

  return {
    recordCurrentDate,
    setCurrentDate
  };
}, {
  persist: {
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync
    }
  }
});