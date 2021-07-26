function fibIterative(n) {
    if (n == 0) { return [0] }
    let fib = [0, 1]
    for (let index = 2; index <= n; index++) {
        let element = fib[index - 1] + fib[index - 2]
        fib.push(element);
    }
    return fib;
}

function fibElementRecursive(n) {
    if (n == 0) { return 0 }
    if (n == 1) { return 1 }
    return fibElementRecursive(n - 1) + fibElementRecursive(n - 2)
}

function fib(n) {
    return fibProgDin(n, [])
}

function fibProgDin(n, mem) {
    if (n == 0) { return 0 }
    if (n == 1) { return 1 }
    if (mem[n] === undefined) {
        mem[n] = fibProgDin(n - 1, mem) + fibProgDin(n - 2, mem)
    }
    return mem[n]
}