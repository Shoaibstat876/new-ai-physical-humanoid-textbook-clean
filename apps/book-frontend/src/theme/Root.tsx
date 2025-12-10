import React from 'react';
import type {ReactNode} from 'react';
import {AIChatWidget} from '../components/AIChatWidget/AIChatWidget';

type RootProps = {
  children: ReactNode;
};

export default function Root({children}: RootProps) {
  return (
    <>
      {children}
      <AIChatWidget />
    </>
  );
}
