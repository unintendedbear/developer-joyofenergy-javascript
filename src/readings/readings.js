const readings = (data) => ({
    getReadings: (meterId) => data[meterId] || [],
    setReadings: (meterId, readings) => {
        const currentReadings = data[meterId];
        data[meterId] = [...currentReadings, ...readings];
        return data[meterId];
    }
});

const getLastWeekReadings = (readings) => {
    const now = Math.floor(Date.now() / 1000),
        sevenDaysInSeconds = 7 * 24 * 60 * 60,
        lastWeek = now - sevenDaysInSeconds;
    return readings.filter((reading) => reading.time >= lastWeek);
}

module.exports = { getLastWeekReadings, readings };
