const { pricePlans } = require("./price-plans");
const { usageForAllPricePlans, usageCost } = require("../usage/usage");
const { getLastWeekReadings } = require("../readings/readings");

const recommend = (getReadings, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getReadings(meter)).sort((a, b) => extractCost(a) - extractCost(b))
    if("limit" in req.query) {
        return pricePlanComparisons.slice(0, req.query.limit);
    }
    return pricePlanComparisons;
};

const extractCost = (cost) => {
    const [, value] = Object.entries(cost).find( ([key]) => key in pricePlans)
    return value
}

const compare = (getData, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getData(meter));;
    return {
        smartMeterId: req.params.smartMeterId,
        pricePlanComparisons,
    };
};

const calculateCostForLastWeek = (getReadings, req) => {
    if(!("plan" in req.query)) {
        throw new Error("You must specify a plan");
    }
    const meter = req.params.smartMeterId,
        plan = req.query.plan,
        readingsForLastSevenDays = getLastWeekReadings(getReadings(meter));
    const costForLastSevenDays = usageCost(readingsForLastSevenDays, pricePlans[plan].rate);
    
    return { costForLastSevenDays };
};

module.exports = { recommend, compare, calculateCostForLastWeek };
