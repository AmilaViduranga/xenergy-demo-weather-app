import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { FIREBASE_APP, FIREBASE_AUTH } from './firebase.tokens';

function createFirebaseApp(): ReturnType<typeof initializeApp> {
  const options = environment.firebase as FirebaseOptions;
  return getApps().length ? getApp() : initializeApp(options);
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
