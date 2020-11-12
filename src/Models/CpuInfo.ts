export class CpuInfo
{
    public total: number;
    public idle: number;

    constructor(total: number, idle: number)
    {
        this.total = total;
        this.idle = idle;
    }
}