import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import type { AuthResponse } from '../types';
import '../Login.css';

interface LoginProps {
  onLoginSuccess: (userData: AuthResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await AuthService.register(username, password, email, role);
        setIsRegister(false);
        setError('회원가입이 완료되었습니다! 로그인해주세요.');
        setPassword('');
        setEmail('');
        setRole('USER');
      } else {
        const response = await AuthService.login(username, password);
        onLoginSuccess(response);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '인증에 실패했습니다';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>사용자명</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="사용자명을 입력하세요"
              className="form-input"
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="이메일을 입력하세요"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>역할</label>
                <div className="role-selector">
                  <div 
                    className={`role-option ${role === 'USER' ? 'selected' : ''}`}
                    onClick={() => setRole('USER')}
                  >
                    <div className="role-radio">
                      {role === 'USER' && <div className="role-radio-dot"></div>}
                    </div>
                    <div className="role-content">
                      <div className="role-title">사용자</div>
                      <div className="role-description">제한된 접근 권한</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`role-option ${role === 'ADMIN' ? 'selected' : ''}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    <div className="role-radio">
                      {role === 'ADMIN' && <div className="role-radio-dot"></div>}
                    </div>
                    <div className="role-content">
                      <div className="role-title">관리자</div>
                      <div className="role-description">모니터링 전체 접근 권한</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="toggle-auth">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setRole('USER');
            }}
            className="btn-link"
          >
            {isRegister
              ? '이미 계정이 있으신가요? 로그인'
              : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
