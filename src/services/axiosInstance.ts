import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 모든 요청에 액세스 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 시 자동으로 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않았으며, refresh 엔드포인트가 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('사용자 데이터가 없습니다');
        }

        const user = JSON.parse(userStr);
        const refreshToken = user.refreshToken;

        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다');
        }

        console.log('액세스 토큰 만료, 갱신 중...');

        // 리프레시 토큰으로 새 액세스 토큰 발급
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const newData = response.data;

        // 새 토큰으로 사용자 정보 업데이트
        const updatedUser = {
          ...user,
          accessToken: newData.accessToken,
          refreshToken: newData.refreshToken || refreshToken, // 새 리프레시 토큰이 있으면 업데이트
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 원래 요청에 새 토큰 설정
        originalRequest.headers.Authorization = `Bearer ${newData.accessToken}`;

        console.log('토큰 갱신 성공');

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 -> 로그아웃
        console.error('토큰 갱신 실패:', refreshError);
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // 에러 메시지를 한글로 변환
    if (error.response) {
      const status = error.response.status;
      let koreanMessage = '';

      switch (status) {
        case 400:
          koreanMessage = '잘못된 요청입니다';
          break;
        case 401:
          koreanMessage = '인증이 필요합니다';
          break;
        case 403:
          koreanMessage = '접근 권한이 없습니다';
          break;
        case 404:
          koreanMessage = '요청한 리소스를 찾을 수 없습니다';
          break;
        case 500:
          koreanMessage = '서버 오류가 발생했습니다';
          break;
        default:
          koreanMessage = `요청 실패 (상태 코드: ${status})`;
      }

      // 서버에서 제공한 메시지가 있으면 사용, 없으면 기본 메시지 사용
      const serverMessage = error.response.data?.message || error.response.data?.error;
      error.message = serverMessage || koreanMessage;
    } else if (error.request) {
      error.message = '서버에 연결할 수 없습니다';
    } else {
      error.message = error.message || '알 수 없는 오류가 발생했습니다';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
