import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { FIREBASE_APP, FIREBASE_AUTH } from './firebase.tokens';

function createFirebaseApp(): ReturnType<typeof initializeApp> {
  if (getApps().length) {
    return getApp();
  }

  const options = environment.firebase as FirebaseOptions;
  // Never pass empty apiKey/projectId — Firebase throws and the whole SPA fails to boot.
  const safeOptions: FirebaseOptions = {
    apiKey: options.apiKey || 'demo-api-key',
    authDomain: options.authDomain || 'demo-project.firebaseapp.com',
    projectId: options.projectId || 'demo-project',
    storageBucket: options.storageBucket || 'demo-project.appspot.com',
    messagingSenderId: options.messagingSenderId || '000000000000',
    appId: options.appId || '1:000000000000:web:0000000000000000000000',
    measurementId: options.measurementId || 'G-DEMO000000',
  };

  return initializeApp(safeOptions);
}

export function provideFirebaseAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_APP,
      useFactory: createFirebaseApp,
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: (app: ReturnType<typeof createFirebaseApp>): Auth => getAuth(app),
      deps: [FIREBASE_APP],
    },
  ]);
}
