import React from 'react';
import Navbar from './Navbar';
import { useQuery } from '@tanstack/react-query';
const layout = ({children}) => {
  return (
  <div className='min-h-screen bg-base-800'>
    <Navbar />
    <main className='max-w-7xl mx-auto px-4 py-6'>{children}</main>
    </div>
    );
};
export default layout;