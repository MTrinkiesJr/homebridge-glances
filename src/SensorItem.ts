export class SensorItem
{
    public key: string;
    public type: string;
    public unit: string;
    public value: number;
    public label: string;

    constructor(key: string, type: string, unit: string, value: number, label:string)
    {
        this.key = key;
        this.type = type;
        this.unit = unit;
        this.value = value;
        this.label = label;
    }
}