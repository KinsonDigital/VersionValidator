/**
 * Holds a total of 2 parameters worth of data to use in a single unit test.
 */
export interface TestParams2<P1, P2> {
	/**
	 * Parameter 1.
	 */
	 p1: P1;

	/**
	 * Parameter 2.
	 */
	 p2: P2;
}

/**
 * Holds a total of 3 parameters worth of data to use in a single unit test.
 */
export interface TestParams3<P1, P2, P3> {
	/**
	 * Parameter 1.
	 */
	p1: P1;

	/**
	 * Parameter 2.
	 */
	p2: P2;

	/**
	 * Parameter 3.
	 */
	p3: P3;
}

/**
 * Runs the testFn() for each set of parameters to be used in a unit test.
 * @param testParams The array of parameters to be used in a unit test.
 * @param testFn The unit test function to execute with a set of parameter data.
 * @example
 * ``` ts
 * eachParams3([
 *     { p1: 1, p2: 2, p3: 3, },
 * ],
 * (op1: number, op2: number, expected: number) => {
 * 	if(`Add | When adding \'${op1}\' and \'${op2}\' | Returns \'${expected}\'`, () => {
 * 		// Arrange
 * 		const calc: Calculator = new Calculator();
 * 
 * 		// Act
 * 		const actual: number = calc.Add(op1, op2);
 * 
 * 		// Assert
 * 		expected(actual).toBe(expected);
 * 	});
 * });
 * ```
 */
export function eachParams2<T1, T2> (testParams: Array<TestParams2<T1, T2>>, testFn: (param1: T1, param2: T2) => void): void {
	testParams.forEach(params => {
		testFn(params.p1, params.p2);
	});
}

/**
 * Runs the testFn() for each set of parameters to be used in a unit test.
 * @param testParams The array of parameters to be used in a unit test.
 * @param testFn The unit test function to execute with a set of parameter data.
 * @example
 * ``` ts
 * eachParams3([
 *     { p1: 1, p2: 2, p3: 3, p4: 6 },
 * ],
 * (op1: number, op2: number, op4: number, expected: number) => {
 * 	if(`Add | When adding \'${op1}\' and \'${op2}\' \'${op3}\' | Returns \'${expected}\'`, () => {
 * 		// Arrange
 * 		const calc: Calculator = new Calculator();
 * 
 * 		// Act
 * 		const actual: number = calc.Add(op1, op2, op3);
 * 
 * 		// Assert
 * 		expected(actual).toBe(expected);
 * 	});
 * });
 * ```
 */
export function eachParams3<T1, T2, T3> (testParams: Array<TestParams3<T1, T2, T3>>, testFn: (param1: T1, param2: T2, param3: T3) => void): void {
	testParams.forEach(params => {
		testFn(params.p1, params.p2, params.p3);
	});
}