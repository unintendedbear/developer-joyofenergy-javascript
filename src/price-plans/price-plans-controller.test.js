const { meters } = require("../meters/meters");
const { pricePlanNames } = require("./price-plans");
const { readings } = require("../readings/readings");
const { compare, recommend, calculateCostForLastWeek } = require("./price-plans-controller");

describe("price plans", () => {
    it("should compare usage cost for all price plans", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = {
            pricePlanComparisons: [
                {
                    [pricePlanNames.PRICEPLAN0]: 0.26785 / 48 * 10,
                },
                {
                    [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
                },
                {
                    [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
                },
            ],
            smartMeterId: meters.METER0
        };

        const recommendation = compare(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {}
        });

        expect(recommendation).toEqual(expected);
    });

    it("should recommend usage cost for all price plans by ordering from cheapest to expensive", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = [
            {
                [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
            },
            {
                [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
            },
            {
                [pricePlanNames.PRICEPLAN0]: 0.26785 / 48 * 10,
            },
        ];

        const recommendation = recommend(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {}
        });

        expect(recommendation).toEqual(expected);
    });

    it("should limit recommendation", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = [
            {
                [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
            },
            {
                [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
            },
        ];

        const recommendation = recommend(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {
                limit: 2
            }
        });

        expect(recommendation).toEqual(expected);
    });

    it ("should throw an error when the plan is not specified for the calculation of costs", () => {
        const { getReadings } = readings({
            [meters.METER0]: [],
        });

        expect(() => {
            calculateCostForLastWeek(getReadings, {
                params: {
                    smartMeterId: meters.METER0,
                },
                query: {}
            })
        }).toThrowError("You must specify a plan");
    });

    it ("should return the cost of the usage for readings in the last 7 days", () => {
        const now = Math.floor(Date.now() / 1000),
            aDayInMilliseconds = 24 * 60 * 60,
            yesterday = now - aDayInMilliseconds;

        const { getReadings } = readings({
            [meters.METER0]: [
                { time: now, reading: 0.26785 },
                { time: yesterday, reading: 0.26785 }
            ],
        });

        const expectedResult = {
            costForLastSevenDays: 0.26785 / 24 * 10
        }

        const costResult = calculateCostForLastWeek(getReadings, {
            params: {
                smartMeterId: meters.METER0,
            },
            query: {
                plan: "price-plan-0"
            }
        });

        expect(costResult).toStrictEqual(expectedResult);
    });
});
