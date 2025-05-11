const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const getUserId = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData).id;
        } catch (e) {
            return null;
        }
    }
    return null;
};

const fetchAPI = async (url, options = {}, errorMessage = 'Ошибка API') => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = { ...options, headers };

    const groupLabel = `API: ${fetchOptions.method || 'GET'} ${url}`;
    const IS_DEV = import.meta.env.DEV;

    if (IS_DEV) {
        console.groupCollapsed(groupLabel);
        console.log('Request URL:', url);
        console.log('Request Options:', fetchOptions);
        if (fetchOptions.body && headers['Content-Type'] === 'application/json') {
            try {
                console.log('Request Body (parsed):', JSON.parse(fetchOptions.body));
            } catch (e) {
                console.log('Request Body (raw):', fetchOptions.body);
            }
        } else if (fetchOptions.body) {
            console.log('Request Body:', fetchOptions.body);
        }
    }

    try {
        const response = await fetch(url, fetchOptions);

        const contentType = response.headers.get("content-type");
        let responseData = null;
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json().catch(() => null);
        } else if (response.status === 204 || (fetchOptions.method === 'DELETE' && response.status === 200 && (response.headers.get("content-length") === "0" || !response.headers.get("content-length") ))) {
            responseData = null;
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

            if (response.status === 401) {
                if (IS_DEV) console.groupEnd();
                throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
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
        if (error.message.startsWith(errorMessage) || error.message.startsWith('Ошибка авторизации') || error instanceof TypeError) {
            throw error;
        }
        throw new Error(`${errorMessage}: ${error.message || 'Сетевая ошибка или сервер недоступен'}`);
    }
};

export const getCategoriesAPI = async () => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для запроса категорий.");
    return fetchAPI(
        `${BASE_URL}/categories?userId=${userId}&_sort=name&_order=asc`,
        {},
        'Не удалось загрузить категории'
    );
};

export const addCategoryAPI = async (categoryData) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для добавления категории.");
    const dataWithUser = { ...categoryData, userId };
    return fetchAPI(
        `${BASE_URL}/categories`,
        {
            method: 'POST',
            body: JSON.stringify(dataWithUser),
        },
        'Не удалось добавить категорию'
    );
};

export const updateCategoryAPI = async (categoryId, categoryData) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для обновления категории.");
    const dataWithUser = { ...categoryData, userId };
    return fetchAPI(
        `${BASE_URL}/categories/${categoryId}`,
        {
            method: 'PUT',
            body: JSON.stringify(dataWithUser),
        },
        'Не удалось обновить категорию'
    );
};

export const deleteCategoryAPI = async (categoryId) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для удаления категории.");
    return fetchAPI(
        `${BASE_URL}/categories/${categoryId}`,
        { method: 'DELETE' },
        'Не удалось удалить категорию'
    );
};

export const getTransactionsAPI = async () => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для запроса транзакций.");
    return fetchAPI(
        `${BASE_URL}/transactions?userId=${userId}&_sort=date,createdAt&_order=desc,desc`,
        {},
        'Не удалось загрузить транзакции'
    );
};

export const addTransactionAPI = async (transactionData) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для добавления транзакции.");
    const dataWithUser = { ...transactionData, userId };
    return fetchAPI(
        `${BASE_URL}/transactions`,
        {
            method: 'POST',
            body: JSON.stringify(dataWithUser),
        },
        'Не удалось добавить транзакцию'
    );
};

export const updateTransactionAPI = async (transactionId, transactionData) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для обновления транзакции.");
    const dataWithUser = { ...transactionData, userId };
    return fetchAPI(
        `${BASE_URL}/transactions/${transactionId}`,
        {
            method: 'PUT',
            body: JSON.stringify(dataWithUser),
        },
        'Не удалось обновить транзакцию'
    );
};

export const deleteTransactionAPI = async (transactionId) => {
    const userId = getUserId();
    if (!userId) throw new Error("Пользователь не аутентифицирован для удаления транзакции.");
    return fetchAPI(
        `${BASE_URL}/transactions/${transactionId}`,
        { method: 'DELETE' },
        'Не удалось удалить транзакцию'
    );
};