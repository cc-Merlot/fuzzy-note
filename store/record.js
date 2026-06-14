import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecordStore = defineStore('record', () => {
  //记录模块选中的宠物
  const drinkData = ref({});
  const weightData = ref({});
  const washList = ref({});
  const writeData = ref({});
  const sportsData = ref({});
  const healthData = ref({});
  const eatData = ref({});

  const setDrinkVolum = (data) => {
    drinkData.value = data;
  };

  const setWeightData = (data) => {
    weightData.value = data;
  };

  const setWashList = (data) => {
    washList.value = data;
  };

  const setWriteData = (data) => {
    writeData.value = data;
  };

  const setSportsData = (data) => {
    sportsData.value = data;
  };

  const setHealthData = (data) => {
    healthData.value = data;
  };
  const setEatData = (data) => {
    eatData.value = data;
  };

  const clearData = () => {
    drinkData.value = {};
    weightData.value = {};
    washList.value = {};
    writeData.value = {};
    sportsData.value = {};
    healthData.value = {};
    eatData.value = {};
  };



  return {
    drinkData,
    weightData,
    washList,
    writeData,
    sportsData,
    healthData,
    eatData,
    setDrinkVolum,
    setWeightData,
    setWashList,
    setWriteData,
    setSportsData,
    setHealthData,
    setEatData,
    clearData
  };
}, {
  persist: {
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync
    }
  }
});