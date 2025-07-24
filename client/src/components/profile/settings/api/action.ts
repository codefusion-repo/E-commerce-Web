// `components/profile/settings/api/action.ts`

import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  TwitterAuthProvider,
  unlink,
  User,
} from "firebase/auth";

// Función para vincular un nuevo proovedor de cuenta
export const postLinkProvider = async (
  providerId: string,
  auth: Auth,
  signOutAuthState: () => void,
  setFirebaseUser: (user: User) => void,
  syncProviders: (user: User) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let provider:
      | GoogleAuthProvider
      | FacebookAuthProvider
      | TwitterAuthProvider = new GoogleAuthProvider();

    let label: string;

    if (providerId === "google.com") {
      provider = new GoogleAuthProvider();
      label = "Google";
    }
    if (providerId === "facebook.com") {
      provider = new FacebookAuthProvider();
      provider.setCustomParameters({
        display: "popup",
      });
      label = "Facebook";
    }
    if (providerId === "twitter.com") {
      provider = new TwitterAuthProvider();
      provider.setCustomParameters({
        lang: "es",
      });
      label = "Twitter";
    }
    if (auth.currentUser) {
      linkWithPopup(auth.currentUser, provider)
        .then((userCredential) => {
          const user = userCredential.user;

          setFirebaseUser(user);
          syncProviders(user);
          return resolve(`${label} linked`);
        })
        .catch((err) => {
          return reject(err.code);
        });
    } else {
      signOutAuthState();
    }
  });
};

// Función para desvincular un nuevo proovedor de cuenta
export const postUnlinkProvider = async (
  providerId: string,
  auth: Auth,
  signOutAuthState: () => void,
  setFirebaseUser: (user: User) => void,
  syncProviders: (user: User) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let label: string;

    if (providerId === "google.com") {
      label = "Google";
    }
    if (providerId === "facebook.com") {
      label = "Facebook";
    }
    if (providerId === "twitter.com") {
      label = "Twitter";
    }
    if (auth.currentUser) {
      unlink(auth.currentUser, providerId)
        .then((user) => {
          setFirebaseUser(user);
          syncProviders(user);
          return resolve(`${label} unlinked`);
        })
        .catch((err) => {
          return reject(err.code);
        });
    } else {
      signOutAuthState();
    }
  });
};
