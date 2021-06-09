

export interface IHabit {
    Id: string,
    Description: string,
    Name: string,
    TargetDays: number,
    Trackings: IHabitTracker[],
    FinalTracking: IHabitTracker,
    CurrStreak:number,
    TotalFrequency:number
}

export interface IHabitTracker{
    Id: string,
    Date: Date,
    Frequency: number,
    HabitId: string,
    Streak: number
}

export interface IHabitCalendarEvent{
    title: string,
    startTime: Date,
    endTime: Date,
    allDay: boolean
}
