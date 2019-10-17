import stateStorage from './test-storage';

export function runExpression(expression: String): boolean {
    const expressionArray = expression.split(/[&|]/);
    const expressionType = expression.match(/[&|]/g);
    let expressionResult = runCondition(expressionArray[0]);

    for (let expressionIndex = 1; expressionIndex < expressionArray.length; expressionIndex++) {
        const condtionResult = runCondition(expressionArray[expressionIndex]);
        if (expressionType && expressionType[expressionIndex - 1] === '&') {
            expressionResult = expressionResult && condtionResult;
        }
        if (expressionType && expressionType[expressionIndex - 1] === '|') {
            expressionResult = expressionResult || condtionResult;
        }
    }
    return expressionResult;
}

function runCondition(srcCondition: String): boolean {
    const condition = srcCondition.match(/[<>=]/);
    if (!condition) {
        throw new Error(`Out of condition in ${srcCondition}`);
    }

    const [device, controlValue] = srcCondition.split(/[<>=]/);
    const [deviceId, parameter] = device.split('.');
    const currentValue = stateStorage.getValue(deviceId, parameter);
    return compare(parseInt(controlValue), condition[0], currentValue);
}

function compare(controlValue: number | boolean, condtion: String, deviceValue: number | boolean): boolean {
    if (condtion === '=') {
        return controlValue === deviceValue;
    }
    if (condtion === '<') {
        return controlValue < deviceValue;
    }
    if (condtion === '>') {
        return controlValue > deviceValue;
    }
    throw new Error(`Unknown condition ${condtion}`);
}
