import { Coords } from "../Coords";

test("Modify function", () => {
	
	const coords = new Coords(1,2,3,4);

	const newCoords = coords.modify({y: 10});

	const expected = new Coords(1,10,3,4);

	expect(newCoords).toEqual(expected);

});