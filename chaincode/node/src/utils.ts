export function getFormattedTime(): string {
    var currentDate = new Date();
    return currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
}

export function getRandomNumber(max: number, min: number): number {
    return Math.floor(Math.random() * max) + min;
}

export function getRandomBool(): boolean {
    return Math.random() >= 0.5;
}
