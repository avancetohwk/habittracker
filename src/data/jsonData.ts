export const Habits = [{
    "Id": "1",
    "Description":"",
    "Name":"CP",
    "TargetDays":30
},{
    "Id": "2",
    "Description":"",
    "Name":"MR",
    "TargetDays":7
},{
    "Id": "3",
    "Description":"",
    "Name":"SH",
    "TargetDays":45
}]


export const HabitTrackings = [{
    "Id":"sad",
    "Date": new Date("2021-05-16T00:00:00"),
    "Frequency":1,
    "HabitId":"1",
    "Streak":12
},{
    "Id":"sad",
    "Date": new Date("2021-05-17T00:00:00"),
    "Frequency":2,
    "HabitId":"1",
    "Streak":0
},{
    "Id":"sad",
    "Date": new Date("2021-05-19T00:00:00"),
    "Frequency":1,
    "HabitId":"1",
    "Streak":2
},{
    "Id":"sad",
    "Date": new Date("2021-05-22T00:00:00"),
    "Frequency":5,
    "HabitId":"1",
    "Streak":3
},{
    "Id":"sad",
    "Date": new Date("2021-05-27T00:00:00"),
    "Frequency":1,
    "HabitId":"1",
    "Streak":5
},{
    "Id":"sad",
    "Date": new Date("2021-05-30T00:00:00"),
    "Frequency":1,
    "HabitId":"1",
    "Streak":3
},{
    "Id":"sad",
    "Date": new Date("2021-05-31T00:00:00"),
    "Frequency":1,
    "HabitId":"1",
    "Streak":1
},{
    "Id":"sad",
    "Date": new Date("2021-05-15T00:00:00"),
    "Frequency":1,
    "HabitId":"2",
    "Streak":14
},{
    "Id":"sad",
    "Date": new Date("2021-05-18T00:00:00"),
    "Frequency":1,
    "HabitId":"2",
    "Streak":3
},{
    "Id":"sad",
    "Date": new Date("2021-05-22T00:00:00"),
    "Frequency":1,
    "HabitId":"2",
    "Streak":4
},{
    "Id":"sad",
    "Date": new Date("2021-05-28T00:00:00"),
    "Frequency":1,
    "HabitId":"2",
    "Streak":6
},{
    "Id":"sad",
    "Date": new Date("2021-05-12T00:00:00"),
    "Frequency":1,
    "HabitId":"3",
    "Streak":22
},{
    "Id":"sad",
    "Date": new Date("2021-05-18T00:00:00"),
    "Frequency":2,
    "HabitId":"3",
    "Streak":6
},{
    "Id":"sad",
    "Date": new Date("2021-05-22T00:00:00"),
    "Frequency":1,
    "HabitId":"3",
    "Streak":4
},{
    "Id":"sad",
    "Date": new Date("2021-05-29T00:00:00"),
    "Frequency":1,
    "HabitId":"3",
    "Streak":7
}];

export const HabitsWithTrackings = [{
    "Id": "1",
    "Description":"",
    "Name":"CP",
    "TargetDays":30,
    "Trackings": HabitTrackings.filter(h=>{return h.HabitId == "1"}),
    "FinalTracking":{
        "Id":"sad",
        "Date": new Date("2021-05-31T00:00:00"),
        "Frequency":1,
        "HabitId":"1",
        "Streak":1
    },
    "CurrStreak":1
},{
    "Id": "2",
    "Description":"",
    "Name":"MR",
    "TargetDays":7,
    "Trackings": HabitTrackings.filter(h=>{return h.HabitId == "2"}),
    "FinalTracking":{
        "Id":"sad",
        "Date": new Date("2021-05-28T00:00:00"),
        "Frequency":1,
        "HabitId":"2",
        "Streak":6
    },
    "CurrStreak":3
},{
    "Id": "3",
    "Description":"",
    "Name":"SH",
    "TargetDays":45,
    "Trackings": HabitTrackings.filter(h=>{return h.HabitId == "3"}),
    "FinalTracking":{
        "Id":"sad",
        "Date": new Date("2021-05-29T00:00:00"),
        "Frequency":1,
        "HabitId":"3",
        "Streak":7
    },
    "CurrStreak":2
}]



