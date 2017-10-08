import { Utils } from "../Utils";

test("Flattens multi dimensional array", () => {
	const arr = [[1,3], [5,6]];

	const expected = [1, 3, 5,6];

	const actual = Utils.flattenArray(arr);

	expect(actual).toEqual(expected);
});

test("Removes duplicates", () => {
	const arr = [1,3,3,2];

	const expected = [1,3,2];

	const actual = Utils.removeDuplicates(arr);

	expect(actual).toEqual(expected);
});