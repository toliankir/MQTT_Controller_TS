import { RuleHandler, RuleItem } from './contract/rule_contract';
import { sendMessage } from './mqtt';
import mysqlStorage from './sql_storage';
import state from './state';
import logger from './logger';

export default new class Rule implements RuleHandler {
    rules: RuleItem[] | null = null;
    minDelay = 5000;
    lastCheck = 0;

    constructor() {
        if (process.env.RULE_CHECK_MIN_DELAY) {
            this.minDelay = parseInt(process.env.RULE_CHECK_MIN_DELAY);
        }
    }


    checkAllRules(): void {
        if (!this.rules || Date.now() - this.lastCheck < this.minDelay) {
            return;
        }
        this.lastCheck = Date.now();

        for (let rule of this.rules) {
            let expressionResult;
            try {
                expressionResult = this.runExpression(rule.rule);
                sendMessage(rule.target.toString(), expressionResult ? rule.values.trueValue.toString() : rule.values.falseValue.toString());
            } catch (err) {
                sendMessage(rule.target.toString(), rule.values.defaultValue.toString());
            }
            logger.log({
                level: 'debug',
                message: `RULE: ${rule.rule} - ${expressionResult}, ${rule.target}-> ${expressionResult ? rule.values.trueValue : rule.values.falseValue}.`
            });
        }
    }

    async initRules() {
        this.rules = await mysqlStorage.getRules();
    }

    private runExpression(expression: String): boolean {
        const expressionArray = expression.split(/[&|]/);
        const expressionType = expression.match(/[&|]/g);
        let expressionResult = this.runCondition(expressionArray[0]);

        for (let expressionIndex = 1; expressionIndex < expressionArray.length; expressionIndex++) {
            const condtionResult = this.runCondition(expressionArray[expressionIndex]);
            if (expressionType && expressionType[expressionIndex - 1] === '&') {
                expressionResult = expressionResult && condtionResult;
            }
            if (expressionType && expressionType[expressionIndex - 1] === '|') {
                expressionResult = expressionResult || condtionResult;
            }
        }
        return expressionResult;
    }

    private runCondition(srcCondition: String): boolean {
        const condition = srcCondition.match(/[<>=]/);
        if (!condition) {
            throw new Error(`Out of condition in ${srcCondition}`);
        }
        const [device, controlValue] = srcCondition.split(/[<>=]/);
        const [deviceId, parameter] = device.split('.');
        const currentValue = state.getValue(deviceId, parameter);
        const test = this.compare(parseInt(controlValue), condition[0], currentValue);
        return test;
    }

    private compare(controlValue: number | boolean, condtion: String, deviceValue: number | boolean): boolean {
        if (condtion === '=') {
            return controlValue === deviceValue;
        }
        if (condtion === '<') {
            return deviceValue < controlValue;
        }
        if (condtion === '>') {
            return deviceValue > controlValue;
        }
        throw new Error(`Unknown condition ${condtion}`);
    }
}