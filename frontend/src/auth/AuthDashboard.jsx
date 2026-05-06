import React, { useEffect, useMemo, useState } from "react";
import { authApi } from "./api";

export function AuthDashboard({
  token,
  user,
  authSessions,
  onAuthSuccess,
  onSwitchSession,
  onRemoveSession,
  setToken,
  setUser,
  setNotice,
  setError,
  initialResetToken,
}) {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationToken, setActivationToken] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken || "");
  const [resetPassword, setResetPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState("");
  const [providers, setProviders] = useState({ google: false, github: false });

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
      setMode("reset");
    }
  }, [initialResetToken]);

  useEffect(() => {
    let mounted = true;
    authApi
      .providers()
      .then((res) => {
        if (mounted) setProviders(res.providers || {});
      })
      .catch(() => {
        if (mounted) setProviders({ google: false, github: false });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = user?.role === "admin";
  const canReadUsers = user?.role === "admin" || user?.role === "manager";

  async function run(action, fn) {
    setError("");
    setNotice("");
    setBusy(action);
    try {
      await fn();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusy("");
    }
  }

  const roleSummary = useMemo(() => {
    if (!user) return "Sign in to access the secured system.";
    if (user.role === "admin") return "Admin: full control over users, roles, and platform transactions.";
    if (user.role === "manager") return "Manager: read-only operational visibility.";
    return "Normal user: use the system only with standard access.";
  }, [user]);

  async function autoSendResetAndOpen() {
    await run("forgot", async () => {
      const res = await authApi.forgotPassword(email);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
      }
      setMode("reset");
      setNotice(res?.message || "Reset email has been sent to the entered email if it exists.");
    });
  }

  return (
    <section className="rounded-md border border-zinc-900 bg-zinc-950/60 p-5 space-y-5">
      <h2 className="text-xl font-semibold text-white">Authentication & Authorization</h2>
      <p className="text-sm text-zinc-400">{roleSummary}</p>

      {!token ? (
        <div className="max-w-xl">
          {mode === "register" ? (
            <form
              className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setNotice("");
                setBusy("register");
                try {
                  const res = await authApi.register({ name, email, password });
                  if (res.activationToken) {
                    setActivationToken(res.activationToken);
                    setMode("activate");
                    setNotice(res.message || "Registration successful. Use the activation token below to activate your account.");
                  } else {
                    setMode("login");
                    setNotice(res.message || "Registration complete. Activation link sent to email. Please login.");
                  }
                } catch (err) {
                  if (err?.status === 409) {
                    setMode("login");
                    setNotice("This email is already registered. Please login.");
                  } else {
                    setError(err.message || "Registration failed.");
                  }
                } finally {
                  setBusy("");
                }
              }}
            >
              <h3 className="text-white font-medium">Register</h3>
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={busy === "register"} className="h-10 w-full rounded-md bg-ember-600 text-white">
                {busy === "register" ? "Creating..." : "Create account"}
              </button>
              <button type="button" className="text-sm text-zinc-400 underline underline-offset-2" onClick={() => setMode("login")}>
                Already have account?
              </button>
            </form>
          ) : null}

          {mode === "login" ? (
            <form
              className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setNotice("");
                setBusy("login");
                try {
                  const res = await authApi.login({ email, password });
                  onAuthSuccess(res);
                  setNotice("Logged in successfully.");
                } catch (err) {
                  if (err?.data?.code === "ACCOUNT_INACTIVE") {
                    if (err?.data?.activationToken) {
                      setActivationToken(err.data.activationToken);
                    }
                    setMode("activate");
                    setNotice(err.data.message || "Account inactive. Activation email has been sent. Please activate.");
                  } else if (err?.status === 401) {
                    setError("Invalid email or password.");
                  } else {
                    setError(err.message || "Login failed.");
                  }
                } finally {
                  setBusy("");
                }
              }}
            >
              <h3 className="text-white font-medium">Login</h3>
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={busy === "login"} className="h-10 w-full rounded-md bg-emerald-600 text-white">
                {busy === "login" ? "Signing in..." : "Sign in"}
              </button>
              <button type="button" className="h-10 w-full rounded-md border border-zinc-800 text-zinc-200" onClick={autoSendResetAndOpen}>
                Forgot / Reset Password
              </button>
              <div className="grid grid-cols-2 gap-2">
                {providers.google ? (
                  <a className="h-9 rounded-md border border-zinc-800 grid place-items-center text-sm text-zinc-300 hover:bg-zinc-900" href={authApi.googleUrl}>
                    Google
                  </a>
                ) : (
                  <button type="button" disabled className="h-9 rounded-md border border-zinc-900 text-sm text-zinc-600">
                    Google
                  </button>
                )}
                {providers.github ? (
                  <a className="h-9 rounded-md border border-zinc-800 grid place-items-center text-sm text-zinc-300 hover:bg-zinc-900" href={authApi.githubUrl}>
                    GitHub
                  </a>
                ) : (
                  <button type="button" disabled className="h-9 rounded-md border border-zinc-900 text-sm text-zinc-600">
                    GitHub
                  </button>
                )}
              </div>
              <button type="button" className="text-sm text-zinc-400 underline underline-offset-2" onClick={() => setMode("register")}>
                New user? Create account
              </button>
            </form>
          ) : null}

          {mode === "activate" ? (
            <form
              className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run("activate", async () => {
                  const res = await authApi.activate(activationToken);
                  onAuthSuccess(res);
                  setNotice("Account activated.");
                });
              }}
            >
              <h3 className="text-white font-medium">Activate Account</h3>
              <input
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
                placeholder="Activation token"
                value={activationToken}
                onChange={(e) => setActivationToken(e.target.value)}
              />
              <button disabled={busy === "activate"} className="h-10 w-full rounded-md bg-indigo-600 text-white">
                Activate
              </button>
              <button type="button" className="text-sm text-zinc-400 underline underline-offset-2" onClick={() => setMode("login")}>
                Back to login
              </button>
            </form>
          ) : null}

          {mode === "reset" ? (
            <form
              className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run("reset", async () => {
                  await authApi.resetPassword({ token: resetToken, password: resetPassword });
                  setPassword(resetPassword);
                  setResetPassword("");
                  setMode("login");
                  setNotice("Password reset complete. Login with new password.");
                });
              }}
            >
              <h3 className="text-white font-medium">Forgot / Reset Password</h3>
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button
                type="button"
                disabled={busy === "forgot"}
                className="h-10 w-full rounded-md border border-zinc-800 text-zinc-200"
                onClick={() =>
                  run("forgot", async () => {
                    const res = await authApi.forgotPassword(email);
                    if (res?.resetToken) {
                      setResetToken(res.resetToken);
                    }
                    setNotice(res?.message || "Reset email sent to the entered email if it exists.");
                  })
                }
              >
                Send reset link
              </button>
              <input className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm" placeholder="Reset token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
              <input
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm"
                placeholder="New password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy === "reset"}
                className="h-10 w-full rounded-md bg-amber-600 text-white"
              >
                Reset password
              </button>
              <button type="button" className="text-sm text-zinc-400 underline underline-offset-2" onClick={() => setMode("login")}>
                Back to login
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-zinc-900 bg-black/40 p-4">
            <p className="text-zinc-300">
              Signed in as <span className="text-white font-semibold">{user?.email}</span> ({user?.role})
            </p>
            <button
              className="mt-3 h-9 px-4 rounded-md border border-zinc-700 text-zinc-200"
              onClick={() => {
                setToken("");
                setUser(null);
                localStorage.removeItem("escrowly-auth-token");
              }}
            >
              Logout
            </button>
          </div>

          {authSessions?.length ? (
            <div className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-2">
              <h3 className="text-white font-medium">Saved accounts on this device</h3>
              {authSessions.map((session) => (
                <div key={session.email} className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm">
                  <span className="text-zinc-200">{session.email}</span>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded border border-zinc-700 text-zinc-200" onClick={() => onSwitchSession(session.token)}>
                      Switch
                    </button>
                    <button className="px-2 py-1 rounded border border-red-800 text-red-300" onClick={() => onRemoveSession(session.email)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {canReadUsers ? (
            <div className="rounded-md border border-zinc-900 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">User Directory</h3>
                <button
                  className="h-9 px-3 rounded-md border border-zinc-800 text-zinc-200"
                  onClick={() =>
                    run("users", async () => {
                      const res = await authApi.listUsers(token);
                      setUsers(res.users);
                    })
                  }
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2">
                {users.map((row) => (
                  <div key={row.id} className="rounded-md border border-zinc-800 bg-zinc-950/80 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-zinc-100">{row.email}</div>
                        <div className="text-zinc-400">
                          role={row.role} | active={String(row.isActive)} | blocked={String(row.isBlocked)}
                        </div>
                      </div>
                      {isAdmin ? (
                        <div className="flex flex-wrap gap-1">
                          <button className="px-2 py-1 rounded border border-zinc-700" onClick={() => run("role", () => authApi.updateRole(token, row.id, "user"))}>User</button>
                          <button className="px-2 py-1 rounded border border-zinc-700" onClick={() => run("role", () => authApi.updateRole(token, row.id, "manager"))}>Manager</button>
                          <button className="px-2 py-1 rounded border border-zinc-700" onClick={() => run("transfer", () => authApi.transferAdmin(token, row.id))}>Make Admin</button>
                          {!row.isBlocked ? (
                            <button className="px-2 py-1 rounded border border-red-800 text-red-300" onClick={() => run("block", () => authApi.blockUser(token, row.id))}>Block</button>
                          ) : (
                            <button className="px-2 py-1 rounded border border-emerald-800 text-emerald-300" onClick={() => run("unblock", () => authApi.unblockUser(token, row.id))}>Unblock</button>
                          )}
                          <button className="px-2 py-1 rounded border border-red-700 text-red-300" onClick={() => run("delete", () => authApi.deleteUser(token, row.id))}>Delete</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {!users.length ? <div className="text-zinc-500 text-sm">No users loaded yet.</div> : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
