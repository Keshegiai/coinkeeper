const IS_DEV = import.meta.env.DEV;

const getTimestamp = () => new Date().toISOString();

export const log = (...args) => {
    if (IS_DEV) {
        console.log(`[${getTimestamp()}] [LOG]`, ...args);
    }
};

export const debug = (...args) => {
    if (IS_DEV) {
        console.debug(`[${getTimestamp()}] [DEBUG]`, ...args);
    }
};

export const warn = (...args) => {
    if (IS_DEV) {
        console.warn(`[${getTimestamp()}] [WARN]`, ...args);
    }
};

export const error = (...args) => {
    if (IS_DEV) {
        console.error(`[${getTimestamp()}] [ERROR]`, ...args);
    }
};

export const logAction = (componentName, functionName, details = {}) => {
    if (IS_DEV) {
        console.groupCollapsed(`[${getTimestamp()}] [ACTION] ${componentName} > ${functionName}`);
        console.log('Details:', details);
        console.groupEnd();
    }
};

export const logStateChange = (componentName, stateName, newValue, oldValue) => {
    if (IS_DEV) {
        console.groupCollapsed(`[${getTimestamp()}] [STATE] ${componentName} > ${stateName} changed`);
        console.log('Old Value:', oldValue);
        console.log('New Value: ', newValue);
        console.groupEnd();
    }
};

export const logEffect = (componentName, effectName, dependencies) => {
    if (IS_DEV) {
        console.log(`[${getTimestamp()}] [EFFECT] ${componentName} > ${effectName} triggered. Dependencies:`, dependencies || 'none');
    }
};

export const logError = (componentName, functionName, errorObj, contextInfo = {}) => {
    if (IS_DEV) {
        console.groupCollapsed(`[${getTimestamp()}] [ERROR_HANDLER] ${componentName} > ${functionName}`);
        console.error('Error:', errorObj);
        console.log('Context/Details:', contextInfo);
        console.groupEnd();
    }
};