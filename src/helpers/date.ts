import constants from "../constants";

export default {
  getNextTwoWeeks: () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i < 15; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const day = constants.DAYS[date.getDay()];
      dates.push({ date, day, disable: false });
    }
    return dates;
  },
};
