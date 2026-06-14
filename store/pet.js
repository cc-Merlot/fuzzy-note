import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePetStore = defineStore('pet', () => {
  //记录模块选中的宠物
  const recordCurrentPet = ref({});
  const indexCurrentPet = ref({});
  const statisticCurrentPet = ref({});

  //设置记录模块选中的宠物
  const setCurrentPet = (pet) => {
    recordCurrentPet.value = pet;
  };

  const setIndexCurrentPet = (pet) => {
    indexCurrentPet.value = pet;
  };

  const clearData = () => {
    recordCurrentPet.value = {};
    indexCurrentPet.value = {};
    statisticCurrentPet.value = {};
  };

  const setStatisticCurrentPet = (pet) => {
    statisticCurrentPet.value = pet;
  };

  return {
    recordCurrentPet,
    indexCurrentPet,
    statisticCurrentPet,
    setCurrentPet,
    clearData,
    setIndexCurrentPet,
    setStatisticCurrentPet
  };
}, {
  persist: {
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync
    }
  }
});