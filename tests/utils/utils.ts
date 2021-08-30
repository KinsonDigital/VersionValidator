export interface TestParams2<P1, P2> {
    p1: P1;

    p2: P2;
}

export interface TestParams3<P1, P2, P3> {
    p1: P1;

    p2: P2;

    p3: P3;
}

export function eachParams2<T1, T2>(testParams: Array<TestParams2<T1, T2>>, testFn: (param1: T1, param2: T2) => void): void {
    testParams.forEach(params => {
        testFn(params.p1, params.p2);
    });
}

export function eachParams3<T1, T2, T3>(testParams: Array<TestParams3<T1, T2, T3>>, testFn: (param1: T1, param2: T2, param3: T3) => void): void {
    testParams.forEach(params => {
        testFn(params.p1, params.p2, params.p3);
    });
}