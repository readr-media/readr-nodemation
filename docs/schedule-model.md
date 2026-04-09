# Schedule Model

## Overview

The `schedule` object defines when a workflow should run automatically.

In this repository, schedule is workflow-level configuration rather than module-level configuration. It is used by the editor to let users configure execution timing and by scheduling logic to calculate the next run time.

## Schedule Shape

At a conceptual level, the schedule model looks like this:

```ts
type ExecutionFrequency = "daily" | "weekly" | "monthly" | "yearly";

type Schedule = {
  enabled: boolean;
  frequency: ExecutionFrequency;
  slots: ScheduleSlot[];
  lastUpdated?: string;
};
```

## Supported Frequencies

The current implementation supports exactly these values:

- `daily`
- `weekly`
- `monthly`
- `yearly`

This is a closed set in the current codebase. Documentation should not describe additional values unless the implementation is expanded.

## Slot Model

Each schedule contains one or more `slots`.

A slot is the smallest schedulable rule in the schedule model. The scheduler uses slots to calculate candidate execution times and then selects the next upcoming run.

All slots share these fields:

- `id`
- `time`
- `frequency`

Where:

- `id` is a stable identifier for editing and persistence
- `time` is an `HH:mm` string in 24-hour format
- `frequency` is the discriminator that determines the slot shape

The conceptual union looks like this:

```ts
type ScheduleSlotBase = {
  id: string;
  time: string;
};

type DailyScheduleSlot = ScheduleSlotBase & {
  frequency: "daily";
};

type WeeklyScheduleSlot = ScheduleSlotBase & {
  frequency: "weekly";
  daysOfWeek: Weekday[];
};

type MonthlyScheduleSlot = ScheduleSlotBase & {
  frequency: "monthly";
  dayOfMonth: number | null;
};

type YearlyScheduleSlot = ScheduleSlotBase & {
  frequency: "yearly";
  month: number | null;
  dayOfMonth: number | null;
};
```

## Slot Types

### Daily Slot

```json
{
  "id": "slot-daily-1",
  "time": "09:00",
  "frequency": "daily"
}
```

Meaning:

- run every day at `09:00`

### Weekly Slot

```json
{
  "id": "slot-weekly-1",
  "time": "09:00",
  "frequency": "weekly",
  "daysOfWeek": ["mon", "wed", "fri"]
}
```

Meaning:

- run every Monday, Wednesday, and Friday at `09:00`

### Monthly Slot

```json
{
  "id": "slot-monthly-1",
  "time": "09:00",
  "frequency": "monthly",
  "dayOfMonth": 15
}
```

Meaning:

- run on the 15th of every month at `09:00`

### Yearly Slot

```json
{
  "id": "slot-yearly-1",
  "time": "09:00",
  "frequency": "yearly",
  "month": 12,
  "dayOfMonth": 25
}
```

Meaning:

- run every year on December 25 at `09:00`

## Validation Rules

The current validation logic enforces the following:

- `enabled` must be a boolean
- `frequency` must be one of `daily`, `weekly`, `monthly`, `yearly`
- `slots` must be an array
- every slot must contain:
  - string `id`
  - valid `HH:mm` `time`
  - valid `frequency`

Additional slot-specific rules:

- `daily`
  - no extra fields required
- `weekly`
  - `daysOfWeek` must be a non-empty array of valid weekday values
- `monthly`
  - `dayOfMonth` must be an integer from `1` to `31`
- `yearly`
  - `month` and `dayOfMonth` must form a valid calendar date

There is also an important cross-field rule:

- every `slot.frequency` must exactly match the parent `schedule.frequency`

If a slot uses a different frequency than the parent schedule, the payload is invalid.

Invalid example:

```json
{
  "enabled": true,
  "frequency": "daily",
  "slots": [
    {
      "id": "slot-1",
      "time": "09:00",
      "frequency": "weekly",
      "daysOfWeek": ["mon"]
    }
  ]
}
```

This is invalid because the outer schedule is `daily` while the slot is `weekly`.

## Runtime Meaning

At runtime, scheduling logic iterates through all configured slots and converts them into candidate execution times.

Examples:

- a `daily` slot produces the next matching time today or tomorrow
- a `weekly` slot may produce multiple candidates, one for each selected weekday
- a `monthly` slot produces the next matching day in the current or next month
- a `yearly` slot produces the next matching date in the current or next year

The scheduler then sorts all candidates and returns the earliest upcoming one.

## Enabled Semantics

`enabled` means whether the schedule is active.

If `enabled` is `true`, the workflow is eligible for automatic scheduled execution.

If `enabled` is `false`, the workflow is not considered scheduled by this model.

This field should not be documented as meaning "run exactly once after publish" unless that behavior is defined elsewhere in the execution system. The current schedule model only describes whether automatic recurring scheduling is enabled.

## Examples

### Single Daily Slot

```json
{
  "enabled": true,
  "frequency": "daily",
  "slots": [
    {
      "id": "26f92647-cb9d-4b5d-a551-71155eb4dc80",
      "time": "09:00",
      "frequency": "daily"
    }
  ],
  "lastUpdated": "2026-01-29T02:23:06.624Z"
}
```

Meaning:

- the schedule is enabled
- the schedule frequency is `daily`
- there is one daily trigger rule
- the workflow should run every day at `09:00`

### Multiple Daily Slots

```json
{
  "enabled": true,
  "frequency": "daily",
  "slots": [
    {
      "id": "slot-a",
      "time": "09:00",
      "frequency": "daily"
    },
    {
      "id": "slot-b",
      "time": "18:00",
      "frequency": "daily"
    }
  ]
}
```

Meaning:

- the workflow has two daily trigger points
- the scheduler will consider both `09:00` and `18:00`
- the next run is whichever one comes next chronologically

## Relationship to README

`README.md` should only summarize the schedule model.

Use this document for:

- schedule terminology
- supported frequencies
- slot semantics
- validation rules
- representative examples
