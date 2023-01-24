export function formatNumber(nbr: number, decimals: number = 1) {
    let [integer, float] = nbr.toString().split('.')
    if (integer.length >= 5) {
        integer = integer.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
    }
    if (float !== undefined) {
        float = float.slice(0, decimals)
        return [integer, float].join('.')
    } else {
        return integer
    }
}