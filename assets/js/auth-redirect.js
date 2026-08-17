/* ZNAKOMY production Auth redirect guard.
   Loaded after app.js; patches the already-created Supabase client. */
(() => {
  const PRODUCTION_URL = "https://znakomy.online/";
  if (typeof db === "undefined" || !db?.auth) return;

  const auth = db.auth;
  if (auth.__znakomyProductionRedirectPatched) return;

  const originalSignUp = auth.signUp.bind(auth);
  auth.signUp = (credentials = {}) => {
    const options = {...(credentials.options || {}), emailRedirectTo: PRODUCTION_URL};
    return originalSignUp({...credentials, options});
  };

  const originalResend = auth.resend.bind(auth);
  auth.resend = (credentials = {}) => {
    const options = {...(credentials.options || {}), emailRedirectTo: PRODUCTION_URL};
    return originalResend({...credentials, options});
  };

  const originalReset = auth.resetPasswordForEmail.bind(auth);
  auth.resetPasswordForEmail = (email, options = {}) =>
    originalReset(email, {...options, redirectTo: PRODUCTION_URL});

  Object.defineProperty(auth, "__znakomyProductionRedirectPatched", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
