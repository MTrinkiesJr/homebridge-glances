export class MemoryInfo
{
    public percent: number;
    public total: number;
    public used: number;

    constructor(percent: number, total: number, used: number)
    {
        this.percent = percent;
        this.total = total;
        this.used = used;
    }
}