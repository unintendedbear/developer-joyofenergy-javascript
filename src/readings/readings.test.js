const { meters } = require("../meters/meters");
const { getLastWeekReadings, readings } = require("./readings");
const { readingsData } = require("./readings.data");

describe("readings", () => {
    it("should get readings", () => {
        const { getReadings } = readings(readingsData);

        expect(getReadings(meters.METER0).length).toBeGreaterThan(0);
    });

    it("should get readings with meter id", () => {
        const { getReadings } = readings(readingsData);

        expect(getReadings(meters.METER1)[0]).toHaveProperty("time");
        expect(getReadings(meters.METER1)[0]).toHaveProperty("reading");
    });

    it("should get empty array if can't find meter id", () => {
        const { getReadings } = readings(readingsData);

        expect(getReadings("meter-no")).toHaveLength(0);
    });

    it("should set readings with meter id", () => {
        const { getReadings, setReadings } = readings(readingsData);

        const length = getReadings(meters.METER0).length;

        setReadings(meters.METER0, [
            { time: 923874692387, reading: 0.26785 },
            { time: 923874692387, reading: 0.26785 },
            { time: 923874692387, reading: 0.111 },
        ]);

        const newLength = getReadings(meters.METER0).length;

        expect(length + 3).toEqual(newLength);
    });

    it("should get the readings for the last seven days for a meter with one reading from today", () => {
        const now = Math.floor(Date.now() / 1000);
        const { getReadings } = readings({
            [meters.METER2]: [
                { time: now, reading: 0.26785 }
            ],
        });

        const expectedReadings = {
            [meters.METER2]: [
                { time: now, reading: 0.26785 }
            ],
        };

        const result = getLastWeekReadings(getReadings(meters.METER2));

        expect(result).toStrictEqual(expectedReadings[meters.METER2]);
    });

    it("should get the readings for the last seven days only for a meter with one reading from last month", () => {
        const now = Math.floor(Date.now() / 1000),
            nowDateFormat = new Date(now),
            lastMonth = new Date(nowDateFormat.getFullYear(), nowDateFormat.getMonth() - 1, nowDateFormat.getDate());

        const { getReadings } = readings({
            [meters.METER2]: [
                { time: now, reading: 0.26785 },
                { time: lastMonth.valueOf(), reading: 0.26785 }
            ],
        });

        const expectedReadings = {
            [meters.METER2]: [
                { time: now, reading: 0.26785 }
            ],
        };

        const result = getLastWeekReadings(getReadings(meters.METER2));

        expect(result).toStrictEqual(expectedReadings[meters.METER2]);
    });
});
