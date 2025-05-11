const BASE_URL = 'http://localhost:3001';

const fetchAuthAPI = async (url, options = {}, errorMessage = 'Ошибка аутентификации') => {
    console.log(`Auth API Request: ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');
    try {
        const response = await fetch(url, options);
        const responseData = response.status === 204 ? null : await response.json().catch(() => null);

        if (!response.ok) {
            const errorPayload = responseData || { message: response.statusText };
            console.error(`Auth API Error Response (${response.status}) for ${options.method || 'GET'} ${url}:`, errorPayload);
            if (responseData && typeof responseData === 'string' && responseData.includes("Insert failed, duplicate id")) {
                throw new Error(`${errorMessage}: Пользователь с таким ID уже существует.`);
            }
            if (responseData && responseData.message) {
                throw new Error(`${errorMessage}: ${responseData.message} (Статус: ${response.status})`);
            }
            throw new Error(`${errorMessage}: ${response.statusText} (Статус: ${response.status})`);
        }
        console.log(`Auth API Response (${response.status}) for ${options.method || 'GET'} ${url}:`, responseData);
        return responseData;
    } catch (error) {
        console.error(`Auth API Call Failed for ${options.method || 'GET'} ${url}:`, error);
        if (error.message.startsWith(errorMessage) || error instanceof TypeError) {
            throw error;
        }
        throw new Error(`${errorMessage}: ${error.message || 'Сетевая ошибка или сервер недоступен'}`);
    }
};

export const registerUserAPI = async (userData) => {
    const existingUsers = await fetchAuthAPI(
        `${BASE_URL}/users?email=${encodeURIComponent(userData.email)}`,
        {},
        'Ошибка проверки пользователя'
    );

    if (existingUsers && existingUsers.length > 0) {
        throw new Error('Пользователь с таким email уже существует.');
    }

    return fetchAuthAPI(
        `${BASE_URL}/users`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        },
        'Не удалось зарегистрировать пользователя'
    );
};

export const loginUserAPI = async (credentials) => {
    const users = await fetchAuthAPI(
        `${BASE_URL}/users?email=${encodeURIComponent(credentials.email)}`,
        {},
        'Ошибка входа'
    );

    if (users && users.length > 0) {
        const user = users[0];
        if (user.password === credentials.password) {
            const { password, ...userWithoutPassword } = user;
            return { token: `fake-jwt-token-for-${user.id}-${Date.now()}`, user: userWithoutPassword };
        } else {
            throw new Error('Неверный пароль.');
        }
    }
    throw new Error('Пользователь с таким email не найден.');
};