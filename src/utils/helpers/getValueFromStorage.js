import React, { useState, useEffect } from 'react';
import AsyncStorage  from '@react-native-async-storage/async-storage'; // corrected import
import constants from './constants';
import { useTranslation } from 'react-i18next';

export async function getValueFromStorage(prop) {
  const {t, i18n} = useTranslation();
    try {
      const value = await AsyncStorage.getItem(constants.LANGUAGE);
      // let selectedLan = value !== null ? value : 'en' ? 'en-US' : 'ar';
      
      // i18n.changeLanguage(selectedLan);
      return value !== null ? value : 'en';

    } catch (error) {
      return 'en';
    }
  }

