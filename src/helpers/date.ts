import constants from "../constants";

export default {
  getNextTwoWeeks: () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i < 15; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      const day = constants.DAYS[date.getDay()];

      dates.push({
        date,
        day,
        disable: false,
      });
    }
    return dates;
  },
  getTimeSlots: (
    startTime: string,
    endTime: string,
    break_start: string,
    break_end: string,
    duration: number
  ) => {
    const slots = [];

    const start =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const end =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    const breakStart =
      parseInt(break_start.split(":")[0]) * 60 +
      parseInt(break_start.split(":")[1]);
    const breakEnd =
      parseInt(break_end.split(":")[0]) * 60 +
      parseInt(break_end.split(":")[1]);

    const slotsCount = Math.floor((end - start) / duration);

    let slotStart = start;

    let slotEnd = slotStart + duration;

    for (let i = 0; i < slotsCount; i++) {
      if (slotStart >= breakStart && slotEnd <= breakEnd) {
        slotStart += duration;
        slotEnd += duration;
        continue;
      }

      const startHour = Math.floor(slotStart / 60);
      const startMinute = slotStart % 60;
      const endHour = Math.floor(slotEnd / 60);
      const endMinute = slotEnd % 60;

      slots.push({
        start: `${startHour < 10 ? "0" + startHour : startHour}:${
          startMinute < 10 ? "0" + startMinute : startMinute
        }`,
        end: `${endHour < 10 ? "0" + endHour : endHour}:${
          endMinute < 10 ? "0" + endMinute : endMinute
        }`,
        disable: false,
      });

      slotStart += duration;
      slotEnd += duration;
    }

    return slots;
  },
};
