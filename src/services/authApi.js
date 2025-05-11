const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const fetchAuthAPI = async (url, options = {}, errorMessage = 'Ошибка аутентификации') => {
    const groupLabel = `Auth API: ${options.method || 'GET'} ${url}`;
    const IS_DEV = import.meta.env.DEV;

    if (IS_DEV) {
        console.groupCollapsed(groupLabel);
        console.log('Request URL:', url);
        console.log('Request Options:', options);
        if (options.body && options.headers && options.headers['Content-Type'] === 'application/json') {
            try {
                console.log('Request Body (parsed):', JSON.parse(options.body));
            } catch (e) {
                console.log('Request Body (raw):', options.body);
            }
        } else if (options.body) {
            console.log('Request Body:', options.body);
        }
    }

    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
        let responseData = null;

        if (response.status === 204) {
            responseData = null;
        } else if (contentType && contentType.includes("application/json")) {
            responseData = await response.json().catch(() => null);
        } else {
            const textResponse = await response.text();
            responseData = textResponse || null;
        }

        if (IS_DEV) {
            console.log('Response Status:', response.status);
            console.log('Response Data:', responseData);
        }

        if (!response.ok) {
            const errorPayload = responseData && typeof responseData === 'object' ? responseData : { message: typeof responseData === 'string' ? responseData : response.statusText };
            if (IS_DEV) console.error('API Error Payload:', errorPayload);

            if (responseData && typeof responseData === 'string' && responseData.includes("Insert failed, duplicate id")) {
                if (IS_DEV) console.groupEnd();
                throw new Error(`${errorMessage}: Пользователь с таким ID уже существует.`);
            }
            if (errorPayload && errorPayload.message) {
                if (IS_DEV) console.groupEnd();
                throw new Error(`${errorMessage}: ${errorPayload.message} (Статус: ${response.status})`);
            }
            if (IS_DEV) console.groupEnd();
            throw new Error(`${errorMessage}: ${response.statusText} (Статус: ${response.status})`);
        }
        if (IS_DEV) console.groupEnd();
        return responseData;
    } catch (error) {
        if (IS_DEV) {
            console.error('API Call Failed Details:', error);
            console.groupEnd();
        }
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

    const userToSave = { ...userData, id: Date.now().toString() };

    return fetchAuthAPI(
        `${BASE_URL}/users`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userToSave),
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