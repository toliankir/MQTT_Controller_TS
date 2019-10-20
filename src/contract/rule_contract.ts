export interface RuleHandler {
    checkAllRules(): void;
    initRules(): any;
}

export interface RuleItem {
    id: number,
    rule: String,
    values: SettedValues,
    target: String
}

export interface SettedValues {
    defaultValue: number,
    trueValue: number,
    falseValue: number
}