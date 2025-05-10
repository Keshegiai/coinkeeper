const YOUR_NETWORK_IP = '192.168.231.9';
const BASE_URL = `http://${YOUR_NETWORK_IP}:3001`;

const fetchAPI = async (url, options = {}, errorMessage = 'Ошибка API') => {
    console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');
    try {
        const response = await fetch(url, options);
        const responseData = (response.status === 204 || (options.method === 'DELETE' && response.status === 200 && response.headers.get("content-length") === "2" )) ? null : await response.json().catch(() => null);

        if (!response.ok) {
            console.error(`API Error Response (${response.status}) for ${options.method || 'GET'} ${url}:`, responseData || response.statusText);
            throw new Error(`${errorMessage}: ${response.statusText} (Статус: ${response.status})`);
        }
        console.log(`API Response (${response.status}) for ${options.method || 'GET'} ${url}:`, responseData);
        return responseData;
    } catch (error) {
        console.error(`Workspace API Call Failed for ${options.method || 'GET'} ${url}:`, error);
        if (error.message.startsWith(errorMessage) || error instanceof TypeError) {
            throw error;
        }
        throw new Error(`${errorMessage}: ${error.message || 'Сетевая ошибка или сервер недоступен'}`);
    }
};

export const getCategoriesAPI = async () => {
    return fetchAPI(
        `${BASE_URL}/categories?_sort=name&_order=asc`,
        {},
        'Не удалось загрузить категории'
    );
};

export const addCategoryAPI = async (categoryData) => {
    return fetchAPI(
        `${BASE_URL}/categories`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        },
        'Не удалось добавить категорию'
    );
};

export const updateCategoryAPI = async (categoryId, categoryData) => {
    return fetchAPI(
        `${BASE_URL}/categories/${categoryId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        },
        'Не удалось обновить категорию'
    );
};

export const deleteCategoryAPI = async (categoryId) => {
    return fetchAPI(
        `${BASE_URL}/categories/${categoryId}`,
        { method: 'DELETE' },
        'Не удалось удалить категорию'
    );
};

export const getTransactionsAPI = async () => {
    return fetchAPI(
        `${BASE_URL}/transactions?_sort=date,createdAt&_order=desc,desc`,
        {},
        'Не удалось загрузить транзакции'
    );
};

export const addTransactionAPI = async (transactionData) => {
    return fetchAPI(
        `${BASE_URL}/transactions`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData),
        },
        'Не удалось добавить транзакцию'
    );
};

export const updateTransactionAPI = async (transactionId, transactionData) => {
    return fetchAPI(
        `${BASE_URL}/transactions/${transactionId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData),
        },
        'Не удалось обновить транзакцию'
    );
};

export const deleteTransactionAPI = async (transactionId) => {
    return fetchAPI(
        `${BASE_URL}/transactions/${transactionId}`,
        { method: 'DELETE' },
        'Не удалось удалить транзакцию'
    );
};