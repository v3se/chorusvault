// LoginForm.js
import React from 'react';

function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  loading,
  error,
  showNewPasswordField,
  newPassword,
  setNewPassword,
  handleNewPassword,
}) {
  return (
    <div className="login-container">
      <h1>Welcome</h1>
      <p>Login to ChorusVault</p>

      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showNewPasswordField && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'orange' }}>A new password is required. Please set your new password below:</p>
          <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button onClick={handleNewPassword}>Submit New Password</button>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
