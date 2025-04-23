// components/loginTrakt.tsx
import React from 'react';
import { Button } from 'react-native';

import { loginWithTrakt } from '../api/traktAuth';

type LoginTraktProps = {
  title: string;
};

const LoginTrakt = ({ title }: LoginTraktProps) => {
  const startAuth = async () => {
    console.log('in loginTrakt component ');
    try {
      await loginWithTrakt();
      // No need to navigate - it will happen through deep linking
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return <Button title={title} onPress={startAuth} />;
};

export default LoginTrakt;
