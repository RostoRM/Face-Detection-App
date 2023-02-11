import React from 'react';
import Tilt from 'react-parallax-tilt';
import brain from './brain.png';
import './NavigationLogo.css';

const NavigationLogo = ({ onRouteChange, isSignedIn }) => {
  if (isSignedIn) {
    return (
      <nav className='flex justify-between'>
        <div className='mt4 mh5'>
          <Tilt className='Tilt shadow-5 br-100' options={{ max: 55 }} style={{ height: 150, width: 150 }}>
            <div className='Tilt-inner pa3'>
              <img style={{ paddingTop: '7px' }} alt='logo' src={brain} />
            </div>
          </Tilt>
        </div>
        <p onClick={() => onRouteChange('signout')} className='f3 link dim black underline pa3 pointer'>
          Sign Out
        </p>
      </nav>
    );
  } else {
    return (
      <nav className='flex justify-end'>
        <p onClick={() => onRouteChange('signin')} className='f3 link dim black underline pa3 pointer'>
          Sign In
        </p>
        <p onClick={() => onRouteChange('register')} className='f3 link dim black underline pa3 pointer'>
          Register
        </p>
      </nav>
    );
  }
};

export default NavigationLogo;
