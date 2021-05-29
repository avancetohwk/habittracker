

export interface IHabit {
    Id: string,
    Description: string,
    Name: string,
    TargetDays: number,
    Trackings: IHabitTracker[],
    FinalTracking: IHabitTracker
}

export interface IHabitTracker{
    Id: string,
    Date: Date,
    Frequency: number,
    HabitId: number,
    Streak: number
}
