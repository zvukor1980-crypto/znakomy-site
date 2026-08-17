/* ZNAKOMY production Auth redirect guard.
   Must be loaded after supabase.min.js and before app.js. */
(() => {
  const PRODUCTION_URL = "https://znakomy.online/";
  if (!window.supabase?.createClient) return;

  const originalCreateClient = window.supabase.createClient.bind(window.supabase);
  window.supabase.createClient = (...args) => {
    const client = originalCreateClient(...args);
    if (!client?.auth) return client;

    const originalSignUp = client.auth.signUp.bind(client.auth);
    client.auth.signUp = (credentials = {}) => {
      const options = {...(credentials.options || {}), emailRedirectTo: PRODUCTION_URL};
      return originalSignUp({...credentials, options});
    };

    const originalResend = client.auth.resend.bind(client.auth);
    client.auth.resend = (credentials = {}) => {
      const options = {...(credentials.options || {}), emailRedirectTo: PRODUCTION_URL};
      return originalResend({...credentials, options});
    };

    const originalReset = client.auth.resetPasswordForEmail.bind(client.auth);
    client.auth.resetPasswordForEmail = (email, options = {}) =>
      originalReset(email, {...options, redirectTo: PRODUCTION_URL});

    return client;
  };
})();
