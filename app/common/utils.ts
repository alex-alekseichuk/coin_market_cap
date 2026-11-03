export function dtStr(d?: Date | null | undefined): string {
    d = d ?? new Date();
    return `${d.getFullYear()}-${('00' + (d.getMonth() + 1)).slice(-2)}-${('00' + d.getDate()).slice(-2)} ${('00' + d.getHours()).slice(-2)}:${('00' + d.getMinutes()).slice(-2)}:${('00' + d.getSeconds()).slice(-2)}`;
}

export function strDt(s: String): Date {
    return new Date(s.replace(' ', 'T'));
}

