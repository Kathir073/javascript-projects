'use client';
import React, { useRef, useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { auth, RecaptchaVerifier } from '../firebase';
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';

export default function PhoneAuth() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const confirmationResultRef = useRef<any>(null);

  const start = async () => {
    // Expo may handle reCAPTCHA natively on Android
    confirmationResultRef.current = await signInWithPhoneNumber(auth, phone);
  };

  const verify = async () => {
    const cred = PhoneAuthProvider.credential(confirmationResultRef.current.verificationId, code);
    await signInWithCredential(auth, cred);
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Phone OTP Login</Text>
      <TextInput placeholder="+91XXXXXXXXXX" value={phone} onChangeText={setPhone} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Send OTP" onPress={start} />
      <TextInput placeholder="123456" value={code} onChangeText={setCode} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Verify" onPress={verify} />
    </View>
  );
}